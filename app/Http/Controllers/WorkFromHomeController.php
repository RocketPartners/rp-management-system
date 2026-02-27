<?php

namespace App\Http\Controllers;

use App\Models\WorkFromHomeSchedule;
use App\Services\WorkFromHomeService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class WorkFromHomeController extends Controller
{
    public function __construct(
        protected WorkFromHomeService $wfhService
    ) {}

    /**
     * Schedule WFH for specific dates
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'dates' => ['required', 'array', 'min:1'],
            'dates.*' => ['required', 'date'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $results = $this->wfhService->scheduleWFH(
            $request->user(),
            $validated['dates'],
            $validated['reason'] ?? null
        );

        if (empty($results['success']) && ! empty($results['failed'])) {
            return response()->json([
                'message' => 'Failed to schedule WFH',
                'errors' => $results['errors'],
            ], 422);
        }

        $message = count($results['success']) === 1
            ? 'Work From Home scheduled successfully'
            : 'Work From Home scheduled for '.count($results['success']).' days';

        if (! empty($results['failed'])) {
            $message .= ', '.count($results['failed']).' failed';
        }

        return response()->json([
            'message' => $message,
            'data' => $results,
        ], 201);
    }

    /**
     * Get WFH schedules for current user
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'start' => ['nullable', 'date'],
            'end' => ['nullable', 'date', 'after_or_equal:start'],
        ]);

        $startDate = $validated['start'] ? Carbon::parse($validated['start']) : Carbon::now()->startOfMonth();
        $endDate = $validated['end'] ? Carbon::parse($validated['end']) : Carbon::now()->endOfMonth();

        $wfhSchedules = $this->wfhService->getWFHForUser(
            $request->user(),
            $startDate,
            $endDate
        );

        return response()->json([
            'data' => $wfhSchedules,
        ]);
    }

    /**
     * Get weekly WFH usage for current user
     */
    public function weeklyUsage(Request $request)
    {
        $validated = $request->validate([
            'date' => ['nullable', 'date'],
        ]);

        $date = $validated['date'] ? Carbon::parse($validated['date']) : Carbon::now();

        $usage = $this->wfhService->getWeeklyUsage($request->user(), $date);

        return response()->json([
            'data' => $usage,
        ]);
    }

    /**
     * Cancel a WFH schedule
     */
    public function destroy(Request $request, WorkFromHomeSchedule $wfh)
    {
        $success = $this->wfhService->cancelWFH($wfh, $request->user());

        if (! $success) {
            return response()->json([
                'message' => 'Failed to cancel WFH',
            ], 403);
        }

        return response()->json([
            'message' => 'WFH cancelled successfully',
        ]);
    }

    /**
     * Get WFH settings for current user
     */
    public function getSettings(Request $request)
    {
        $settings = $this->wfhService->getSettings($request->user());

        return response()->json([
            'data' => $settings,
        ]);
    }

    /**
     * Update WFH settings for current user
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'weekly_quota' => ['sometimes', 'integer', 'min:0', 'max:5'],
            'recurring_enabled' => ['sometimes', 'boolean'],
            'recurring_days' => ['sometimes', 'nullable', 'array'],
            'recurring_days.*' => ['integer', 'min:1', 'max:7'],
        ]);

        $settings = $this->wfhService->updateSettings($request->user(), $validated);

        return response()->json([
            'message' => 'WFH settings updated successfully',
            'data' => $settings,
        ]);
    }
}
