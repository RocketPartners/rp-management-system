<?php

namespace App\Http\Controllers;

use App\Mail\Leave\LeaveRequestSubmittedMail;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class LeaveRequestController extends Controller
{
    /**
     * Display employee's own leave requests
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = LeaveRequest::with(['leaveType', 'managerApprover'])
            ->where('user_id', $user->id);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by year
        $year = $request->get('year', now()->year);
        $query->whereYear('start_date', $year);

        $leaveRequests = $query->latest()->paginate(15)->withQueryString();

        // Get current year leave balances
        $leaveBalances = LeaveBalance::where('user_id', $user->id)
            ->where('year', now()->year)
            ->with('leaveType')
            ->get();

        // Get available years for filter
        $availableYears = LeaveRequest::where('user_id', $user->id)
            ->selectRaw('DISTINCT YEAR(start_date) as year')
            ->orderBy('year', 'desc')
            ->pluck('year');

        return Inertia::render('Employees/Leaves/MyLeaves', [
            'leaveRequests' => $leaveRequests,
            'leaveBalances' => $leaveBalances,
            'availableYears' => $availableYears,
            'currentYear' => $year,
            'filters' => $request->only(['status', 'year']),
        ]);
    }

    /**
     * Show the form for creating a new leave request
     */
    public function create()
    {
        $user = auth()->user();

        $leaveTypes = LeaveType::active()
            ->ordered()
            ->get()
            ->filter(function ($leaveType) use ($user) {
                return $leaveType->isEligibleForUser($user);
            })
            ->values();

        $leaveBalances = LeaveBalance::where('user_id', $user->id)
            ->where('year', now()->year)
            ->with('leaveType')
            ->get()
            ->keyBy('leave_type_id');

        return Inertia::render('Employees/Leaves/Apply', [
            'leaveTypes' => $leaveTypes,
            'leaveBalances' => $leaveBalances,
            'user' => $user,
        ]);
    }

    /**
     * Store a newly created leave request
     * ✅ WITH DYNAMIC APPROVAL FLOW
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|max:1000',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'use_default_emergency_contact' => 'boolean',
            'availability' => 'nullable|in:reachable,offline,emergency_only',
        ]);

        // All leaves are full day
        $validated['duration'] = 'full_day';

        // ✅ GET LEAVE TYPE TO CHECK APPROVAL REQUIREMENTS
        $leaveType = LeaveType::findOrFail($validated['leave_type_id']);

        // Calculate total days
        $totalDays = $this->calculateTotalDays(
            $validated['start_date'],
            $validated['end_date'],
            $validated['duration']
        );

        // Check if user has sufficient balance
        $balance = LeaveBalance::where('user_id', $user->id)
            ->where('leave_type_id', $validated['leave_type_id'])
            ->where('year', now()->year)
            ->first();

        if (! $balance || ! $balance->hasSufficientBalance($totalDays)) {
            return back()->withInput()->with('error',
                'Insufficient leave balance. You have '.
                ($balance ? $balance->remaining_days : 0).
                ' days remaining but requested '.$totalDays.' days.'
            );
        }

        // Set default emergency contact if requested
        if ($validated['use_default_emergency_contact']) {
            $validated['emergency_contact_name'] = $user->emergency_contact_name;
            $validated['emergency_contact_phone'] = $user->emergency_contact_phone;
        }

        // ✅ DYNAMIC APPROVAL FLOW BASED ON LEAVE TYPE CONFIGURATION
        $initialStatus = 'pending_manager'; // Default
        $successMessage = 'Leave request submitted successfully! Waiting for approval.';

        if (! $leaveType->requires_manager_approval && ! $leaveType->requires_hr_approval) {
            // ✅ NO APPROVAL NEEDED - AUTO APPROVE
            $initialStatus = 'approved';
            $successMessage = 'Leave request auto-approved! Your balance has been updated.';

            // Deduct balance immediately
            $balance->deductDays($totalDays);

            // Set approval data
            $validated['manager_approved_by'] = $user->id;
            $validated['manager_approved_at'] = now();
            $validated['manager_comments'] = 'Auto-approved (no manager approval required)';
            $validated['hr_approved_by'] = $user->id;
            $validated['hr_approved_at'] = now();
            $validated['hr_comments'] = 'Auto-approved (no HR approval required)';

        } elseif (! $leaveType->requires_manager_approval && $leaveType->requires_hr_approval) {
            // ✅ SKIP MANAGER - GO STRAIGHT TO HR
            $initialStatus = 'pending_hr';
            $successMessage = 'Leave request submitted! Waiting for HR approval (manager approval not required).';

            // Mark manager as auto-approved
            $validated['manager_approved_by'] = $user->id;
            $validated['manager_approved_at'] = now();
            $validated['manager_comments'] = 'Skipped (no manager approval required for this leave type)';

        } elseif ($leaveType->requires_manager_approval && ! $leaveType->requires_hr_approval) {
            // ✅ MANAGER ONLY - NO HR NEEDED
            $initialStatus = 'pending_manager';
            $successMessage = 'Leave request submitted! Waiting for manager approval (HR approval not required).';

        } else {
            // ✅ STANDARD FLOW - BOTH APPROVALS REQUIRED
            $initialStatus = 'pending_manager';
            $successMessage = 'Leave request submitted successfully! Waiting for manager approval.';
        }

        // Create leave request
        $leaveRequest = LeaveRequest::create([
            ...$validated,
            'user_id' => $user->id,
            'total_days' => $totalDays,
            'status' => $initialStatus,
            'manager_id' => null, // Open queue system
        ]);

        // ✅ SEND EMAIL NOTIFICATION TO HR AND ADMIN
        $this->notifyHRAndAdmin($leaveRequest);

        return redirect()->route('my-leaves.index')->with('success', $successMessage);
    }

    /**
     * Display the specified leave request
     */
    public function show(LeaveRequest $leave)
    {
        if ($leave->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this leave request.');
        }

        $leave->load([
            'leaveType',
            'managerApprover',
            'hrApprover',
        ]);

        return Inertia::render('Employees/Leaves/Show', [
            'leaveRequest' => $leave,
        ]);
    }

    /**
     * Show the form for editing a leave request
     */
    public function edit(LeaveRequest $leave)
    {
        $user = auth()->user();

        if ($leave->user_id !== $user->id) {
            abort(403, 'Unauthorized access to this leave request.');
        }

        if ($leave->status !== 'pending_manager') {
            return redirect()->route('my-leaves.show', $leave->id)
                ->with('error', 'You can only edit leave requests that are pending review.');
        }

        $leave->load(['leaveType', 'user']);

        $leaveTypes = LeaveType::active()
            ->ordered()
            ->get()
            ->filter(function ($leaveType) use ($user) {
                return $leaveType->isEligibleForUser($user);
            })
            ->values();

        $leaveBalances = LeaveBalance::where('user_id', $user->id)
            ->where('year', now()->year)
            ->with('leaveType')
            ->get()
            ->keyBy('leave_type_id');

        return Inertia::render('Employees/Leaves/Edit', [
            'leaveRequest' => $leave,
            'leaveTypes' => $leaveTypes,
            'leaveBalances' => $leaveBalances,
            'user' => $user,
        ]);
    }

    /**
     * Update a leave request
     */
    public function update(Request $request, LeaveRequest $leave)
    {
        $user = auth()->user();

        if ($leave->user_id !== $user->id) {
            abort(403, 'Unauthorized access to this leave request.');
        }

        if ($leave->status !== 'pending_manager') {
            return back()->with('error', 'You can only edit leave requests that are pending review.');
        }

        $validated = $request->validate([
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|max:1000',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'use_default_emergency_contact' => 'boolean',
            'availability' => 'nullable|in:reachable,offline,emergency_only',
        ]);

        // All leaves are full day
        $validated['duration'] = 'full_day';

        $totalDays = $this->calculateTotalDays(
            $validated['start_date'],
            $validated['end_date'],
            $validated['duration']
        );

        if ($validated['leave_type_id'] != $leave->leave_type_id || $totalDays != $leave->total_days) {
            $balance = LeaveBalance::where('user_id', $user->id)
                ->where('leave_type_id', $validated['leave_type_id'])
                ->where('year', now()->year)
                ->first();

            if (! $balance || ! $balance->hasSufficientBalance($totalDays)) {
                return back()->withInput()->with('error',
                    'Insufficient leave balance. You have '.
                    ($balance ? $balance->remaining_days : 0).
                    ' days remaining but requested '.$totalDays.' days.'
                );
            }
        }

        if ($validated['use_default_emergency_contact']) {
            $validated['emergency_contact_name'] = $user->emergency_contact_name;
            $validated['emergency_contact_phone'] = $user->emergency_contact_phone;
        }

        $leave->update([
            'leave_type_id' => $validated['leave_type_id'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'duration' => $validated['duration'],
            'reason' => $validated['reason'],
            'emergency_contact_name' => $validated['emergency_contact_name'],
            'emergency_contact_phone' => $validated['emergency_contact_phone'],
            'availability' => $validated['availability'],
            'total_days' => $totalDays,
        ]);

        return redirect()->route('my-leaves.show', $leave->id)->with('success',
            'Leave request updated successfully!'
        );
    }

    /**
     * Cancel a pending leave request
     */
    public function cancel(LeaveRequest $leave)
    {
        if ($leave->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this leave request.');
        }

        if (! $leave->canBeCancelled()) {
            return back()->with('error', 'This leave request cannot be cancelled.');
        }

        $leave->update(['status' => 'cancelled']);

        return redirect()->route('my-leaves.index')->with('success', 'Leave request cancelled successfully.');
    }

    /**
     * Request cancellation for an approved leave
     */
    public function requestCancellation(Request $request, LeaveRequest $leave)
    {
        if ($leave->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this leave request.');
        }

        if (! $leave->canRequestCancellation()) {
            return back()->with('error',
                'This leave cannot be cancelled. It may have already started or is not in approved status.'
            );
        }

        $validated = $request->validate([
            'cancellation_reason' => 'required|string|max:1000',
        ]);

        try {
            $leave->requestCancellation($validated['cancellation_reason']);

            return redirect()->route('my-leaves.index')->with('success',
                'Cancellation request submitted! HR will review your request.'
            );
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Calculate total leave days (always full days)
     */
    private function calculateTotalDays($startDate, $endDate, $duration)
    {
        $start = \Carbon\Carbon::parse($startDate);
        $end = \Carbon\Carbon::parse($endDate);

        return $start->diffInDays($end) + 1;
    }

    /**
     * Send email notification to HR and Admin users
     */
    private function notifyHRAndAdmin(LeaveRequest $leaveRequest)
    {
        // Get all HR and Admin users
        $hrAndAdminUsers = User::whereHas('roles', function ($query) {
            $query->whereIn('slug', ['super-admin', 'admin', 'hr-manager']);
        })
            ->where('employment_status', 'active')
            ->get();

        // Load relationships for the email
        $leaveRequest->load(['user', 'leaveType']);

        // Send email to each HR/Admin user
        foreach ($hrAndAdminUsers as $recipient) {
            // Use work_email if available, otherwise fall back to primary email
            $emailAddress = $recipient->work_email ?? $recipient->email;

            if ($emailAddress) {
                Mail::to($emailAddress)->send(new LeaveRequestSubmittedMail($leaveRequest));
            }
        }
    }
}
