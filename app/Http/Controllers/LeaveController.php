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

class LeaveController extends Controller
{
    /**
     * Display all leave requests (HR Admin view)
     */
    public function index(Request $request)
    {
        $query = LeaveRequest::with(['user', 'leaveType']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })
                    ->orWhereHas('leaveType', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('code', 'like', "%{$search}%");
                    })
                    ->orWhere('reason', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by leave type
        if ($request->has('leave_type') && $request->leave_type !== 'all') {
            $query->where('leave_type_id', $request->leave_type);
        }

        // Filter by employee
        if ($request->has('employee') && $request->employee !== 'all') {
            $query->where('user_id', $request->employee);
        }

        $leaveRequests = $query->latest()->paginate(15)->withQueryString();

        // Get all leave types for filter
        $leaveTypes = LeaveType::active()->ordered()->get();

        // Get all active users for filter
        $users = User::where('employment_status', 'active')
            ->orderBy('name')
            ->get();

        // Calculate stats
        $stats = [
            'total' => LeaveRequest::count(),
            'pending_hr' => LeaveRequest::where('status', 'pending_hr')->count(),
            'approved' => LeaveRequest::where('status', 'approved')->count(),
            'this_month' => LeaveRequest::whereMonth('start_date', now()->month)
                ->whereYear('start_date', now()->year)
                ->count(),
        ];

        return Inertia::render('Admin/Leaves/Index', [
            'leaveRequests' => $leaveRequests,
            'leaveTypes' => $leaveTypes,
            'users' => $users,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'leave_type', 'employee']),
        ]);
    }

    /**
     * Display a specific leave request
     */
    public function show(LeaveRequest $leave)
    {
        $leave->load([
            'user',
            'leaveType',
            'managerApprover',
            'hrApprover',
        ]);

        // Get the employee's current balance for this leave type
        $leaveBalance = LeaveBalance::where('user_id', $leave->user_id)
            ->where('leave_type_id', $leave->leave_type_id)
            ->where('year', now()->year)
            ->first();

        return Inertia::render('Admin/Leaves/Show', [
            'leaveRequest' => $leave,
            'leaveBalance' => $leaveBalance,
        ]);
    }

    /**
     * Show the form for creating a new leave request (Admin version)
     * ✅ UPDATED: Support filing for other employees
     */
    public function create()
    {
        $currentUser = auth()->user();

        // ✅ Check if user is HR/Admin
        $isHROrAdmin = $currentUser->roles->whereIn('slug', [
            'super-admin',
            'admin',
            'hr-manager',
        ])->count() > 0;

        // Get available leave types
        $leaveTypes = LeaveType::active()->ordered()->get();

        // Get current user's balances (for when filing for self)
        $leaveBalances = LeaveBalance::where('user_id', $currentUser->id)
            ->where('year', now()->year)
            ->with('leaveType')
            ->get()
            ->keyBy('leave_type_id');

        // ✅ Get all employees (for HR/Admin to file on behalf of)
        $allUsers = [];
        if ($isHROrAdmin) {
            $allUsers = User::where('employment_status', 'active')
                ->with(['leaveBalances' => function ($query) {
                    $query->where('year', now()->year)->with('leaveType');
                }])
                ->orderBy('name')
                ->get(['id', 'name', 'position', 'department', 'emergency_contact_name', 'emergency_contact_phone']);
        }

        return Inertia::render('Admin/Leaves/Apply', [
            'leaveTypes' => $leaveTypes,
            'leaveBalances' => $leaveBalances,
            'user' => $currentUser,
            'allUsers' => $allUsers,
        ]);
    }

    /**
     * Store a newly created leave request (Admin version)
     * ✅ UPDATED: Support proxy filing
     */
    public function store(Request $request)
    {
        $currentUser = auth()->user();

        // ✅ Check if filing for another user
        $isHROrAdmin = $currentUser->roles->whereIn('slug', [
            'super-admin',
            'admin',
            'hr-manager',
        ])->count() > 0;

        // ✅ Validate user_id if provided (HR/Admin only)
        if ($request->has('user_id') && $request->user_id != $currentUser->id) {
            if (! $isHROrAdmin) {
                abort(403, 'You are not authorized to file leave for other employees.');
            }
            $targetUserId = $request->user_id;
        } else {
            $targetUserId = $currentUser->id;
        }

        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id', // ✅ Allow HR to file for others
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

        // Calculate total days
        $totalDays = $this->calculateTotalDays(
            $validated['start_date'],
            $validated['end_date'],
            $validated['duration']
        );

        // Get target user
        $targetUser = User::find($targetUserId);

        // ✅ GET LEAVE TYPE TO CHECK APPROVAL REQUIREMENTS
        $leaveType = LeaveType::findOrFail($validated['leave_type_id']);

        // ✅ Check balance for the TARGET user (not current user)
        $balance = LeaveBalance::where('user_id', $targetUserId)
            ->where('leave_type_id', $validated['leave_type_id'])
            ->where('year', now()->year)
            ->first();

        if (! $balance || ! $balance->hasSufficientBalance($totalDays)) {
            return back()->withInput()->with('error',
                'Insufficient leave balance. '.($targetUser->id === $currentUser->id ? 'You have' : $targetUser->name.' has').' '.
                ($balance ? $balance->remaining_days : 0).
                ' days remaining but requested '.$totalDays.' days.'
            );
        }

        // Set default emergency contact if requested
        if ($validated['use_default_emergency_contact']) {
            $validated['emergency_contact_name'] = $targetUser->emergency_contact_name;
            $validated['emergency_contact_phone'] = $targetUser->emergency_contact_phone;
        }

        // ✅ DYNAMIC APPROVAL FLOW BASED ON LEAVE TYPE CONFIGURATION
        $initialStatus = 'pending_manager'; // Default
        $successMessage = 'Leave request submitted successfully! Waiting for approval.';

        if (! $leaveType->requires_manager_approval && ! $leaveType->requires_hr_approval) {
            // ✅ NO APPROVAL NEEDED - AUTO APPROVE
            $initialStatus = 'approved';
            $successMessage = 'Leave request auto-approved! Balance has been updated.';

            // Deduct balance immediately
            $balance->deductDays($totalDays);

            // Set approval data
            $validated['manager_approved_by'] = $targetUserId;
            $validated['manager_approved_at'] = now();
            $validated['manager_comments'] = 'Auto-approved (no manager approval required)';
            $validated['hr_approved_by'] = $targetUserId;
            $validated['hr_approved_at'] = now();
            $validated['hr_comments'] = 'Auto-approved (no HR approval required)';

        } elseif (! $leaveType->requires_manager_approval && $leaveType->requires_hr_approval) {
            // ✅ SKIP MANAGER - GO STRAIGHT TO HR
            $initialStatus = 'pending_hr';
            $successMessage = 'Leave request submitted! Waiting for HR approval (manager approval not required).';

            // Mark manager as auto-approved
            $validated['manager_approved_by'] = $targetUserId;
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

        // Create leave request with open queue system (manager_id = null)
        $leaveRequest = LeaveRequest::create([
            ...$validated,
            'user_id' => $targetUserId,
            'total_days' => $totalDays,
            'status' => $initialStatus,
            'manager_id' => null, // ✅ Open queue system
        ]);

        // ✅ SEND EMAIL NOTIFICATION TO HR AND ADMIN
        $this->notifyHRAndAdmin($leaveRequest);

        // ✅ Different success messages for proxy filing
        if ($targetUserId !== $currentUser->id) {
            $successMessage = "Leave request for {$targetUser->name} created successfully! ".$successMessage;
        }

        return redirect()->route('leaves.index')->with('success', $successMessage);
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
