<?php

use App\Http\Controllers\Api\VehicleLocationController;
use Illuminate\Support\Facades\Route;

Route::post('vehicle-locations', VehicleLocationController::class)
    ->middleware(['throttle:120,1']);

