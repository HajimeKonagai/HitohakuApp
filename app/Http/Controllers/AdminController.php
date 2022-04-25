<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use \InterventionImage;
use Illuminate\Support\Facades\Log;
use App\Facades\ImageConverter;
use App\Models\Plant;
use App\Models\Setting;
use Illuminate\Support\Facades\Validator;
// use App\Http\Requests\PlantRequest;


class AdminController extends Controller
{
	private static $per_page = 25;

	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index(Request $request)
	{
		// 検索
		$q = Plant::query();

		foreach ([
			'number',
			'en_family_name',
			'jp_family_name',
			'en_name',
			'jp_name',
		] as $column)
		{
			if ($request->{$column})
			$q->where($column, 'LIKE', '%'.$request->{$column}.'%');
		}

		if ($request->order && $request->order_by)
		{
			$q->orderBy($request->order_by, $request->order);
		}

		return $q
			// ->groupBy($selects)
			// ->orderBy($orderBy)
			->paginate($request->perPage ?: static::$per_page);

	}

	/**
	 * Display the specified resource.
	 *
	 * @param  \App\Models\Plant  $plant
	 * @return \Illuminate\Http\Response
	 */
	public function show(Plant $plant)
	{
		//
	}


	public function store(Request $request)
	{
		if ( $request->file('file') ) Log::debug($request->file('file')->getClientOriginalName());

		$validator = Validator::make($request->all(), Plant::rules());

		if ($validator->fails())
		{
			return response()->json(['errors' => $validator->errors()], 500);
		}

		$data = $request->all();

		if ( $request->file('file') )
		{
			$request->validate([
				'file' => 'required|file|image|mimes:png,jpeg,jpg'
			]);

			$overwrite = $request->overwrite;

			$filename = $request->number.'.'.ImageConverter::extension($request->file('file')->getClientOriginalName());

			Log::debug($filename);

			// 写真の名前を変更して upload 処理
			$results = static::saveImage($filename, $request->file('file'), $live = true, $overwrite, $full_only_overwrite = $overwrite, $db_check = false);
			Log::debug($results);

			if ($results['error'])
			{
				return response()->json(['errors' => 
					['file' => $results['error']]
				], 500);
			}

			// 保存データにファイル名を足す
			$data['file_name'] = $filename;
		}

		$plant = Plant::create($data);

		\App\Models\Log::create([
			'job' => 'update',
			'content' => '「'.$plant->number.'」を作成',
			'number' => $plant->number,
			'revision' => $plant->toJson(),
		]);


		return $plant
			? response()->json($plant, 201)
			: response()->json([], 500);
	}



	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \App\Models\Plant  $plant
	 * @return \Illuminate\Http\Response
	 */
	public function update(Request $request, Plant $plant)
	{
		$original_number = $plant->number;
		$originalJson = $plant->toJson();
		$plant->fill($request->all());
		$validator = Validator::make($plant->toArray(), Plant::rules($original_number));

		if ($validator->fails())
		{
			return response()->json(['errors' => $validator->errors()], 500);
		}

		// 資料番号の変更があれば写真ファイル名も変更する
		if ($plant->number != $original_number)
		{
			if ($plant->file_name)
			{
				$filename = $request->number.'.'.ImageConverter::extension($plant->file_name);
				$original_exists = ImageConverter::fileExists($plant->file_name);
				Log::debug($original_exists);
				if (in_array('full', $original_exists) && in_array('large', $original_exists) && in_array('small', $original_exists))
				{
					$results = ImageConverter::renameImages($plant->file_name, $filename, $overwrite = true);
				Log::debug($results);
					if ($results['error'])
					{
						return response()->json(['errors' => 
							['file' => $results['error']]
						], 500);
					}
				}
				else if (count($original_exists) != 3 && count($original_exists) != 0)
				{
					if (! $request->file('file') ) // 後で上書きするなら無視する
					{
						return response()->json(['errors' => 
							['file' => [
								'ファイルのfull,large,smallが揃っていません、手動でのアップをせずにアップロードや写真の入れ替えでファイルをアップしてください。',
							]]
						], 500);
					}

				}

				$plant->file_name = $filename;
			}
		}



		if ( $request->file('file') )
		{
			$request->validate([
				'file' => 'required|file|image|mimes:png,jpeg,jpg'
			]);

			$overwrite = true; // 更新時に指定している時点で上書き前提

			$filename = $plant->number.'.'.ImageConverter::extension($request->file('file')->getClientOriginalName());

			Log::debug($filename);

			// 写真の名前を変更して upload 処理
			$results = static::saveImage($filename, $request->file('file'), $live = true, $overwrite, $full_only_overwrite = $overwrite, $db_check = false);

			if ($results['error'])
			{
				return response()->json(['errors' => 
					['file' => $results['error']]
				], 500);
			}

			$plant->file_name = $filename;
			// 保存データにファイル名を足す(一応)
		}

		\App\Models\Log::create([
			'job' => 'update',
			'content' => '「'.$plant->number.'」を更新',
			'number' => $plant->number,
			'revision' => $originalJson,
		]);

		return $plant->update()
			? response()->json($plant) // 200
			: response()->json([], 500);
	}



	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  \App\Models\Plant  $plant
	 * @return \Illuminate\Http\Response
	 */
	public function destroy(Plant $plant)
	{
		// TODO ファイルがあれば削除
		$file_name = $plant->file_name;
		$ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
		$rawname = str_replace('.'.$ext, '', $file_name);
		$personal_dir = substr($rawname, 0, -3).'xxx';

		foreach ([
			'full',
			config('hitohaku.large_size'),
			config('hitohaku.small_size'),
		] as $size)
		{
			$dirname = Storage::disk('local')->path('').'/'.$size.'/'.$personal_dir;
			$path = $dirname.'/'.$file_name;

			
			if (file_exists($path) && !is_dir($path))
			{
				// delete
				unlink($path);
			}
			else
			{
				foreach (['jpg', 'jpeg', 'png'] as $ext)
				{
					$rawname = $plant->number;
					$personal_dir = substr($rawname, 0, -3).'xxx';
					$dirname = Storage::disk('local')->path('').'/'.$size.'/'.$personal_dir;
					$path = $dirname.'/'.$rawname.'.'.$ext;

					if (file_exists($path))
					{
						// delete
						unlink($path);
					}
				}
			}
		}

		\App\Models\Log::create([
			'job' => 'destroy',
			'content' => '「'.$plant->number.'」を削除',
			'number' => $plant->number,
			'revision' => $plant->toJson(),
		]);

		$plant->delete();
	}


