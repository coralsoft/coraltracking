<?php

use App\Models\Device;
use App\Models\Position;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

test('POST /api/bus-locations updates device last location and stores position history', function () {
    Carbon::setTestNow(Carbon::parse('2026-02-04 12:00:00'));

    $user = User::factory()->create();
    $vehicle = Vehicle::create([
        'user_id' => $user->id,
        'name' => 'Bus 01',
        'plate' => 'BUS-001',
        'color' => 'White',
        'device_id' => null,
    ]);

    $device = Device::create([
        'user_id' => $user->id,
        'identifier' => '123',
        'name' => 'GPS 123',
        'status' => 'offline',
    ]);

    // Link device to vehicle (vehicles.device_id)
    $vehicle->update(['device_id' => $device->id]);

    $payload = [
        'serial_number' => '123',
        'latitude' => 24.1301761,
        'longitude' => -110.3111813,
        'speed' => 0,
    ];

    $this->postJson('/api/bus-locations', $payload)
        ->assertOk()
        ->assertJsonPath('ok', true)
        ->assertJsonPath('device.identifier', '123')
        ->assertJsonPath('vehicle.id', $vehicle->id);

    $device->refresh();

    expect((float) $device->last_latitude)->toBe((float) $payload['latitude']);
    expect((float) $device->last_longitude)->toBe((float) $payload['longitude']);
    expect($device->last_speed)->toBe('0.00'); // decimal:2 cast
    expect($device->status)->toBe('stopped');
    expect($device->last_recorded_at?->toISOString())->toBe(Carbon::now()->toISOString());

    $position = Position::query()->latest('id')->first();
    expect($position)->not->toBeNull();
    expect($position->device_id)->toBe($device->id);
    expect((float) $position->latitude)->toBe((float) $payload['latitude']);
    expect((float) $position->longitude)->toBe((float) $payload['longitude']);
    expect($position->recorded_at->toISOString())->toBe(Carbon::now()->toISOString());
});

test('POST /api/bus-locations returns 404 for unknown serial_number', function () {
    $this->postJson('/api/bus-locations', [
        'serial_number' => 'does-not-exist',
        'latitude' => 24.0,
        'longitude' => -110.0,
        'speed' => 10,
    ])->assertStatus(404)->assertJsonPath('ok', false);
});

