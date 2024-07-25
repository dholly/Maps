<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\RouteController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('api')->group(function () {
    Route::apiResource('locations', LocationController::class);
    Route::apiResource('routes', RouteController::class);
});

// Новые маршруты для админ-панели
Route::prefix('admin')->group(function () {
    Route::get('/locations', [AdminController::class, 'locations']);
    Route::get('/routes', [AdminController::class, 'routes']);
});