	public function log(Request $request)
	{
		$date = strtotime($request->date) ?  date('Y-m-d', strtotime($date->date)): date('Y-m-d');

		// 検索
		$q = \App\Models\Log::where('created_at', 'LIKE', $date.'%')
			->orderBy('created_at', 'desc');

		if ($request->filter)
		{
			$q->where('content', 'LIKE', '%'.$request->filter.'%');
		}

		if ($request->order && $request->order_by)
		{
			$q->orderBy($request->order_by, $request->order);
		}


		return $q->paginate($request->perPage ?: 100);
	}


	public function revision(Plant $plant)
	{
		// 検索
		$q = \App\Models\Log::where('number', $plant->number);

		return $q->get();
	}



	public function report(Request $request)
	{
		// 検索
		$q = \App\Models\Report::query();

		if ($request->filter)
		{
			$q->where('job', 'LIKE', '%'.$request->filter.'%');
			$q->orWhere('content', 'LIKE', '%'.$request->filter.'%');
			$q->orWhere('number', 'LIKE', '%'.$request->filter.'%');
		}

		if ($request->order && $request->order_by)
		{
			$q->orderBy($request->order_by, $request->order);
		}
		else
		{
			$q->orderBy('id', 'asc');
		}

		return $q->paginate($request->perPage ?: 100);
	}




