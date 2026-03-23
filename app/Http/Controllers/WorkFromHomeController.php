<?php

namespace App\Http\Controllers;

use App\Models\WorkFromHomeSchedule;
use App\Models\WorkFromHomeSetting;
use App\Services\WorkFromHomeService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkFromHomeController extends Controller
{
    public function __construct(
        protected WorkFromHomeService $wfhService
    ) {}

    /**
     * Display the My WFH page (Inertia)
     */
    public function page(Request $request)
    {
        $user = $request->user();
        $month = $request->get('month', now()->format('Y-m'));
        [$year, $monthNum] = explode('-', $month);

        $startDate = Carbon::createFromDate($year, $monthNum, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        // Get WFH schedules for the selected month (include all statuses)
        $schedules = WorkFromHomeSchedule::where('user_id', $user->id)
            ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->orderBy('date')
            ->get()
            ->map(fn ($wfh) => [
                'id' => $wfh->id,
                'date' => $wfh->date->format('Y-m-d'),
                'day_name' => $wfh->date->format('l'),
                'type' => $wfh->type,
                'status' => $wfh->status,
                'reason' => $wfh->reason,
                'is_past' => $wfh->date->isBefore(today()),
                'is_today' => $wfh->date->isToday(),
            ]);

        // Get usage stats for the current week
        $weeklyUsage = $this->wfhService->getWeeklyUsage($user, now());

        // Get settings
        $settings = WorkFromHomeSetting::getOrCreateForUser($user);

        // Monthly summary counts
        $monthlyStats = [
            'total' => $schedules->whereIn('status', ['approved', 'pending'])->count(),
            'approved' => $schedules->where('status', 'approved')->count(),
            'cancelled' => $schedules->where('status', 'cancelled')->count(),
            'upcoming' => $schedules->where('status', 'approved')->where('is_past', false)->count(),
        ];

        // Available months for filter (months with WFH data + current month)
        $availableMonths = WorkFromHomeSchedule::where('user_id', $user->id)
            ->selectRaw("DISTINCT DATE_FORMAT(date, '%Y-%m') as month")
            ->orderBy('month', 'desc')
            ->pluck('month')
            ->toArray();

        if (! in_array($month, $availableMonths)) {
            $availableMonths[] = $month;
            rsort($availableMonths);
        }

        return Inertia::render('Employees/WFH/Index', [
            'schedules' => $schedules,
            'weeklyUsage' => $weeklyUsage,
            'settings' => [
                'weekly_quota' => $settings->weekly_quota,
                'recurring_enabled' => $settings->recurring_enabled,
                'recurring_days' => $settings->recurring_days,
            ],
            'monthlyStats' => $monthlyStats,
            'currentMonth' => $month,
            'availableMonths' => $availableMonths,
        ]);
    }

    /**
     * Cancel a WFH from the page (web route, redirects back)
     */
    public function cancel(Request $request, WorkFromHomeSchedule $wfh)
    {
        $success = $this->wfhService->cancelWFH($wfh, $request->user());

        if (! $success) {
            return back()->with('error', 'Cannot cancel this WFH schedule.');
        }

        return back()->with('success', 'WFH cancelled successfully.');
    }

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
