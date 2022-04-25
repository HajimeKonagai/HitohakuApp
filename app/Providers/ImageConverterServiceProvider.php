<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use App\Services\ImageConverter;

class ImageConverterServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton('ImageConverter', function () {
            return new ImageConverter();
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
