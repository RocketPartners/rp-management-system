<?php

namespace App\Services;

use App\Models\CalendarEventType;
use App\Models\Holiday;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use App\Models\WorkFromHomeSchedule;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class CalendarService
{
    /**
     * Get all calendar events for a date range with filters
     */
    public function getEvents(
        Carbon $startDate,
        Carbon $endDate,
        array $filters,
        User $viewer
    ): Collection {
        $events = collect();

        // Determine which event types to fetch
        $eventTypes = $filters['event_types'] ?? ['leave'];

        // Fetch leave events if requested
        if (in_array('leave', $eventTypes)) {
            $leaveEvents = $this->getLeaveEvents($startDate, $endDate, $filters, $viewer);
            $events = $events->merge($leaveEvents);
        }

        // Fetch holiday events if requested
        if (in_array('holiday', $eventTypes)) {
            $holidayEvents = $this->getHolidayEvents($startDate, $endDate, $filters);
            $events = $events->merge($holidayEvents);
        }

        // Fetch WFH events if requested
        if (in_array('wfh', $eventTypes)) {
            $wfhEvents = $this->getWFHEvents($startDate, $endDate, $filters, $viewer);
            $events = $events->merge($wfhEvents);
        }

        // Future: Add other event types (announcements, etc.)

        return $events;
    }

    /**
     * Get leave events for date range
     */
    public function getLeaveEvents(
        Carbon $startDate,
        Carbon $endDate,
        array $filters,
        User $viewer
    ): Collection {
        $query = LeaveRequest::query()
            ->with(['user', 'leaveType'])
            ->approved()
            ->inDateRange($startDate->format('Y-m-d'), $endDate->format('Y-m-d'));

        // Apply permission-based visibility
        $query = $this->applyLeaveVisibilityRules($query, $viewer);

        // Apply filters
        if (! empty($filters['user_ids'])) {
            $query->forUsers($filters['user_ids']);
        }

        if (! empty($filters['department'])) {
            $query->forDepartment($filters['department']);
        }

        if (! empty($filters['leave_type_ids'])) {
            $query->whereIn('leave_type_id', $filters['leave_type_ids']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%");
                })
                    ->orWhere('reason', 'like', "%{$search}%");
            });
        }

        $leaves = $query->get();

        // Transform to calendar event format
        return $leaves->map(function ($leave) {
            return $leave->toCalendarEvent();
        });
    }

    /**
     * Get holiday events for date range
     */
    public function getHolidayEvents(
        Carbon $startDate,
        Carbon $endDate,
        array $filters
    ): Collection {
        $countryCodes = $filters['country_codes'] ?? ['PH', 'US', 'ES'];
        $usStates = $filters['us_states'] ?? null;
        $holidayTypes = $filters['holiday_types'] ?? null;

        $query = Holiday::where('is_active', true)
            ->whereIn('country_code', $countryCodes)
            ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);

        // Filter by US states if specified
        if ($usStates && in_array('US', $countryCodes)) {
            $query->where(function ($q) use ($usStates) {
                $q->whereIn('state', $usStates)
                  ->orWhere(function ($q2) {
                      $q2->where('country_code', 'US')->whereNull('state');
                  })
                  ->orWhere('country_code', '!=', 'US');
            });
        }

        // Filter by holiday types if specified
        if ($holidayTypes && !empty($holidayTypes)) {
            $query->whereIn('type', $holidayTypes);
        }

        $holidays = $query->orderBy('date')->get();

        // Transform to calendar event format
        return $holidays->map(function ($holiday) {
            // Get country flag emoji
            $flag = match($holiday->country_code) {
                'PH' => '🇵🇭',
                'US' => '🇺🇸',
                'ES' => '🇪🇸',
                default => '🎉'
            };

            // Get holiday type display name
            $holidayTypeLabel = match($holiday->type) {
                'federal' => 'Federal Holiday',
                'government' => 'Government Holiday',
                'state' => 'State Holiday',
                'regional' => 'Regional Holiday',
                'observance' => 'Not A Public Holiday',
                'public' => 'Public Holiday',
                default => ucfirst($holiday->type),
            };

            return [
                'id' => 'holiday-'.$holiday->id,
                'title' => $flag.' '.$holiday->name,
                'start' => $holiday->date->format('Y-m-d'),
                'end' => $holiday->date->format('Y-m-d'),
                'allDay' => true,
                'type' => 'holiday',
                'backgroundColor' => '#FEE2E2', // Light red background
                'borderColor' => '#FCA5A5',
                'textColor' => '#991B1B',
                'display' => 'block', // Display as regular event
                'extendedProps' => [
                    'holiday_id' => $holiday->id,
                    'holiday_name' => $holiday->name,
                    'country_code' => $holiday->country_code,
                    'country_name' => $holiday->country_name,
                    'holiday_type' => $holiday->type,
                    'holiday_type_label' => $holidayTypeLabel,
                    'event_type' => 'holiday',
                ],
                'classNames' => ['calendar-holiday-event'],
            ];
        });
    }

    /**
     * Get WFH events for date range
     */
    public function getWFHEvents(
        Carbon $startDate,
        Carbon $endDate,
        array $filters,
        User $viewer
    ): Collection {
        $query = WorkFromHomeSchedule::query()
            ->with(['user'])
            ->approved()
            ->inDateRange($startDate->format('Y-m-d'), $endDate->format('Y-m-d'));

        // Apply filters if provided
        if (! empty($filters['user_ids'])) {
            $query->whereIn('user_id', $filters['user_ids']);
        }

        if (! empty($filters['department'])) {
            $query->whereHas('user', function ($q) use ($filters) {
                $q->where('department', $filters['department']);
            });
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $wfhSchedules = $query->get();

        // Transform to calendar event format
        return $wfhSchedules->map(function ($wfh) {
            return $wfh->toCalendarEvent();
        });
    }

    /**
     * Apply permission-based visibility rules for leaves
     *
     * CALENDAR VISIBILITY PHILOSOPHY:
     * - Approved leaves are PUBLIC information (already approved by manager/HR)
     * - Calendar is for COORDINATION, not management
     * - All employees should see when coworkers are on leave
     * - The leave management system (approval, viewing details) remains permission-restricted
     */
    protected function applyLeaveVisibilityRules(Builder $query, User $viewer): Builder
    {
        // ✅ ALL AUTHENTICATED USERS can see ALL APPROVED LEAVES on the calendar
        // This is because:
        // 1. These leaves are already approved (public information)
        // 2. Employees need to see who's out for team coordination
        // 3. Detailed leave management is still protected by separate permissions

        // No filtering needed - show all approved leaves to everyone
        return $query;
    }

    /**
     * Get calendar statistics for a date range
     */
    public function getStatistics(
        Carbon $startDate,
        Carbon $endDate,
        array $filters,
        User $viewer
    ): array {
        // Get all events
        $events = $this->getEvents($startDate, $endDate, $filters, $viewer);

        // Count by type
        $byType = $events->groupBy('type')->map->count()->toArray();

        // Users on leave today
        $today = Carbon::today();
        $usersOnLeaveToday = 0;

        if ($today->between($startDate, $endDate)) {
            $todayLeaves = LeaveRequest::query()
                ->approved()
                ->where('start_date', '<=', $today)
                ->where('end_date', '>=', $today)
                ->count();

            $usersOnLeaveToday = $todayLeaves;
        }

        return [
            'total_events' => $events->count(),
            'by_type' => $byType,
            'users_on_leave_today' => $usersOnLeaveToday,
            'upcoming_holidays' => [], // Future feature
        ];
    }

    /**
     * Get users currently on leave for a specific date
     */
    public function getUsersOnLeave(Carbon $date, User $viewer): Collection
    {
        $query = LeaveRequest::query()
            ->with(['user', 'leaveType'])
            ->approved()
            ->where('start_date', '<=', $date->format('Y-m-d'))
            ->where('end_date', '>=', $date->format('Y-m-d'));

        // Apply visibility rules
        $query = $this->applyLeaveVisibilityRules($query, $viewer);

        return $query->get()->map(function ($leave) {
            return [
                'id' => $leave->id,
                'user' => [
                    'id' => $leave->user->id,
                    'name' => $leave->user->name,
                    'avatar' => $leave->user->profile_picture,
                    'department' => $leave->user->department,
                ],
                'leave_type' => [
                    'id' => $leave->leaveType->id,
                    'name' => $leave->leaveType->name,
                    'color' => $leave->leaveType->color,
                ],
                'start_date' => $leave->start_date->format('Y-m-d'),
                'end_date' => $leave->end_date->format('Y-m-d'),
                'total_days' => $leave->total_days,
            ];
        });
    }

    /**
     * Get event types with counts for the legend
     */
    public function getEventTypesWithCounts(
        Carbon $startDate,
        Carbon $endDate,
        User $viewer
    ): Collection {
        $eventTypes = CalendarEventType::active()->ordered()->get();

        // Get counts for each type
        return $eventTypes->map(function ($eventType) use ($startDate, $endDate, $viewer) {
            $count = 0;

            // Count leaves
            if ($eventType->slug === 'leave') {
                $query = LeaveRequest::query()
                    ->approved()
                    ->inDateRange($startDate->format('Y-m-d'), $endDate->format('Y-m-d'));

                $query = $this->applyLeaveVisibilityRules($query, $viewer);
                $count = $query->count();
            }

            // Count holidays
            if ($eventType->slug === 'holiday') {
                $count = Holiday::where('is_active', true)
                    ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                    ->count();
            }

            // Future: Add counts for other event types

            return [
                'id' => $eventType->id,
                'name' => $eventType->name,
                'slug' => $eventType->slug,
                'color' => $eventType->color,
                'icon' => $eventType->icon,
                'count' => $count,
                'is_active' => $eventType->is_active,
            ];
        });
    }

    /**
     * Get unique departments from visible users
     */
    public function getVisibleDepartments(User $viewer): array
    {
        // ✅ Since all users can see all approved leaves, show all departments for filtering
        return User::query()
            ->whereNotNull('department')
            ->where('employment_status', 'active')
            ->distinct()
            ->pluck('department')
            ->filter()
            ->unique()
            ->values()
            ->toArray();
    }

    /**
     * Get leave types available for filtering
     */
    public function getAvailableLeaveTypes(): Collection
    {
        return LeaveType::active()->ordered()->get(['id', 'name', 'code', 'color', 'icon']);
    }

    /**
     * Export calendar events to CSV
     */
    public function exportToCSV(
        Carbon $startDate,
        Carbon $endDate,
        array $filters,
        User $viewer
    ): string {
        $events = $this->getEvents($startDate, $endDate, $filters, $viewer);

        $csv = "Type,Title,Start Date,End Date,Department,User,Leave Type,Total Days,Reason\n";

        foreach ($events as $event) {
            $props = $event['extendedProps'] ?? [];
            $csv .= sprintf(
                "%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                $event['type'],
                $this->escapeCsv($event['title']),
                $event['start'],
                $event['end'],
                $this->escapeCsv($props['department'] ?? ''),
                $this->escapeCsv($props['user_name'] ?? ''),
                $this->escapeCsv($props['leave_type'] ?? ''),
                $props['total_days'] ?? '',
                $this->escapeCsv($props['reason'] ?? '')
            );
        }

        return $csv;
    }

    /**
     * Escape CSV field
     */
    protected function escapeCsv($field): string
    {
        if (strpos($field, ',') !== false || strpos($field, '"') !== false || strpos($field, "\n") !== false) {
            return '"'.str_replace('"', '""', $field).'"';
        }

        return $field;
    }
}
