<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\Position;
use Illuminate\Http\Request;

class BusLocationController extends Controller
{
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'serial_number' => 'required|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'speed' => 'nullable|numeric|min:0',
        ]);

        $device = Device::where('identifier', $validated['serial_number'])->first();

        if (! $device) {
            return response()->json([
                'ok' => false,
                'error' => 'device_not_found',
                'message' => 'Device not found for provided serial_number.',
            ], 404);
        }

        $now = now();
        $speed = array_key_exists('speed', $validated) ? $validated['speed'] : null;
        $status = ($speed !== null && (float) $speed > 0) ? 'moving' : 'stopped';

        $device->update([
            'last_latitude' => (float) $validated['latitude'],
            'last_longitude' => (float) $validated['longitude'],
            'last_recorded_at' => $now,
            'status' => $status,
            'last_speed' => $speed !== null ? (float) $speed : null,
        ]);

        $position = Position::create([
            'device_id' => $device->id,
            'latitude' => (float) $validated['latitude'],
            'longitude' => (float) $validated['longitude'],
            'recorded_at' => $now,
            'speed' => $speed !== null ? (float) $speed : null,
            'heading' => null,
        ]);

        return response()->json([
            'ok' => true,
            'device' => [
                'id' => $device->id,
                'identifier' => $device->identifier,
            ],
            'vehicle' => $device->vehicle ? [
                'id' => $device->vehicle->id,
                'name' => $device->vehicle->name,
            ] : null,
            'position' => [
                'id' => $position->id,
                'recorded_at' => $position->recorded_at->toIso8601String(),
            ],
        ]);
    }
}

