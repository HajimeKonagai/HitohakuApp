<?php

namespace App\Observers;

use Illuminate\Database\Eloquent\Model;
use App\Models\Plant;

class PlantObserver
{
	private static $en_strs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	private static $ja_strs = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';


	public function saving(Plant $plant)
	{
		$initial = strtoupper(mb_substr($plant->en_family_name,0, 1));
		if ($initial != '' && mb_strpos(static::$en_strs, $initial) === false) $initial = '';
		$plant->en_family_name_initial = $initial;

		$initial = strtoupper(mb_substr($plant->en_name,0, 1));
		if ($initial != '' && mb_strpos(static::$en_strs, $initial) === false) $initial = '';
		$plant->en_name_initial = $initial;

		$initial = $plant->jp_family_name;
		$initial = mb_convert_kana($initial, 'k', 'UTF-8');
		$initial = mb_convert_kana($initial, 'K', 'UTF-8');
		$initial = mb_substr($initial, 0, 1);
		if ($initial != '' && mb_strpos(static::$ja_strs, $initial) === false) $initial = '';
		$plant->jp_family_name_initial = $initial;

		$initial = $plant->jp_name;
		$initial = mb_convert_kana($initial, 'k', 'UTF-8');
		$initial = mb_convert_kana($initial, 'K', 'UTF-8');
		$initial = mb_substr($initial, 0, 1);
		if ($initial != '' && mb_strpos(static::$ja_strs, $initial) === false) $initial = '';
		$plant->jp_name_initial = $initial;
	}
}
