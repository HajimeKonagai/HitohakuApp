<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('photo/full/{plant}',  [App\Http\Controllers\PhotoController::class, 'full']);
Route::get('photo/large/{plant}', [App\Http\Controllers\PhotoController::class, 'large']);
Route::get('photo/small/{plant}', [App\Http\Controllers\PhotoController::class, 'small']);

Auth::routes();

Route::get('{all}', function ()
{
	return view('index');
})->where(['all' => '.*']);
