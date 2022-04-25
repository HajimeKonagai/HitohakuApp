<?php
namespace App\Services;


use Illuminate\Support\Facades\Storage;
use \InterventionImage;
use Illuminate\Support\Facades\Log;

use App\Models\Plant;

class ImageConverter
{
	private static $full_dir_name = 'full';

	public static function get_full_dir_name()
	{
		return static::$full_dir_name;
	}
	public static function get_full_dir()
	{
		return Storage::disk('local')->path('').static::$full_dir_name;
	}

	public static function convertImage($path, $live = false, $overwrite = false, $full_only_overwrite = false, $db_check = true)
	{
		$results = [
			'message' => [],
			'error' => [],
		];

		$filename = basename($path);
		$full_dir = static::personalDir($filename, static::$full_dir_name, $live);

		$newpath = $full_dir.'/'.$filename;

		// すでに同じファイル名があるかチェック、overwrite が false なら実行しない
		$exists = static::fileExists($newpath);

		// パスが違えば移動(upload は直接 full に保存するため)
		if ($path != $newpath)
		{
			if ($full_only_overwrite || $overwrite || !in_array('full', $exists))
			{
				if ($live)
				{
					rename($path, $newpath);
					$results['message'][] = 'ファイルを保存'.$path.' => '.$newpath;
				}
			}
			else
			{
				$results['error'][] = 'full サイズの画像がすでに存在しています。';
			}
		}


		// $file から large, small
		if ($live)
		{
			$messages = static::saveSmallImages(
				$newpath,
				$full_only_overwrite || $overwrite || !in_array('full', $exists),
				$overwrite || !in_array('large', $exists),
				$overwrite || !in_array('small', $exists)
			);
			if ($messages)
			{
				foreach ($messages as $message)
				{
					$results['message'][] = $message;
				}
			}
		}

		// large と small の存在エラー
		if (!$overwrite && in_array('large', $exists)) $results['error'][] = 'large サイズの画像がすでに存在しています。';
		if (!$overwrite && in_array('small', $exists)) $results['error'][] = 'small サイズの画像がすでに存在しています。';


		// Plant に対象のデータがあるかチェック
		$rawname = static::rawname($newpath);
		$plant = Plant::find($rawname);
		if ($plant)
		{
			if (
				$plant->file_name != $filename &&
				($overwrite || !in_array('full', $exists))
			)
			{
				if ($live)
				{
					$plant->file_name = $filename;
					$plant->save();
				}
				$results['error'][] = 'データベースに登録されている拡張子が異なる可能性があるためファイル名を「'.$plant->file_name.'」=>「'.$filename.'」に変更します。';
			}
		}
		else
		{
			if($db_check) $results['error'][] = '資料番号「'.$rawname.'」のデータは、データベースに登録されていません。';
		}


		return $results;
	}


	public static function saveSmallImages($path, $save_full = true, $save_large = true, $save_small = true)
	{
		if (!$save_large && !$save_small) return;

		$messages = [];
		$filename = basename($path);

		$large_size = config('hitohaku.large_size');
		$large_dir = static::personalDir($filename, $large_size);
		$small_size = config('hitohaku.small_size');
		$small_dir = static::personalDir($filename, $small_size);

		$converted = InterventionImage::make($path);
		$converted->orientate(); // 勝手に回転させない
		$w = $converted->width();
		$h = $converted->height();
		if ($h < $w) // 横長の時は回転させる
		{
			$converted->rotate(-90);

			if ($save_full) // 回転させて保存
			{
				$converted->save($path);
				$messages[] = 'full サイズを回転して保存しました。';
			}

		}

		if ($save_large)
		{
			static::resize_image($converted, $large_size);
			$converted->save($large_dir.'/'.$filename);
			$messages[] = 'large サイズを保存しました。';
		}
		if ($save_small)
		{
			static::resize_image($converted, $small_size);
			$converted->save($small_dir.'/'.$filename);
			$messages[] = 'small サイズを保存しました。';
		}
		// メモリ開放
		$converted->destroy();

		return $messages;
	}


