<?php

namespace App\Services;

use App\Models\LeaveRequest;
use App\Models\User;
use App\Models\WorkFromHomeSchedule;
use App\Models\WorkFromHomeSetting;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class WorkFromHomeService
{
    /**
     * Schedule WFH for specific dates
     */
    public function scheduleWFH(User $user, array $dates, ?string $reason = null): array
    {
        $results = [
            'success' => [],
            'failed' => [],
            'errors' => [],
        ];

        foreach ($dates as $date) {
            $carbonDate = Carbon::parse($date);

            // Validate the date
            $validation = $this->validateWFHDate($user, $carbonDate);
            if (! $validation['valid']) {
                $results['failed'][] = $date;
                $results['errors'][$date] = $validation['message'];
                continue;
            }

            try {
                // Check if a cancelled WFH exists for this date (unique constraint on user_id+date)
                $cancelled = WorkFromHomeSchedule::where('user_id', $user->id)
                    ->where('date', $carbonDate->format('Y-m-d'))
                    ->where('status', 'cancelled')
                    ->first();

                if ($cancelled) {
                    $cancelled->update([
                        'type' => 'one_time',
                        'status' => 'approved',
                        'reason' => $reason,
                        'approved_at' => now(),
                    ]);
                } else {
                    WorkFromHomeSchedule::create([
                        'user_id' => $user->id,
                        'date' => $carbonDate,
                        'type' => 'one_time',
                        'status' => 'approved',
                        'reason' => $reason,
                        'approved_by' => null,
                        'approved_at' => now(),
                    ]);
                }

                $results['success'][] = $date;
            } catch (\Exception $e) {
                $results['failed'][] = $date;
                $results['errors'][$date] = 'Failed to schedule WFH';
            }
        }

        return $results;
    }

    /**
     * Validate if a WFH can be scheduled for a date
     */
    public function validateWFHDate(User $user, Carbon $date): array
    {
        // Check if date is in the past
        if ($date->isPast() && ! $date->isToday()) {
            return [
                'valid' => false,
                'message' => 'Cannot schedule WFH for past dates',
            ];
        }

        // Check if date is a weekend (Saturday or Sunday)
        if ($date->isWeekend()) {
            return [
                'valid' => false,
                'message' => 'Cannot schedule WFH on weekends (Saturday or Sunday)',
            ];
        }

        // Check if user is on leave on this date
        $hasLeave = LeaveRequest::where('user_id', $user->id)
            ->approved()
            ->where('start_date', '<=', $date->format('Y-m-d'))
            ->where('end_date', '>=', $date->format('Y-m-d'))
            ->exists();

        if ($hasLeave) {
            return [
                'valid' => false,
                'message' => 'You have approved leave on this date',
            ];
        }

        // Check if WFH already exists for this date
        $existingWFH = WorkFromHomeSchedule::where('user_id', $user->id)
            ->where('date', $date->format('Y-m-d'))
            ->whereIn('status', ['pending', 'approved'])
            ->exists();

        if ($existingWFH) {
            return [
                'valid' => false,
                'message' => 'WFH already scheduled for this date',
            ];
        }

        // Check weekly quota
        $settings = WorkFromHomeSetting::getOrCreateForUser($user);
        $weekStart = $date->copy()->startOfWeek();
        $weekEnd = $date->copy()->endOfWeek();

        $weeklyWFHCount = WorkFromHomeSchedule::where('user_id', $user->id)
            ->approved()
            ->whereBetween('date', [$weekStart->format('Y-m-d'), $weekEnd->format('Y-m-d')])
            ->count();

        if ($weeklyWFHCount >= $settings->weekly_quota) {
            return [
                'valid' => false,
                'message' => "Weekly WFH quota ({$settings->weekly_quota} days) reached for this week",
            ];
        }

        return [
            'valid' => true,
            'message' => 'Valid',
        ];
    }

    /**
     * Get WFH schedules for a user in a date range
     */
    public function getWFHForUser(User $user, Carbon $startDate, Carbon $endDate): Collection
    {
        return WorkFromHomeSchedule::where('user_id', $user->id)
            ->approved()
            ->inDateRange($startDate->format('Y-m-d'), $endDate->format('Y-m-d'))
            ->orderBy('date')
            ->get();
    }

    /**
     * Get WFH schedules for all visible users in date range
     */
    public function getWFHEvents(Carbon $startDate, Carbon $endDate, User $viewer): Collection
    {
        // For now, show all approved WFH schedules
        // TODO: Apply permission-based visibility rules
        $query = WorkFromHomeSchedule::query()
            ->with(['user'])
            ->approved()
            ->inDateRange($startDate->format('Y-m-d'), $endDate->format('Y-m-d'));

        return $query->get();
    }

    /**
     * Get weekly WFH usage for a user
     */
    public function getWeeklyUsage(User $user, Carbon $date): array
    {
        $settings = WorkFromHomeSetting::getOrCreateForUser($user);
        $weekStart = $date->copy()->startOfWeek();
        $weekEnd = $date->copy()->endOfWeek();

        $usedDays = WorkFromHomeSchedule::where('user_id', $user->id)
            ->approved()
            ->whereBetween('date', [$weekStart->format('Y-m-d'), $weekEnd->format('Y-m-d')])
            ->count();

        $remainingDays = max(0, $settings->weekly_quota - $usedDays);

        return [
            'quota' => $settings->weekly_quota,
            'used' => $usedDays,
            'remaining' => $remainingDays,
            'week_start' => $weekStart->format('Y-m-d'),
            'week_end' => $weekEnd->format('Y-m-d'),
        ];
    }

    /**
     * Cancel a WFH schedule
     */
    public function cancelWFH(WorkFromHomeSchedule $wfh, User $user): bool
    {
        // Only owner can cancel
        if ($wfh->user_id !== $user->id) {
            return false;
        }

        // Can't cancel past WFH (but today is still cancellable)
        if ($wfh->date->isBefore(today())) {
            return false;
        }

        $wfh->update(['status' => 'cancelled']);

        return true;
    }

    /**
     * Get WFH settings for a user
     */
    public function getSettings(User $user): WorkFromHomeSetting
    {
        return WorkFromHomeSetting::getOrCreateForUser($user);
    }

    /**
     * Update WFH settings for a user
     */
    public function updateSettings(User $user, array $data): WorkFromHomeSetting
    {
        $settings = WorkFromHomeSetting::getOrCreateForUser($user);
        $settings->update($data);

        return $settings;
    }
}
