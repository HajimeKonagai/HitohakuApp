<?php

namespace App\Http\Controllers;

use App\Models\Plant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PlantController extends Controller
{
	// TODO env or config or api request
	private static $per_page = 15;

	private static $en_strs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	private static $ja_strs = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

	public function initial($field)
	{
		$allow_fields = [
			'en_family_name',
			'jp_family_name',
			'en_name',
			'jp_name',
		];

		if (! in_array($field, $allow_fields)) return \App::abort(404);

		$initial_field = $field.'_initial';

		$subquery = Plant::public()
			->select($field, $initial_field)
			->groupBy($field, $initial_field)
			->getQuery();

		$plants = Plant::query()
			->select(DB::raw($initial_field.', COUNT('.$field.') as count'))
			->from($subquery, 'plant_group')
			->groupBy($initial_field)
			->get();

		if (substr($field, 0, 2) == 'en')
		{
			$atoz = static::toAtoZCount($plants);
		}
		else
		{
			$atoz = static::toKanaCount($plants);
		}

		foreach ($plants as $plant)
		{
			$initial = $plant->{$initial_field};

			if (!isset($atoz[$initial]))
			{
				Log::debug($initial.':'.$plant->number);

				if (substr($field, 0, 2) == 'en')
				{
					$atoz['other'] += $plant->count;
				}
				else
				{
					$atoz['他'] += $plant->count;
				}


				continue;
			}

			$atoz[$initial] += $plant->count;
		}

		return $atoz;
	}

	private static function toAtoZCount($plants)
	{
		$atoz = [];
		for ($i = 0; $i < mb_strlen(static::$en_strs); $i++)
		{
			$str = mb_substr(static::$en_strs, $i, 1);
			$atoz[$str] = 0;
		}
		$atoz['other'] = 0;

		return $atoz;

	}
	private static function toKanaCount($plants)
	{
		$atoz = [];
		for ($i = 0; $i < mb_strlen(static::$ja_strs); $i++)
		{
			$str = mb_substr(static::$ja_strs, $i, 1);
			$atoz[$str] = 0;
		}
		$atoz['他'] = 0;

		return $atoz;
	}



	public function family($field, $initial, Request $request)
	{
		$allow_fields = [
			'en_family_name',
			'jp_family_name',
		];

		if (! in_array($field, $allow_fields)) return \App::abort(404);

		$initial_field = $field.'_initial';


		if (mb_strlen($initial) != 1)
		{
			$initial = '';
		}

		$name_field = str_replace('_family', '', $field);

		$subquery = Plant::public()
			->select($name_field, $initial_field, $field)
			->groupBy($name_field, $initial_field, $field)
			->getQuery();

		return Plant::from($subquery)
			->select(DB::raw($field.' as name, COUNT('.$field.') as count'))
			->where($initial_field, $initial)
			->groupBy($field)
			->orderBy($field)
			->paginate($request->perPage ?: static::$per_page);
	}



	public function group($field, $initial, Request $request)
	{
		$allow_fields = [
			'en_family_name',
			'jp_family_name',
			'en_name',
			'jp_name',
		];

		if (! in_array($field, $allow_fields)) return \App::abort(404);


		if (strpos($field, 'family'))
		{
			$initial_field = $field;
			$field = str_replace('_family', '', $field);
		}
		else
		{
			$initial_field = $field.'_initial';

			if (mb_strlen($initial) != 1)
			{
				$initial = '';
			}
		}

		return Plant::public()
			->select(DB::raw(implode(',', $allow_fields).', COUNT(number) as count'))
			->where($initial_field, $initial)
			->groupBy($allow_fields)
			->orderBy($field)
			->paginate($request->perPage ?: static::$per_page);
	}


	/*
	 * 'en_family_name', => name
	 * 'jp_family_name', => name
	 * 'en_name', => initial
	 * 'jp_name', -> initial
	 */
	public function list(Request $request)
	{
		$allow_fields = [
			'en_family_name',
			'jp_family_name',
			'en_name',
			'jp_name',
		];

		$query = Plant::public();

		foreach ($allow_fields as $field)
		{
			$value = $request->{$field} ? $request->{$field} : '';
			$query->where($field, $value);
		}

		return $query->orderBy('number')
			->paginate($request->perPage ?: static::$per_page);
	}


	public function plant($field, $name)
	{
		$allow_fields = [
			'en_family_name',
			'jp_family_name',
			'en_name',
			'jp_name',
		];

		if (! in_array($field, $allow_fields)) return \App::abort(404);

		$initial_field = $field.'_initial';

		return Plant::public()
			->where($field, $name)
			->paginate();
	}

	public function detail(Plant $plant)
	{
		return $plant;
	}


	public function search(Request $request)
	{
		$allow_fields = [
			'number',
			'en_family_name',
			'jp_family_name',
			'en_name',
			'jp_name',
		];

		$q = Plant::public();

		if ($request->text)
		{
			$q->where(function($q) use($request, $allow_fields)
			{
				$first = true;
				foreach ($allow_fields as $field)
				{
					if (!$request->{$field}) continue;

					if ($first)
					{
						$q->where($field, 'LIKE', '%'.$request->text.'%');
						$first = false;
						continue;
					}
					$q->orWhere($field, 'LIKE', '%'.$request->text.'%');

					Log::debug(!$request->{$field});
				}
			});
		}

		$selects = ['en_name', 'jp_name', 'en_family_name', 'jp_family_name'];
		$orderBy = 'jp_name';
		if (true || $request->number)
		{
			$selects[] = 'number';
			$orderBy = 'number';
		}

		return $q->select($selects)
			// ->groupBy($selects)
			->orderBy($orderBy)
			->paginate($request->perPage ?: static::$per_page);
	}



	public function random($limit)
	{
		return Plant::public()
			->orderBy(DB::raw('RAND()'))
			->take($limit)->get();
	}

}
