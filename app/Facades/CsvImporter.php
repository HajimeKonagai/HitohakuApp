<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;

class CsvImporter extends Facade
{

	protected static function getFacadeAccessor()
	{
		return 'CsvImporter';
	}
}
