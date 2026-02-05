<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->foreignId('device_id')->nullable()->after('color')->constrained()->nullOnDelete();
        });

        foreach (DB::table('devices')->orderBy('id')->get() as $device) {
            DB::table('vehicles')->where('id', $device->vehicle_id)->update(['device_id' => $device->id]);
        }

        Schema::table('devices', function (Blueprint $table) {
            $table->dropForeign(['vehicle_id']);
            $table->dropColumn('vehicle_id');
        });
    }

    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->foreignId('vehicle_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
        });

        foreach (DB::table('vehicles')->whereNotNull('device_id')->orderBy('id')->get() as $vehicle) {
            DB::table('devices')->where('id', $vehicle->device_id)->update(['vehicle_id' => $vehicle->id]);
        }

        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropForeign(['device_id']);
            $table->dropColumn('device_id');
        });
    }
};
