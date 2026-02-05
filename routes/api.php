<?php

use App\Http\Controllers\Api\BusLocationController;
use Illuminate\Support\Facades\Route;

Route::post('bus-locations', BusLocationController::class)
    ->middleware(['throttle:120,1']);

