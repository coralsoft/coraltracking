<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->string('brand')->nullable()->after('name');
            $table->string('type')->nullable()->after('brand');
            $table->string('line')->nullable()->after('type');
        });

        Schema::table('devices', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('name');
            $table->string('model')->nullable()->after('phone');
        });
    }

    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn(['brand', 'type', 'line']);
        });

        Schema::table('devices', function (Blueprint $table) {
            $table->dropColumn(['phone', 'model']);
        });
    }
};

