<?php

namespace App\Http\Controllers;

use App\Models\IndividualAssetAssignment;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use Inertia\Inertia;

class EmployeeDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Get current year leave balances
        $leaveBalances = LeaveBalance::where('user_id', $user->id)
            ->where('year', now()->year)
            ->with('leaveType')
            ->get();

        // Get upcoming approved leaves
        $upcomingLeaves = LeaveRequest::where('user_id', $user->id)
            ->where('status', 'approved')
            ->where('start_date', '>=', now())
            ->with('leaveType')
            ->orderBy('start_date')
            ->limit(5)
            ->get();

        // Get pending leave requests
        $pendingLeaves = LeaveRequest::where('user_id', $user->id)
            ->whereIn('status', ['pending_manager', 'pending_hr'])
            ->with('leaveType')
            ->get();

        // Get assigned assets
        $assignedAssets = IndividualAssetAssignment::where('user_id', $user->id)
            ->where('status', 'active')
            ->whereNull('actual_return_date')
            ->with('asset.inventoryItem')
            ->get();

        // Mock announcements (you can create an Announcement model later)
        $announcements = [
            [
                'title' => 'Office Hours Update',
                'message' => 'New office hours: 9 AM - 6 PM starting next week.',
                'created_at' => now()->subDays(2),
            ],
            [
                'title' => 'Team Building Event',
                'message' => 'Join us for team building on Saturday, November 15th!',
                'created_at' => now()->subDays(5),
            ],
        ];

        return Inertia::render('Employees/Dashboard', [
            'leaveBalances' => $leaveBalances,
            'upcomingLeaves' => $upcomingLeaves,
            'pendingLeaves' => $pendingLeaves,
            'assignedAssets' => $assignedAssets,
            'announcements' => $announcements,
        ]);
    }
}
