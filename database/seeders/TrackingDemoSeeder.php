<?php

namespace Database\Seeders;

use App\Models\Device;
use App\Models\Position;
use App\Models\User;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TrackingDemoSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'demo@coraltracking.test'],
            [
                'name' => 'Demo User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        // Create demo vehicles
        $vehicles = [
            ['name' => 'Bus 01', 'plate' => 'BUS-001', 'color' => 'White'],
            ['name' => 'Bus 02', 'plate' => 'BUS-002', 'color' => 'Blue'],
            ['name' => 'Van 01', 'plate' => 'VAN-101', 'color' => 'Gray'],
        ];

        $vehicleModels = [];
        foreach ($vehicles as $v) {
            $vehicleModels[] = Vehicle::firstOrCreate(
                ['user_id' => $user->id, 'plate' => $v['plate']],
                ['name' => $v['name'], 'color' => $v['color']]
            );
        }

        // Create devices (one per vehicle for demo) and link them
        $devices = [];
        foreach ($vehicleModels as $idx => $vehicle) {
            $identifier = 'DEMO-' . $vehicle->plate . '-' . Str::padLeft((string) ($idx + 1), 2, '0');

            $device = Device::firstOrCreate(
                ['identifier' => $identifier],
                [
                    'user_id' => $user->id,
                    'name' => 'GPS ' . $vehicle->name,
                    'status' => 'offline',
                ]
            );

            // Ensure ownership and link
            if ($device->user_id === null) {
                $device->update(['user_id' => $user->id]);
            }

            $vehicle->update(['device_id' => $device->id]);
            $devices[] = $device;
        }

        // Generate positions for the last 3 days for each device
        // so History can show routes and Monitoring can show the last known point.
        $daysBack = 3;
        $pointsPerDay = 18; // every ~30-40 minutes across the day

        foreach ($devices as $i => $device) {
            // Base centers (slightly different per device) near La Paz, BCS
            $baseLat = 24.142 + ($i * 0.01);
            $baseLng = -110.312 + ($i * 0.01);

            for ($d = $daysBack; $d >= 0; $d--) {
                $date = Carbon::today()->subDays($d);

                // Avoid duplicating if already seeded for that day
                if (Position::where('device_id', $device->id)->whereDate('recorded_at', $date)->exists()) {
                    continue;
                }

                for ($p = 0; $p < $pointsPerDay; $p++) {
                    $recordedAt = $date->copy()->setTime(6, 0)->addMinutes($p * 40);

                    // Simple loop path
                    $lat = $baseLat + sin($p / 3) * 0.01 + ($p * 0.0002);
                    $lng = $baseLng + cos($p / 3) * 0.01 - ($p * 0.0002);

                    $speed = $p % 5 === 0 ? 0 : (20 + ($p % 10) * 3); // some stops
                    $status = $speed > 0 ? 'moving' : 'stopped';

                    Position::create([
                        'device_id' => $device->id,
                        'latitude' => $lat,
                        'longitude' => $lng,
                        'recorded_at' => $recordedAt,
                        'speed' => $speed,
                        'heading' => null,
                    ]);

                    // Keep device last_* updated with the latest point
                    if ($recordedAt->greaterThan($device->last_recorded_at ?? Carbon::create(1970, 1, 1))) {
                        $device->forceFill([
                            'last_latitude' => $lat,
                            'last_longitude' => $lng,
                            'last_recorded_at' => $recordedAt,
                            'last_speed' => $speed,
                            'status' => $status,
                        ])->save();
                    }
                }
            }
        }
    }
}

