<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkFromHomeSchedule extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'type',
        'recurring_day_of_week',
        'status',
        'reason',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'date' => 'date',
        'approved_at' => 'datetime',
    ];

    /**
     * Get the user who owns this WFH schedule
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who approved this WFH
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope: Get approved WFH schedules
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope: Get WFH for specific date range
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope: Get WFH for specific user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Convert to calendar event format
     */
    public function toCalendarEvent(): array
    {
        return [
            'id' => 'wfh-'.$this->id,
            'title' => '🏠 Work From Home',
            'start' => $this->date->format('Y-m-d'),
            'end' => $this->date->format('Y-m-d'),
            'allDay' => true,
            'type' => 'wfh',
            'backgroundColor' => '#DBEAFE', // Light blue
            'borderColor' => '#60A5FA',
            'textColor' => '#1E40AF',
            'display' => 'block',
            'extendedProps' => [
                'wfh_id' => $this->id,
                'user_id' => $this->user_id,
                'user_name' => $this->user->name,
                'department' => $this->user->department,
                'wfh_type' => $this->type,
                'status' => $this->status,
                'reason' => $this->reason,
                'event_type' => 'wfh',
            ],
            'classNames' => ['calendar-wfh-event'],
        ];
    }
}
