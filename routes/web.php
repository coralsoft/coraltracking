<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\VehicleController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('landing', [
        'canRegister' => Route::has('register'),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('monitoring', [DashboardController::class, 'monitoring'])->name('monitoring');
    Route::get('dashboard/monitoring-positions', [DashboardController::class, 'monitoringPositions'])->name('dashboard.monitoringPositions');
    Route::get('history', [DashboardController::class, 'history'])->name('history');
    Route::get('dashboard/positions', [DashboardController::class, 'positions'])->name('dashboard.positions');
    Route::get('dashboard/positions-by-tags', [DashboardController::class, 'positionsByTags'])->name('dashboard.positionsByTags');

    Route::resource('vehicles', VehicleController::class)->except(['show']);
    Route::post('vehicles/{vehicle}/device', [VehicleController::class, 'storeDevice'])->name('vehicles.device.store');
    Route::put('vehicles/{vehicle}/device/{device}', [VehicleController::class, 'updateDevice'])->name('vehicles.device.update');
    Route::delete('vehicles/{vehicle}/device/{device}', [VehicleController::class, 'destroyDevice'])->name('vehicles.device.destroy');
    Route::put('vehicles/{vehicle}/assign-device', [VehicleController::class, 'assignDevice'])->name('vehicles.device.assign');

    Route::get('devices/create', [DeviceController::class, 'create'])->name('devices.create');
    Route::post('devices', [DeviceController::class, 'store'])->name('devices.store');

    Route::get('tags', [TagController::class, 'index'])->name('tags.index');
    Route::post('tags', [TagController::class, 'store'])->name('tags.store');
    Route::put('tags/{tag}', [TagController::class, 'update'])->name('tags.update');
    Route::delete('tags/{tag}', [TagController::class, 'destroy'])->name('tags.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
