<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;

class ImageConverter extends Facade
{

	protected static function getFacadeAccessor()
	{
		return 'ImageConverter';
	}
}
