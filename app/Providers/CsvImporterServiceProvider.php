<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use App\Services\CsvImporter;

class CsvImporterServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton('CsvImporter', function () {
            return new CsvImporter();
        });


		/*
		$this->app->bind(
			'ImageConverter',
			'App\Http\Services\ImageConverter'
      );
	  */
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
