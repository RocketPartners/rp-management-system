<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    protected $fillable = [
        'name',
        'date',
        'country_code',
        'state',
        'region',
        'type',
        'is_active',
        'description',
    ];

    protected $casts = [
        'date' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Get holidays for a specific date range
     */
    public static function getForDateRange($startDate, $endDate, $countryCodes = ['PH', 'US', 'ES'])
    {
        return self::where('is_active', true)
            ->whereIn('country_code', $countryCodes)
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date')
            ->get();
    }

    /**
     * Get country name
     */
    public function getCountryNameAttribute()
    {
        $countries = [
            'PH' => 'Philippines',
            'US' => 'United States',
            'ES' => 'Spain',
        ];

        return $countries[$this->country_code] ?? $this->country_code;
    }
}
