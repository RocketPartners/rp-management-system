<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CalendarEventType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'color',
        'icon',
        'description',
        'is_system',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * Get all calendar events of this type
     */
    public function events(): HasMany
    {
        return $this->hasMany(CalendarEvent::class, 'event_type', 'slug');
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope only active event types
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope only system event types
     */
    public function scopeSystem(Builder $query): Builder
    {
        return $query->where('is_system', true);
    }

    /**
     * Scope ordered by sort_order
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    // ============================================
    // ACCESSORS
    // ============================================

    /**
     * Get contrast text color based on background color
     */
    public function getContrastTextColorAttribute(): string
    {
        $color = $this->color;

        // Remove # if present
        $hex = ltrim($color, '#');

        // Handle 3-character hex codes
        if (strlen($hex) === 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }

        // Convert to RGB
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));

        // Calculate luminance
        $luminance = (0.299 * $r + 0.587 * $g + 0.114 * $b) / 255;

        // Return white for dark backgrounds, black for light backgrounds
        return $luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    // ============================================
    // METHODS
    // ============================================

    /**
     * Check if this event type can be deleted
     */
    public function canBeDeleted(): bool
    {
        return ! $this->is_system;
    }

    /**
     * Get event count for this type in a date range
     */
    public function getEventCount(?string $startDate = null, ?string $endDate = null): int
    {
        $query = $this->events();

        if ($startDate && $endDate) {
            $query->whereBetween('start_date', [$startDate, $endDate]);
        }

        return $query->count();
    }
}
