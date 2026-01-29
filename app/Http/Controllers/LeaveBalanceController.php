<?php

namespace App\Http\Controllers;

use App\Models\LeaveBalance;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveBalanceController extends Controller
{
    /**
     * Show the leave balance management page
     */
    public function index()
    {
        $currentYear = now()->year;

        // Get stats for current year
        $stats = [
            'total_users' => User::where('employment_status', 'active')->count(),
            'total_balances' => LeaveBalance::where('year', $currentYear)->count(),
            'total_carried_over' => LeaveBalance::where('year', $currentYear)
                ->sum('carried_over_days'),
            'low_balance_count' => LeaveBalance::where('year', $currentYear)
                ->whereRaw('remaining_days < (total_days * 0.25)')
                ->count(),
        ];

        // Check if balances exist for next year
        $nextYear = $currentYear + 1;
        $nextYearBalancesExist = LeaveBalance::where('year', $nextYear)->exists();

        // Get recent balance history (last 5 years)
        $balanceHistory = LeaveBalance::selectRaw('year, COUNT(*) as balance_count, SUM(carried_over_days) as total_carried')
            ->groupBy('year')
            ->orderBy('year', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Admin/Leaves/Balances', [
            'currentYear' => $currentYear,
            'nextYear' => $nextYear,
            'nextYearBalancesExist' => $nextYearBalancesExist,
            'stats' => $stats,
            'balanceHistory' => $balanceHistory,
        ]);
    }

    /**
     * Reset leave balances for a new year
     */
    public function reset(Request $request)
    {
        $validated = $request->validate([
            'year' => 'required|integer|min:2024|max:2100',
            'confirm' => 'required|boolean|accepted',
        ]);

        $year = $validated['year'];

        // Check if balances already exist
        $existingCount = LeaveBalance::where('year', $year)->count();

        if ($existingCount > 0 && ! $request->input('force_reset', false)) {
            return back()->with('error',
                "Balances for {$year} already exist ({$existingCount} records). ".
                'Please confirm if you want to reset them.'
            );
        }

        try {
            // Delete existing balances for this year if forcing reset
            if ($existingCount > 0) {
                LeaveBalance::where('year', $year)->delete();
            }

            // Reset balances using the model method
            LeaveBalance::resetForNewYear($year);

            // Get summary
            $totalBalances = LeaveBalance::where('year', $year)->count();
            $totalCarriedOver = LeaveBalance::where('year', $year)
                ->sum('carried_over_days');

            return redirect()->route('leave-balances.index')->with('success',
                "✅ Leave balances reset successfully for {$year}! ".
                "Created {$totalBalances} balances with ".
                number_format($totalCarriedOver, 1).' days carried over.'
            );

        } catch (\Exception $e) {
            return back()->with('error',
                'Failed to reset balances: '.$e->getMessage()
            );
        }
    }

    /**
     * Preview what will happen when resetting balances
     */
    public function preview(Request $request)
    {
        $year = $request->input('year', now()->year + 1);
        $previousYear = $year - 1;

        // Get preview data
        $users = User::where('employment_status', 'active')
            ->with(['leaveBalances' => function ($query) use ($previousYear) {
                $query->where('year', $previousYear)->with('leaveType');
            }])
            ->take(10) // Limit to 10 users for preview
            ->get();

        $previewData = $users->map(function ($user) {
            return [
                'user_name' => $user->name,
                'department' => $user->department,
                'previous_balances' => $user->leaveBalances->map(function ($balance) {
                    return [
                        'leave_type' => $balance->leaveType->name,
                        'remaining' => $balance->remaining_days,
                        'can_carry_over' => $balance->leaveType->is_carry_over_allowed,
                        'max_carry_over' => $balance->leaveType->max_carry_over_days,
                        'will_carry_over' => $balance->leaveType->is_carry_over_allowed
                            ? min($balance->remaining_days, $balance->leaveType->max_carry_over_days ?? 0)
                            : 0,
                    ];
                }),
            ];
        });

        return response()->json([
            'year' => $year,
            'previous_year' => $previousYear,
            'preview_data' => $previewData,
            'total_users' => User::where('employment_status', 'active')->count(),
        ]);
    }
}