	public static function personalDir($path, $size, $makedir = true)
	{
		$to_dir = Storage::disk('local')->path('');
		$rawname = static::rawname($path);
		$personal_dir = substr($rawname, 0, -3).'xxx';

		if (!is_dir($to_dir.$size)                   && $makedir) mkdir($to_dir.$size);
		if (!is_dir($to_dir.$size.'/'.$personal_dir) && $makedir) mkdir($to_dir.$size.'/'.$personal_dir);

		return $to_dir.$size.'/'.$personal_dir;
	}



	// 拡張子を返す
	public static function extension($path)
	{
		return pathinfo($path, PATHINFO_EXTENSION);
	}

	// 拡張子なしの名前のみ(パスもなし)を返す
	public static function rawname($path)
	{
		$ext = static::extension($path);
		$filename = basename($path);
		return str_replace('.'.$ext, '', $filename);
	}



	// TODO できれば消す
	public static function fileExists($path)
	{
		$exists = [];
		$filename = basename($path);
		$full_dir = static::personalDir($filename, static::$full_dir_name, false);
		if (file_exists($full_dir.'/'.$filename)) $exists[] = 'full';

		$filename = basename($path);
		$large_size = config('hitohaku.large_size');
		$large_dir = static::personalDir($filename, $large_size, false);
		if (file_exists($large_dir.'/'.$filename)) $exists[] = 'large';

		$small_size = config('hitohaku.small_size');
		$small_dir = static::personalDir($filename, $small_size, false);
		if (file_exists($small_dir.'/'.$filename)) $exists[] = 'small';

		return $exists;
	}

	// ファイル名から3サイズのファイルのフルパスを返す。無ければ null
	public static function files($path_or_filename)
	{
		$filename = basename($path_or_filename);

		$files = [];

		$full_dir = static::personalDir($filename, static::$full_dir_name, false);
		$files[static::get_full_dir_name()] = file_exists($full_dir.'/'.$filename) ? $full_dir.'/'.$filename : null;

		$filename = basename($path);
		$large_size = config('hitohaku.large_size');
		$large_dir = static::personalDir($filename, $large_size, false);
		$files[$large_size] = file_exists($large_dir.'/'.$filename) ? $large_dir.'/'.$filename: null;

		$small_size = config('hitohaku.small_size');
		$small_dir = static::personalDir($filename, $small_size, false);
		$files[$small_size] = file_exists($small_dir.'/'.$filename) ? $small_dir.'/'.$filename: null;

		return $files;
	}

	public static function renameImages($from, $to, $overwrite = false)
	{
		$results = [
			'message' => [],
			'error' => [],
		];

		$from_exists = static::fileExists($from);
		if (!in_array('full' , $from_exists))  $results['error'][] = '変換前のファイル名「'.$from.'」のfullサイズのファイルが見つかりません。';
		if (!in_array('large', $from_exists)) $results['error'][] = '変換前ファイル名「'.$from.'」のlargeサイズのファイルが見つかりません。';
		if (!in_array('small', $from_exists)) $results['error'][] = '変換前ファイル名「'.$from.'」のsmallサイズのファイルが見つかりません。';

		if ($results['error']) return $results;

		if (static::fileExists($to) && ! $overwrite)
		{
			$results['error'][] = '変換先のファイル名「'.$to.'」はすでに存在しています。';
			return $results;
		}

		// エラーがなければ変換
		rename(static::personalDir($from, static::$full_dir_name, false).'/'.$from,
			static::personalDir($to, static::$full_dir_name, true).'/'.$to);
		rename(static::personalDir($from, config('hitohaku.large_size'), false).'/'.$from,
			static::personalDir($to, config('hitohaku.large_size'), true).'/'.$to);
		rename(static::personalDir($from, config('hitohaku.small_size'), false).'/'.$from,
			static::personalDir($to, config('hitohaku.small_size'), true).'/'.$to);

		$results['message'][] = 'ファイル名を「'.$from.'」から「'.$to.'」に変更しました。';

		return $results;
	}


	public static function resize_image(&$img, $resize)
	{
		$w = $img->width();
		$h = $img->height();
		$rw = $w >= $h ? $resize: null;
		$rh = $w <= $h ? $resize: null;
		// $img->fit($resize);
		$img->resize($rw, $rh, function ($constraint) {$constraint->aspectRatio();});
		$img->orientate(); // 勝手に回転させない
	}
}
