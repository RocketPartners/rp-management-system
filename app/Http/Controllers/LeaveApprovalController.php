<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveApprovalController extends Controller
{
    /**
     * ✅ FIXED: Pending Approvals with Cascading Hierarchy
     * Shows leaves based on user's role in hierarchy
     */
    public function pendingApprovals(Request $request)
    {
        $user = auth()->user();

        $userRoles = $user->roles->pluck('slug')->toArray();

        // ✅ FIXED: Cascading hierarchy - each level sees all below them
        $canApproveRoles = [];

        // Project Manager - sees EVERYONE below (Entry → Lead)
        if (in_array('project-manager', $userRoles)) {
            $canApproveRoles = [
                'entry-level-engineer',
                'junior-engineer',
                'mid-level-engineer',
                'senior-engineer',
                'lead-engineer',
            ];
        }
        // Lead Engineer - sees Entry → Senior
        elseif (in_array('lead-engineer', $userRoles)) {
            $canApproveRoles = [
                'entry-level-engineer',
                'junior-engineer',
                'mid-level-engineer',
                'senior-engineer',
            ];
        }
        // Senior Engineer - sees Entry → Mid
        elseif (in_array('senior-engineer', $userRoles)) {
            $canApproveRoles = [
                'entry-level-engineer',
                'junior-engineer',
                'mid-level-engineer',
            ];
        }
        // HR/Admin - redirect to main leaves page with HR filter
        elseif (in_array('hr-manager', $userRoles) || in_array('admin', $userRoles) || in_array('super-admin', $userRoles)) {
            return redirect()->route('leaves.index', ['status' => 'pending_hr']);
        } else {
            abort(403, 'You do not have permission to approve leave requests.');
        }

        // Query leaves from users with roles they can approve
        $query = LeaveRequest::with(['user.roles', 'leaveType', 'managerApprover'])
            ->where('status', 'pending_manager')
            ->whereHas('user.roles', function ($q) use ($canApproveRoles) {
                $q->whereIn('slug', $canApproveRoles);
            });

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })
                    ->orWhereHas('leaveType', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $leaveRequests = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Leaves/PendingApprovals', [
            'leaveRequests' => $leaveRequests,
            'filters' => $request->only(['search']),
            'userRole' => $userRoles[0] ?? 'employee',
        ]);
    }

    /**
     * HR approves a leave request (final approval)
     */
    public function hrApprove(Request $request, LeaveRequest $leave)
    {
        if ($leave->status !== 'pending_hr') {
            return back()->with('error', 'This leave request is not pending HR approval.');
        }

        $validated = $request->validate([
            'hr_comments' => 'nullable|string|max:1000',
        ]);

        $leave->approveByHr(
            auth()->id(),
            $validated['hr_comments'] ?? null
        );

        return redirect()->route('leaves.index')->with('success',
            "Leave request for {$leave->user->name} has been approved! Balance updated."
        );
    }

    /**
     * HR rejects a leave request
     */
    public function hrReject(Request $request, LeaveRequest $leave)
    {
        if ($leave->status !== 'pending_hr') {
            return back()->with('error', 'This leave request is not pending HR approval.');
        }

        $validated = $request->validate([
            'hr_comments' => 'required|string|max:1000',
        ]);

        $leave->rejectByHr(
            auth()->id(),
            $validated['hr_comments']
        );

        return redirect()->route('leaves.index')->with('success',
            "Leave request for {$leave->user->name} has been rejected."
        );
    }

    /**
     * ✅ Manager approves a leave request
     * WITH DYNAMIC FLOW - checks if HR approval needed
     */
    public function managerApprove(Request $request, LeaveRequest $leave)
    {
        $user = auth()->user();

        // ✅ Check if user has approval permissions (Senior/Lead/PM/HR)
        $hasApprovalPermission = $user->roles->whereIn('slug', [
            'senior-engineer',
            'lead-engineer',
            'project-manager',
            'super-admin',
            'admin',
            'hr-manager',
        ])->count() > 0;

        if (! $hasApprovalPermission) {
            return back()->with('error', 'You are not authorized to approve this leave request.');
        }

        if ($leave->status !== 'pending_manager') {
            return back()->with('error', 'This leave request is not pending approval.');
        }

        $validated = $request->validate([
            'manager_comments' => 'nullable|string|max:1000',
        ]);

        // ✅ DYNAMIC: Check if HR approval is required for this leave type
        $leaveType = $leave->leaveType;

        if ($leaveType->requires_hr_approval) {
            // ✅ FORWARD TO HR (Standard flow)
            $leave->update([
                'status' => 'pending_hr',
                'manager_approved_by' => auth()->id(),
                'manager_approved_at' => now(),
                'manager_comments' => $validated['manager_comments'] ?? null,
            ]);

            $successMessage = 'Leave request approved and forwarded to HR for final approval.';

        } else {
            // ✅ FINAL APPROVAL - No HR needed
            $leave->update([
                'status' => 'approved',
                'manager_approved_by' => auth()->id(),
                'manager_approved_at' => now(),
                'manager_comments' => $validated['manager_comments'] ?? null,
                'hr_approved_by' => auth()->id(),
                'hr_approved_at' => now(),
                'hr_comments' => 'HR approval not required for this leave type',
            ]);

            // Deduct from balance
            $balance = \App\Models\LeaveBalance::where('user_id', $leave->user_id)
                ->where('leave_type_id', $leave->leave_type_id)
                ->where('year', $leave->start_date->year)
                ->first();

            if ($balance) {
                $balance->deductDays($leave->total_days);
            }

            $successMessage = 'Leave request APPROVED (HR approval not required)! Balance has been updated.';
        }

        // ✅ SMART REDIRECT
        $referer = $request->header('referer');

        if ($referer && str_contains($referer, '/leaves/pending-approvals')) {
            return redirect()->route('leaves.pending-approvals')->with('success', $successMessage);
        }

        return back()->with('success', $successMessage);
    }

    /**
     * ✅ Manager rejects a leave request (FINAL - No appeals)
     */
    public function managerReject(Request $request, LeaveRequest $leave)
    {
        $user = auth()->user();

        // ✅ Check if user has approval permissions
        $hasApprovalPermission = $user->roles->whereIn('slug', [
            'senior-engineer',
            'lead-engineer',
            'project-manager',
            'super-admin',
            'admin',
            'hr-manager',
        ])->count() > 0;

        if (! $hasApprovalPermission) {
            return back()->with('error', 'You are not authorized to reject this leave request.');
        }

        if ($leave->status !== 'pending_manager') {
            return back()->with('error', 'This leave request is not pending approval.');
        }

        $validated = $request->validate([
            'manager_comments' => 'required|string|max:1000',
        ]);

        // Reject the leave (FINAL - no appeals)
        $leave->rejectByManager(
            auth()->id(),
            $validated['manager_comments']
        );

        // ✅ SMART REDIRECT
        $referer = $request->header('referer');

        if ($referer && str_contains($referer, '/leaves/pending-approvals')) {
            return redirect()->route('leaves.pending-approvals')->with('success',
                'Leave request has been rejected. This is the final decision.'
            );
        }

        return back()->with('success',
            'Leave request has been rejected. This is the final decision.'
        );
    }

    /**
     * ✅ HR approves employee's cancellation request
     */
    public function approveCancellation(Request $request, LeaveRequest $leave)
    {
        // Check HR permission
        $user = auth()->user();
        if (! $user->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count()) {
            abort(403, 'Only HR can approve cancellation requests.');
        }

        if ($leave->status !== 'pending_cancellation') {
            return back()->with('error', 'This leave is not pending cancellation approval.');
        }

        $validated = $request->validate([
            'cancellation_hr_comments' => 'nullable|string|max:1000',
        ]);

        try {
            $leave->approveCancellation(
                auth()->id(),
                $validated['cancellation_hr_comments'] ?? null
            );

            return back()->with('success',
                "Cancellation approved! {$leave->total_days} days have been restored to {$leave->user->name}'s balance."
            );
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * ✅ HR rejects employee's cancellation request (leave stays approved)
     */
    public function rejectCancellation(Request $request, LeaveRequest $leave)
    {
        // Check HR permission
        $user = auth()->user();
        if (! $user->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count()) {
            abort(403, 'Only HR can reject cancellation requests.');
        }

        if ($leave->status !== 'pending_cancellation') {
            return back()->with('error', 'This leave is not pending cancellation approval.');
        }

        $validated = $request->validate([
            'cancellation_hr_comments' => 'required|string|max:1000',
        ]);

        try {
            $leave->rejectCancellation(
                auth()->id(),
                $validated['cancellation_hr_comments']
            );

            return back()->with('success',
                "Cancellation rejected. {$leave->user->name}'s leave remains approved."
            );
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