	public function import(Request $request)
	{
		$results = [];

		$live = $request->live;
		$emptyValue = $request->emptyValue;
		$multiple = $request->multiple;
		$create = $request->create;
		$update = $request->update;
		$reportNotExistMedia = $request->reportNotExistMedia;

		$full_size = ImageConverter::get_full_dir_name();
		$large_size = config('hitohaku.large_size');
		$small_size = config('hitohaku.small_size');


		Log::debug($request->all());

		foreach ($request->posts as $index => $post)
		{
			$results[$index] = [
				'message' => [],
				'warning' => [],
				'error' => [],
				'posts' => [],
			];


			$plants = false;
			if ($request->search && $request->search['to'])
			{
				$plants = Plant::where($request->search['to'], $request->search['compare'], $post['search'])
					->get();
			}

			if (!$plants || $plants->isEmpty()) // 新規作成
			{
				if (!$create)
				{
					$results[$index]['warning'][] = '新規作成が許可されていません。';
					continue;
				}


				$create_fields = [];
				foreach ($post['fields'] as $key => $value)
				{
					if (!$value && !$emptyValue) // 空値で上書きしない設定
					{
						continue;
					}
					$create_fields[$key] = $value;
				}

				$validator = Validator::make($create_fields, Plant::rules());
				if ($validator->fails())
				{
					foreach ($validator->errors()->all() as $error)
					{
						$results[$index]['error'][] = $error;
					}
					continue;
				}

				$results[$index]['message'][] = '新規作成します。';

				if ($live)
				{
					$plant = Plant::create($create_fields);
					$results[$index]['posts'][] = $plant->toArray();

					\App\Models\Log::create([
						'job' => 'create',
						'content' => '「'.$plant->number.'」を作成',
						'number' => $plant->number,
						'revision' => $plant->toJson(),
					]);
				}


				if ($reportNotExistMedia)
				{
					$filename = $create_fields['file_name'];

					if (!$filename)
					{
						$results[$index]['warning'][] = 'ファイル名(file_name)が指定されていません。';
					}
					else
					{
						if ( ! file_exists(ImageConverter::personalDir($filename, $full_size, false).'/'.$filename) )
						{
							$results[$index]['warning'][] = $filename."が存在しません。\n";
						}
						else
						{
							if ( ! file_exists(ImageConverter::personalDir($filename, $large_size, false).'/'.$filename) )
							{
								$results[$index]['warning'][] = $filename."のlargeファイルが存在しません。\n";
							}
							if ( ! file_exists(ImageConverter::personalDir($filename, $small_size, false).'/'.$filename) )
							{
								$results[$index]['warning'][] = $filename."のsmallファイルが存在しません。\n";
							}
						}
					}
				}
			}
			else
			{
				if (!$update)
				{
					$results[$index]['error'][] = '更新が許可されていません。';
					continue;
				}

				if (!$multiple && count($plants) > 1) // 複数への更新の許可がない
				{
					$results[$index]['error'][] = '更新対象が2つ以上あります。更新したい場合は「検索結果が2つ以上一致した際に、全てに値を入れる」を許可してください。';

					foreach ($plants as $plant)
					{
						$results[$index]['posts'][] = $plant->toArray();
					}
					continue;
				}

				foreach ($plants as $plant)
				{
					$validator = Validator::make($post['fields'], Plant::rules($plant->number));
					if ($validator->fails())
					{
						Log::debug('validator fail');
						foreach ($validator->errors()->all() as $error)
						{
							$results[$index]['error'][] = $error;
							Log::debug($error);
						}
						continue;
					}


					$update_fields = [];
					foreach ($post['fields'] as $key => $value)
					{
						if (strval($value) != strval($plant->{$key}))
						{
							if ($key == 'collect_date' && strtotime($value) == strtotime($plant->{$key}))
							{
								continue;
							}
							if ($value == '' && !$emptyValue) // 空値で上書きしない設定
							{
								continue;
							}
							$results[$index]['message'][] = $key.': '.'「'.$plant->{$key}.'」=>「'.$value.'」';
							$update_fields[$key] = $value;
						}
					}
					if ($update_fields)
					{

						$results[$index]['message'][] = $plant->{$request->search['to']}.'を更新します。';
						if ($live)
						{
							$plant->fill($update_fields)
								->save();

							\App\Models\Log::create([
								'job' => 'update',
								'content' => '「'.$plant->number.'」を更新',
								'number' => $plant->number,
								'revision' => $plant->toJson(),
							]);
						}
					}
					else
					{
						$results[$index]['message'][] = '変更箇所がありません。';
					}

					$results[$index]['posts'][] = $plant->toArray();

					if ($reportNotExistMedia)
					{
						$filename = $plant->file_name;
						if ( ! file_exists(ImageConverter::personalDir($filename, $full_size, false).'/'.$filename) )
						{
							$results[$index]['error'][] = $plant->number."のファイルが存在しません。\n";
						}
						else
						{
							if ( ! file_exists(ImageConverter::personalDir($filename, $large_size, false).'/'.$filename) )
							{
								$results[$index]['error'][] = $plant->number."のlargeファイルが存在しません。\n";
							}
							if ( ! file_exists(ImageConverter::personalDir($filename, $small_size, false).'/'.$filename) )
							{
								$results[$index]['error'][] = $plant->number."のsmallファイルが存在しません。\n";
							}
						}
					}
				}
			}

			// reportNotExistMedia

		}

		if ($live)
		{
			foreach ($results as $result)
			{
				if ($result['error'])
				{
					foreach ($result['error'] as $error)
					{
						\App\Models\Log::create([
							'job' => 'import:error',
							'content' => $error,
						]);
					}
					\App\Models\Log::create([
						'job' => 'import:error',
						'content' => 'インポートのエラー',
						'revision' => json_encode($results),
					]);
				}
				else
				{
					/*
					\App\Models\Log::create([
						'job' => 'import',
						'content' => 'インポートに成功',
						'revision' => json_encode($results),
					]);
					*/
				}
			}
		}

		// error or message

		return $results;
	}


