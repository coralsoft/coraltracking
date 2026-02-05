<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Device extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'identifier',
        'name',
        'phone',
        'model',
        'last_latitude',
        'last_longitude',
        'last_recorded_at',
        'status',
        'last_speed',
        'last_heading',
    ];

    protected function casts(): array
    {
        return [
            'last_latitude' => 'decimal:8',
            'last_longitude' => 'decimal:8',
            'last_recorded_at' => 'datetime',
            'last_speed' => 'decimal:2',
        ];
    }

    /** Vehicle that has this device linked (vehicles.device_id = this device). */
    public function vehicle(): HasOne
    {
        return $this->hasOne(Vehicle::class, 'device_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function positions(): HasMany
    {
        return $this->hasMany(Position::class);
    }
}
