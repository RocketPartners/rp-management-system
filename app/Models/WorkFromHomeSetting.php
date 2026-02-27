<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkFromHomeSetting extends Model
{
    protected $fillable = [
        'user_id',
        'weekly_quota',
        'recurring_enabled',
        'recurring_days',
        'requires_approval',
    ];

    protected $casts = [
        'recurring_days' => 'array',
        'recurring_enabled' => 'boolean',
        'requires_approval' => 'boolean',
    ];

    /**
     * Get the user who owns this setting
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get or create settings for a user
     */
    public static function getOrCreateForUser(User $user): self
    {
        return static::firstOrCreate(
            ['user_id' => $user->id],
            [
                'weekly_quota' => 2,
                'recurring_enabled' => false,
                'recurring_days' => null,
                'requires_approval' => false,
            ]
        );
    }

    /**
     * Get day names for recurring days
     */
    public function getRecurringDayNamesAttribute(): array
    {
        if (! $this->recurring_days) {
            return [];
        }

        $dayNames = [
            1 => 'Monday',
            2 => 'Tuesday',
            3 => 'Wednesday',
            4 => 'Thursday',
            5 => 'Friday',
            6 => 'Saturday',
            7 => 'Sunday',
        ];

        return array_map(fn ($day) => $dayNames[$day] ?? '', $this->recurring_days);
    }
}
