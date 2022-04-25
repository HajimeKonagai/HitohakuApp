<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Plant;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;


class PhotoController extends Controller
{
	// full
	public function full(Plant $plant)
	{
		return static::read_file($plant);
	}

	// large
	public function large(Plant $plant)
	{
		return static::read_file($plant, config('hitohaku.large_size'));
	}

	// small
	public function small(Plant $plant)
	{
		return static::read_file($plant, config('hitohaku.small_size'));
	}

	private static function read_file($plant, $size = 'full')
	{
		$file_name = $plant->file_name;

		$ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
		$rawname = str_replace('.'.$ext, '', $file_name);
		$personal_dir = substr($rawname, 0, -3).'xxx';
		$dirname = Storage::disk('local')->path('').'/'.$size.'/'.$personal_dir;
		$path = $dirname.'/'.$file_name;

		if (!file_exists($path))
		{
			foreach (['jpg', 'jpeg', 'png'] as $ext)
			{
				$rawname = $plant->number;
				$personal_dir = substr($rawname, 0, -3).'xxx';
				$dirname = Storage::disk('local')->path('').'/'.$size.'/'.$personal_dir;
				$path = $dirname.'/'.$rawname.'.'.$ext;

				if (file_exists($path))
				{
					$plant->file_name = $rawname.'.'.$ext;
					$plant->save();
					break;
				}
			}
		}

		if (!file_exists($path))
		{
			// $plant->file_name = '';
			// $plant->save();
			return \App::abort(404);
		}

		$mime = mime_content_type($path);
		header("Content-type: $mime name=$file_name");
		header("Content-Disposition: attachment; filename=$file_name");
		header("Content-Length: ".@filesize($path));
		header("Expires: 0");
		@readfile($path);
		exit;
	}

}
