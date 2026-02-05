<?php

namespace Database\Seeders;

use App\Models\Device;
use App\Models\Position;
use App\Models\User;
use App\Models\Vehicle;
use Carbon\Carbon;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(TrackingDemoSeeder::class);

        // Keep the existing simple seed as well (optional)
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        $vehicle = Vehicle::firstOrCreate(
            ['user_id' => $user->id, 'plate' => 'ABC-123'],
            ['name' => 'Delivery Truck 1', 'color' => 'White']
        );

        $device = Device::firstOrCreate(
            ['identifier' => 'IMEI' . $vehicle->id . '001'],
            [
                'user_id' => $user->id,
                'name' => 'GPS Unit 1',
                'last_latitude' => 19.4326,
                'last_longitude' => -99.1332,
                'last_recorded_at' => now(),
                'status' => 'moving',
                'last_speed' => 45.5,
                'last_heading' => 180,
            ]
        );

        $vehicle->update(['device_id' => $device->id]);

        $today = Carbon::today();
        if (Position::where('device_id', $device->id)->whereDate('recorded_at', $today)->count() === 0) {
            $lats = [19.4326, 19.435, 19.438, 19.44, 19.442];
            $lngs = [-99.1332, -99.13, -99.128, -99.125, -99.12];
            foreach (array_keys($lats) as $i) {
                Position::create([
                    'device_id' => $device->id,
                    'latitude' => $lats[$i],
                    'longitude' => $lngs[$i],
                    'recorded_at' => $today->copy()->addHours(8 + $i)->addMinutes($i * 5),
                    'speed' => 30 + $i * 5,
                    'heading' => 90,
                ]);
            }
        }
    }
}