	/**
	 * 写真の保存 1つずつ
	 * 
	 */
	public function upload(Request $request)
	{
		$request->validate([
			'file' => 'required|file|image|mimes:png,jpeg,jpg'
		]);
		$file = $request->file('file');
		$live = $request->live;
		$rotateHorizontal = $request->rotateHorizontal;
		$overwrite = $request->overwrite;
		$reportNotExistDb = $request->reportNotExistDb;

		Log::debug($overwrite);

		/*
		// ファイル名に拡張子がついてなかったり間違っている可能性があるので、実際のファイルの拡張子を足す
		$filename = str_replace('.'.ImageConverter::extension($request->name), '', $request->name).'.'.ImageConverter::extension($request->file('file')->getClientOriginalName());
		$full_dir = ImageConverter::personalDir($filename, ImageConverter::get_full_dir_name(), $live);
		$path = $full_dir.'/'.$filename;

		$message = false;
		$error = false;
		if (!file_exists($path) || $overwrite)
		{
			if ($live)
			{
				$file->storeAs(str_replace(Storage::disk('local')->path(''), '', $full_dir), $filename, 'local'); // rename で良い？
				$message = 'full サイズを保存しました。';
			}
		}
		else
		{
			$error = 'full サイズの画像がすでに存在しています。';
		}

		$results = ImageConverter::convertImage($path, $live, $overwrite, $full_only_overwrite = $rotateHorizontal, $db_check = $reportNotExistDb);

		if ($message)
		{
			array_unshift($results['message'], $message);
		}
		if ($error)
		{
			array_unshift($results['error'], $error);
		}
			*/

		$results = static::saveImage($request->name, $request->file('file'), $live, $overwrite, $full_only_overwrite = $rotateHorizontal, $db_check = $reportNotExistDb);

		Log::debug([
			'index' => $request->index,
			'results' => $results,
		]);


		if ($live)
		{
			if ($results['error'])
			{
				foreach ($results['error'] as $error)
				{
					\App\Models\Log::create([
					'job' => 'upload:error',
					'content' => $error,
					]);
				}

				\App\Models\Log::create([
					'job' => 'upload:error',
					'content' => 'アップロードのエラー',
					'revision' => json_encode($results),
				]);
			}
			else
			{
				\App\Models\Log::create([
					'job' => 'upload',
					'content' => 'アップロードに成功',
					'revision' => json_encode($results),
				]);
			}
		}


		return [
			'index' => $request->index,
			'results' => $results,
		];
	}


	/*
	 * store, upload, update から使う
	 */
	private static function saveImage($name, $file, $live = false, $overwrite = false, $full_only_overwrite = false, $db_check = true)
	{

		// ファイル名に拡張子がついてなかったり間違っている可能性があるので、実際のファイルの拡張子を足す
		$filename = str_replace('.'.ImageConverter::extension($name), '', $name).'.'.ImageConverter::extension($file->getClientOriginalName());
		$full_dir = ImageConverter::personalDir($filename, ImageConverter::get_full_dir_name(), $live);
		$path = $full_dir.'/'.$filename;

		$message = false;
		$error = false;
		if (!file_exists($path) || $overwrite)
		{
			if (file_exists($path))
			{
				$message = '画像を上書きします。';
			}
			else
			{
				$message = '画像を保存します。';
			}

			if ($live)
			{
				$file->storeAs(str_replace(Storage::disk('local')->path(''), '', $full_dir), $filename, 'local'); // rename で良い？
			}
		}
		else
		{
			$error = 'full サイズの画像がすでに存在しています。';
		}

		$results = ImageConverter::convertImage($path, $live, $overwrite, $full_only_overwrite, $db_check);

		if ($message)
		{
			array_unshift($results['message'], $message);
		}
		if ($error)
		{
			array_unshift($results['error'], $error);
		}

		return $results;
	}








	/**
	 * setting
	 */
	public function setting_load(string $key)
	{
		$setting = Setting::where('key', $key)->first();

		if ($setting)
		{
			return $setting;
		}

		// TODO default setting?
		return [];
	}

	public function setting_save(string $key, Request $request)
	{
		$setting = Setting::where('key', $key)->first();

		if ($setting)
		{
			$setting->value = $request->value;
			$setting->save();
		}
		else
		{
			$setting = Setting::create([
				'key' => $key,
				'value' => $request->value,
			]);
		}
	}

}
