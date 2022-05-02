<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// login
Route::post('login', [\App\Http\Controllers\LoginController::class, 'login']);
Route::post('logout', [\App\Http\Controllers\LoginController::class, 'logout']);

// public api
Route::get('initial/{field}',  [\App\Http\Controllers\PlantController::class, 'initial']);
Route::get('family/{field}/{initial}', [\App\Http\Controllers\PlantController::class, 'family']);
Route::get('group/{field}/{initial}', [\App\Http\Controllers\PlantController::class, 'group']);
Route::get('list', [\App\Http\Controllers\PlantController::class, 'list']);
Route::get('detail/{plant}', [\App\Http\Controllers\PlantController::class, 'detail']);
Route::get('search', [\App\Http\Controllers\PlantController::class, 'search']);
Route::get('rand/{limit}', [\App\Http\Controllers\PlantController::class, 'random']);

// fetch photo by key

Route::group(['middleware' => 'auth:sanctum'], function()
{
	// admin index
	Route::get( 'admin/index',  [\App\Http\Controllers\AdminController::class, 'index']);
	Route::get( 'admin/all',  [\App\Http\Controllers\AdminController::class, 'all']);
	Route::get( 'admin/count',  [\App\Http\Controllers\AdminController::class, 'count']);
	Route::post('admin/import', [\App\Http\Controllers\AdminController::class, 'import']);
	Route::post('admin/upload', [\App\Http\Controllers\AdminController::class, 'upload']);
	Route::post('admin/store', [\App\Http\Controllers\AdminController::class, 'store']);
	Route::put('admin/update/{plant}', [\App\Http\Controllers\AdminController::class, 'update']);
	Route::delete('admin/destroy/{plant}', [\App\Http\Controllers\AdminController::class, 'destroy']);
	Route::get('admin/log', [\App\Http\Controllers\AdminController::class, 'log']);
	Route::get('admin/revision/{plant}', [\App\Http\Controllers\AdminController::class, 'revision']);
	
	Route::get('admin/report', [\App\Http\Controllers\AdminController::class, 'report']);

	// admin delete
	// admin destroy


	Route::get( 'admin/setting/{key}',  [\App\Http\Controllers\AdminController::class, 'setting_load']);
	Route::post( 'admin/setting/{key}',  [\App\Http\Controllers\AdminController::class, 'setting_save']);

	/*
	Route::get( 'admin/setting/csv',  [\App\Http\Controllers\AdminController::class, 'setting_csv_load']);
	Route::post( 'admin/setting/csv',  [\App\Http\Controllers\AdminController::class, 'setting_csv_save']);
	Route::get( 'admin/setting/media',  [\App\Http\Controllers\AdminController::class, 'setting_media_load']);
	Route::post( 'admin/setting/media',  [\App\Http\Controllers\AdminController::class, 'setting_media_save']);
	*/

	Route::get('/user', function (Request $request) { return $request->user(); });
});
