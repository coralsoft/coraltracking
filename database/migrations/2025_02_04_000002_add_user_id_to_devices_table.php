<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->index(['user_id', 'identifier']);
        });

        // Backfill user_id for already linked devices via vehicles.device_id
        // PostgreSQL-friendly UPDATE ... FROM
        DB::statement('
            update devices
            set user_id = vehicles.user_id
            from vehicles
            where vehicles.device_id = devices.id
        ');
    }

    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'identifier']);
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};

