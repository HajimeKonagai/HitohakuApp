<?php
namespace App\Traits;

use App\Observers\PlantObserver;
use Illuminate\Database\Eloquent\Model;

trait PlantObservable
{
	public static function bootPlantObservable()
	{
		self::observe(PlantObserver::class);
	}
}
