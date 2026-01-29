<?php

namespace App\Http\Controllers;

use App\Models\CalendarEventType;
use App\Models\CalendarUserSetting;
use App\Services\CalendarService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function __construct(
        protected CalendarService $calendarService
    ) {}

    /**
     * Display the calendar page
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Get or create user's calendar settings
        $settings = CalendarUserSetting::getOrCreateForUser($user);

        // Get event types for legend/filters
        $eventTypes = CalendarEventType::active()->ordered()->get([
            'id', 'name', 'slug', 'color', 'icon', 'description',
        ]);

        // Get departments for filters
        $departments = $this->calendarService->getVisibleDepartments($user);

        // Get leave types for filtering
        $leaveTypes = $this->calendarService->getAvailableLeaveTypes();

        return Inertia::render('Calendar/Index', [
            'settings' => $settings,
            'eventTypes' => $eventTypes,
            'departments' => $departments,
            'leaveTypes' => $leaveTypes,
        ]);
    }

    /**
     * Get calendar events (API endpoint)
     */
    public function events(Request $request)
    {
        $validated = $request->validate([
            'start' => ['required', 'date'],
            'end' => ['required', 'date', 'after_or_equal:start'],
            'event_types' => ['nullable', 'array'],
            'event_types.*' => ['string'],
            'user_ids' => ['nullable', 'array'],
            'user_ids.*' => ['integer', 'exists:users,id'],
            'department' => ['nullable', 'string'],
            'leave_type_ids' => ['nullable', 'array'],
            'leave_type_ids.*' => ['integer', 'exists:leave_types,id'],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $startDate = Carbon::parse($validated['start']);
        $endDate = Carbon::parse($validated['end']);
        $filters = [
            'event_types' => $validated['event_types'] ?? ['leave'],
            'user_ids' => $validated['user_ids'] ?? null,
            'department' => $validated['department'] ?? null,
            'leave_type_ids' => $validated['leave_type_ids'] ?? null,
            'search' => $validated['search'] ?? null,
        ];

        $events = $this->calendarService->getEvents(
            $startDate,
            $endDate,
            $filters,
            $request->user()
        );

        return response()->json([
            'data' => $events,
            'meta' => [
                'total' => $events->count(),
                'showing_types' => $filters['event_types'],
            ],
        ]);
    }

    /**
     * Get calendar statistics (API endpoint)
     */
    public function statistics(Request $request)
    {
        $validated = $request->validate([
            'start' => ['required', 'date'],
            'end' => ['required', 'date', 'after_or_equal:start'],
            'event_types' => ['nullable', 'array'],
        ]);

        $startDate = Carbon::parse($validated['start']);
        $endDate = Carbon::parse($validated['end']);
        $filters = [
            'event_types' => $validated['event_types'] ?? ['leave'],
        ];

        $statistics = $this->calendarService->getStatistics(
            $startDate,
            $endDate,
            $filters,
            $request->user()
        );

        return response()->json([
            'data' => $statistics,
        ]);
    }

    /**
     * Get users on leave for a specific date (API endpoint)
     */
    public function usersOnLeave(Request $request)
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
        ]);

        $date = Carbon::parse($validated['date']);
        $usersOnLeave = $this->calendarService->getUsersOnLeave($date, $request->user());

        return response()->json([
            'data' => $usersOnLeave,
            'meta' => [
                'date' => $date->format('Y-m-d'),
                'count' => $usersOnLeave->count(),
            ],
        ]);
    }

    /**
     * Get event types (API endpoint)
     */
    public function eventTypes(Request $request)
    {
        $validated = $request->validate([
            'start' => ['nullable', 'date'],
            'end' => ['nullable', 'date', 'after_or_equal:start'],
        ]);

        if ($validated['start'] ?? null && $validated['end'] ?? null) {
            $startDate = Carbon::parse($validated['start']);
            $endDate = Carbon::parse($validated['end']);

            $eventTypes = $this->calendarService->getEventTypesWithCounts(
                $startDate,
                $endDate,
                $request->user()
            );
        } else {
            // Just return event types without counts
            $eventTypes = CalendarEventType::active()->ordered()->get([
                'id', 'name', 'slug', 'color', 'icon', 'is_active',
            ])->map(function ($eventType) {
                return [
                    'id' => $eventType->id,
                    'name' => $eventType->name,
                    'slug' => $eventType->slug,
                    'color' => $eventType->color,
                    'icon' => $eventType->icon,
                    'count' => 0,
                    'is_active' => $eventType->is_active,
                ];
            });
        }

        return response()->json([
            'data' => $eventTypes,
        ]);
    }

    /**
     * Export calendar to CSV
     */
    public function export(Request $request)
    {
        // Check permission
        if (! $request->user()->hasPermission('leaves.view-team')) {
            abort(403, 'You do not have permission to export calendar data.');
        }

        $validated = $request->validate([
            'start' => ['required', 'date'],
            'end' => ['required', 'date', 'after_or_equal:start'],
            'format' => ['required', 'in:csv'],
            'event_types' => ['nullable', 'array'],
        ]);

        $startDate = Carbon::parse($validated['start']);
        $endDate = Carbon::parse($validated['end']);
        $filters = [
            'event_types' => $validated['event_types'] ?? ['leave'],
        ];

        if ($validated['format'] === 'csv') {
            $csv = $this->calendarService->exportToCSV(
                $startDate,
                $endDate,
                $filters,
                $request->user()
            );

            $filename = 'calendar_'.$startDate->format('Y-m-d').'_to_'.$endDate->format('Y-m-d').'.csv';

            return response($csv, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            ]);
        }

        abort(400, 'Invalid export format');
    }

    /**
     * Save user calendar settings
     */
    public function saveSettings(Request $request)
    {
        $validated = $request->validate([
            'default_view' => ['required', 'in:month,week,day'],
            'show_weekends' => ['required', 'boolean'],
            'visible_event_types' => ['nullable', 'array'],
            'visible_event_types.*' => ['string'],
            'default_filters' => ['nullable', 'array'],
        ]);

        $settings = CalendarUserSetting::getOrCreateForUser($request->user());
        $settings->update($validated);

        return response()->json([
            'message' => 'Calendar settings saved successfully',
            'data' => $settings,
        ]);
    }
}
