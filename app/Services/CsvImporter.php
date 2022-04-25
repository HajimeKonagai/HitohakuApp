<?php
namespace App\Services;


use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use SplFileObject;
use App\Models\Plant;

class CsvImporter
{
	private static $en_strs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	private static $ja_strs = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

	/*
	 *
	 * $index log 用
	 * @return $errors => [] で正常終了
	 */
	public static function import_line($line, $format, $live = false, $enable_update = false)
	{

		$errors = [];
		$plant = false;
		$number = '';

		// number unique
		$number_index = array_search('number', $format);
		$number = '';
		if ($number_index === false)
		{
			// number 空だったら filename を元に作る
			$file_name_index = array_search('file_name', $format);
			if ($file_name_index === false)
			{
				$errors[] = "number および file_name のインポート対象が指定あれていません。インポートをスキップします。";
				return $errors;
			}
			$file_name = $line[$file_name_index];
			$f_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
			$number = str_replace('.'.$f_ext, '', $file_name);
		}
		else
		{
			$number = $line[$number_index];
		}

		// date
		$date = null;
		$date_index = array_search('collect_date', $format);
		if ($date_index !== false)
		{
			$time = strtotime($line[$date_index]);
			if ($time)
			{
				$date = date('Y-m-d', $time);
			}
		}


		if ($plant = Plant::find($number))
		{
			if (! $enable_update )
			{
				$errors[] = $number." はすでに登録されています。インポートをスキップします。";
				return $errors;
			}

			foreach ($format as $column => $field)
			{
				$plant->{$field} = $line[$column];
			}

			$plant->number = $number;
			$plant->collect_date = $date;

			if ($live) $plant->save();

			$errors[] = $plane->number.'を更新。';
		}
		else // create
		{
			$values = [];
			foreach ($format as $column => $field)
			{
				$values[$field] = $line[$column];
			}

			$values['number'] = $number;
			$values['collect_date'] = $date;

			if ($live) $plant = Plant::create($values);
		}

		// initial のデバッグ
		if ($plant)
		{
			if (!$plant->en_family_name_initial) $errors[] = "\t".$number.' 科名(en)「'.$plant->en_family_name."」の頭文字がA-Z以外。「その他」で登録";
			if (!$plant->en_name_initial)        $errors[] = "\t".$number.' 学名(en)「'.$plant->en_name."」の頭文字がA-Z以外。「その他」で登録";
			if (!$plant->jp_family_name_initial) $errors[] = "\t".$number.' 科名(和)「'.$plant->jp_family_name."」の頭文字が五十音以外。「その他」で登録";
			if (!$plant->jp_name_initial)        $errors[] = "\t".$number.' 種名(和)「'.$plant->jp_name."」の頭文字が五十音以外。「その他」で登録";
		}

		return $errors;
	}

}
