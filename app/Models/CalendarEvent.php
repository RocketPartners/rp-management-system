<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CalendarEvent extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'event_type',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'all_day',
        'color',
        'eventable_type',
        'eventable_id',
        'user_id',
        'created_by',
        'visibility',
        'department',
        'metadata',
        'is_recurring',
        'recurrence_rule',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'all_day' => 'boolean',
        'is_recurring' => 'boolean',
        'metadata' => 'array',
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * Get the source model (LeaveRequest, Announcement, etc.)
     */
    public function eventable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user this event belongs to/affects
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who created this event
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the event type configuration
     */
    public function eventType(): BelongsTo
    {
        return $this->belongsTo(CalendarEventType::class, 'event_type', 'slug');
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope events within a date range
     */
    public function scopeInDateRange(Builder $query, Carbon $start, Carbon $end): Builder
    {
        return $query->where(function ($q) use ($start, $end) {
            $q->whereBetween('start_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
                ->orWhereBetween('end_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
                ->orWhere(function ($q2) use ($start, $end) {
                    // Events that span the entire range
                    $q2->where('start_date', '<=', $start->format('Y-m-d'))
                        ->where('end_date', '>=', $end->format('Y-m-d'));
                });
        });
    }

    /**
     * Scope events by type
     */
    public function scopeOfType(Builder $query, string|array $types): Builder
    {
        if (is_string($types)) {
            $types = [$types];
        }

        return $query->whereIn('event_type', $types);
    }

    /**
     * Scope events visible to a specific user based on visibility rules
     */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        return $query->where(function ($q) use ($user) {
            // Public events are visible to everyone
            $q->where('visibility', 'public')
              // User's own private events
                ->orWhere(function ($q2) use ($user) {
                    $q2->where('visibility', 'private')
                        ->where('user_id', $user->id);
                })
              // Department events if user is in that department
                ->orWhere(function ($q2) use ($user) {
                    $q2->where('visibility', 'department')
                        ->where('department', $user->department);
                })
              // Team events if user is in the same team
                ->orWhere(function ($q2) use ($user) {
                    $q2->where('visibility', 'team')
                        ->whereHas('user', function ($q3) use ($user) {
                            // Same manager or user is the manager
                            $q3->where('manager_id', $user->manager_id)
                                ->orWhere('manager_id', $user->id);
                        });
                });
        });
    }

    /**
     * Scope events for a specific department
     */
    public function scopeForDepartment(Builder $query, string $department): Builder
    {
        return $query->where('department', $department);
    }

    /**
     * Scope public events only
     */
    public function scopePublic(Builder $query): Builder
    {
        return $query->where('visibility', 'public');
    }

    // ============================================
    // ACCESSORS
    // ============================================

    /**
     * Get the effective color (uses override color or event type color)
     */
    public function getEffectiveColorAttribute(): string
    {
        if ($this->color) {
            return $this->color;
        }

        $eventType = $this->eventType;

        return $eventType ? $eventType->color : '#6B7280'; // Default gray
    }

    /**
     * Get contrast text color based on background color
     */
    public function getContrastTextColorAttribute(): string
    {
        $color = $this->effective_color;

        // Remove # if present
        $hex = ltrim($color, '#');

        // Convert to RGB
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));

        // Calculate luminance
        $luminance = (0.299 * $r + 0.587 * $g + 0.114 * $b) / 255;

        // Return white for dark backgrounds, black for light backgrounds
        return $luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    /**
     * Format event for FullCalendar
     */
    public function getFormattedForCalendarAttribute(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'start' => $this->start_date->format('Y-m-d'),
            'end' => $this->all_day ? $this->end_date->addDay()->format('Y-m-d') : $this->end_date->format('Y-m-d'),
            'allDay' => $this->all_day,
            'color' => $this->effective_color,
            'textColor' => $this->contrast_text_color,
            'type' => $this->event_type,
            'extendedProps' => [
                'event_id' => $this->id,
                'event_type' => $this->event_type,
                'description' => $this->description,
                'user_id' => $this->user_id,
                'visibility' => $this->visibility,
                'metadata' => $this->metadata,
            ],
        ];
    }

    // ============================================
    // STATIC METHODS
    // ============================================

    /**
     * Create calendar event from a leave request
     */
    public static function createFromLeave(LeaveRequest $leave): self
    {
        return static::create([
            'title' => $leave->user->name.' - '.$leave->leaveType->name,
            'description' => $leave->reason,
            'event_type' => 'leave',
            'start_date' => $leave->start_date,
            'end_date' => $leave->end_date,
            'all_day' => true,
            'color' => $leave->leaveType->color,
            'eventable_type' => LeaveRequest::class,
            'eventable_id' => $leave->id,
            'user_id' => $leave->user_id,
            'visibility' => 'public', // Approved leaves are visible to all
            'department' => $leave->user->department,
            'metadata' => [
                'leave_type' => $leave->leaveType->name,
                'leave_type_slug' => $leave->leaveType->code,
                'total_days' => $leave->total_days,
                'duration' => $leave->duration,
            ],
        ]);
    }
}
