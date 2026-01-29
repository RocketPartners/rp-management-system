<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CalendarUserSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'default_view',
        'show_weekends',
        'visible_event_types',
        'default_filters',
    ];

    protected $casts = [
        'show_weekends' => 'boolean',
        'visible_event_types' => 'array',
        'default_filters' => 'array',
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * Get the user that owns these settings
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ============================================
    // STATIC METHODS
    // ============================================

    /**
     * Get or create calendar settings for a user
     */
    public static function getOrCreateForUser(User $user): self
    {
        return static::firstOrCreate(
            ['user_id' => $user->id],
            [
                'default_view' => 'month',
                'show_weekends' => true,
                'visible_event_types' => ['leave'], // Show leaves by default
                'default_filters' => null,
            ]
        );
    }

    // ============================================
    // METHODS
    // ============================================

    /**
     * Check if an event type is visible
     */
    public function isEventTypeVisible(string $eventTypeSlug): bool
    {
        if (! $this->visible_event_types) {
            return true; // Show all if not configured
        }

        return in_array($eventTypeSlug, $this->visible_event_types);
    }

    /**
     * Toggle event type visibility
     */
    public function toggleEventType(string $eventTypeSlug): void
    {
        $types = $this->visible_event_types ?? [];

        if (in_array($eventTypeSlug, $types)) {
            $types = array_diff($types, [$eventTypeSlug]);
        } else {
            $types[] = $eventTypeSlug;
        }

        $this->visible_event_types = array_values($types);
        $this->save();
    }

    /**
     * Set visible event types
     */
    public function setVisibleEventTypes(array $eventTypeSlugs): void
    {
        $this->visible_event_types = $eventTypeSlugs;
        $this->save();
    }
}
