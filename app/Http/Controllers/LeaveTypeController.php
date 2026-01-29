<?php

namespace App\Http\Controllers;

use App\Models\LeaveBalance;
use App\Models\LeaveType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveTypeController extends Controller
{
    /**
     * Display a listing of leave types
     */
    public function index(Request $request)
    {
        // Check permission
        if (! auth()->user()->hasRole('super-admin') &&
            ! auth()->user()->hasRole('admin') &&
            ! auth()->user()->hasRole('hr-manager')) {
            abort(403, 'You do not have permission to manage leave types.');
        }

        $query = LeaveType::query();

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $isActive = $request->status === 'active';
            $query->where('is_active', $isActive);
        }

        // Filter by paid/unpaid
        if ($request->has('payment_type') && $request->payment_type !== 'all') {
            $isPaid = $request->payment_type === 'paid';
            $query->where('is_paid', $isPaid);
        }

        $leaveTypes = $query->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        // Calculate statistics
        $stats = [
            'total' => LeaveType::count(),
            'active' => LeaveType::where('is_active', true)->count(),
            'inactive' => LeaveType::where('is_active', false)->count(),
            'paid' => LeaveType::where('is_paid', true)->count(),
            'unpaid' => LeaveType::where('is_paid', false)->count(),
            'total_days_per_year' => LeaveType::where('is_active', true)->sum('days_per_year'),
        ];

        return Inertia::render('Admin/Leaves/Types', [
            'leaveTypes' => $leaveTypes,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'payment_type']),
        ]);
    }

    /**
     * Show the form for creating a new leave type
     */
    public function create()
    {
        // Check permission
        if (! auth()->user()->hasRole('super-admin') &&
            ! auth()->user()->hasRole('admin') &&
            ! auth()->user()->hasRole('hr-manager')) {
            abort(403, 'You do not have permission to create leave types.');
        }

        // Get available colors and icons for UI
        $availableColors = [
            '#3B82F6' => 'Blue',
            '#EF4444' => 'Red',
            '#F59E0B' => 'Orange',
            '#10B981' => 'Green',
            '#8B5CF6' => 'Purple',
            '#EC4899' => 'Pink',
            '#6B7280' => 'Gray',
            '#14B8A6' => 'Teal',
        ];

        $availableIcons = [
            'Palmtree', 'Heart', 'AlertTriangle', 'Baby',
            'Cake', 'AlertCircle', 'Plane', 'Home',
            'Clock', 'Calendar', 'Sun', 'Moon',
        ];

        return Inertia::render('Admin/Leaves/CreateType', [
            'availableColors' => $availableColors,
            'availableIcons' => $availableIcons,
        ]);
    }

    /**
     * Store a newly created leave type
     */
    public function store(Request $request)
    {
        // Check permission
        if (! auth()->user()->hasRole('super-admin') &&
            ! auth()->user()->hasRole('admin') &&
            ! auth()->user()->hasRole('hr-manager')) {
            abort(403, 'You do not have permission to create leave types.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:leave_types,code',
            'description' => 'nullable|string|max:1000',
            'days_per_year' => 'required|integer|min:0|max:365',
            'is_paid' => 'required|boolean',
            'requires_medical_cert' => 'required|boolean',
            'medical_cert_days_threshold' => 'nullable|integer|min:1',
            'is_carry_over_allowed' => 'required|boolean',
            'max_carry_over_days' => 'nullable|integer|min:0',
            'requires_manager_approval' => 'required|boolean',
            'requires_hr_approval' => 'required|boolean',
            'color' => 'required|string|max:7',
            'icon' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer|min:0',
            'gender_specific' => 'nullable|in:male,female',
            'is_active' => 'required|boolean',
        ]);

        // Set default sort order if not provided
        if (! isset($validated['sort_order'])) {
            $validated['sort_order'] = LeaveType::max('sort_order') + 1;
        }

        $leaveType = LeaveType::create($validated);

        // Create leave balances for all active users for current year
        if ($leaveType->is_active && $leaveType->days_per_year > 0) {
            $this->initializeBalancesForNewLeaveType($leaveType);
        }

        return redirect()->route('leave-types.index')
            ->with('success', "Leave type '{$leaveType->name}' created successfully!");
    }

    /**
     * Show the form for editing a leave type
     */
    public function edit(LeaveType $leaveType)
    {
        // Check permission
        if (! auth()->user()->hasRole('super-admin') &&
            ! auth()->user()->hasRole('admin') &&
            ! auth()->user()->hasRole('hr-manager')) {
            abort(403, 'You do not have permission to edit leave types.');
        }

        $availableColors = [
            '#3B82F6' => 'Blue',
            '#EF4444' => 'Red',
            '#F59E0B' => 'Orange',
            '#10B981' => 'Green',
            '#8B5CF6' => 'Purple',
            '#EC4899' => 'Pink',
            '#6B7280' => 'Gray',
            '#14B8A6' => 'Teal',
        ];

        $availableIcons = [
            'Palmtree', 'Heart', 'AlertTriangle', 'Baby',
            'Cake', 'AlertCircle', 'Plane', 'Home',
            'Clock', 'Calendar', 'Sun', 'Moon',
        ];

        // Get usage statistics
        $usageStats = [
            'total_balances' => LeaveBalance::where('leave_type_id', $leaveType->id)->count(),
            'active_requests' => $leaveType->leaveRequests()
                ->whereIn('status', ['pending_manager', 'pending_hr', 'approved'])
                ->count(),
            'total_days_used' => LeaveBalance::where('leave_type_id', $leaveType->id)
                ->sum('used_days'),
        ];

        return Inertia::render('Admin/Leaves/EditType', [
            'leaveType' => $leaveType,
            'availableColors' => $availableColors,
            'availableIcons' => $availableIcons,
            'usageStats' => $usageStats,
        ]);
    }

    /**
     * Update the specified leave type
     */
    public function update(Request $request, LeaveType $leaveType)
    {
        // Check permission
        if (! auth()->user()->hasRole('super-admin') &&
            ! auth()->user()->hasRole('admin') &&
            ! auth()->user()->hasRole('hr-manager')) {
            abort(403, 'You do not have permission to update leave types.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:leave_types,code,'.$leaveType->id,
            'description' => 'nullable|string|max:1000',
            'days_per_year' => 'required|integer|min:0|max:365',
            'is_paid' => 'required|boolean',
            'requires_medical_cert' => 'required|boolean',
            'medical_cert_days_threshold' => 'nullable|integer|min:1',
            'is_carry_over_allowed' => 'required|boolean',
            'max_carry_over_days' => 'nullable|integer|min:0',
            'requires_manager_approval' => 'required|boolean',
            'requires_hr_approval' => 'required|boolean',
            'color' => 'required|string|max:7',
            'icon' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer|min:0',
            'gender_specific' => 'nullable|in:male,female',
            'is_active' => 'required|boolean',
        ]);

        // Check if days_per_year changed
        $daysChanged = $leaveType->days_per_year !== $validated['days_per_year'];

        $leaveType->update($validated);

        // If days changed, update all future year balances
        if ($daysChanged) {
            $this->updateBalancesForModifiedLeaveType($leaveType, $validated['days_per_year']);
        }

        return redirect()->route('leave-types.index')
            ->with('success', "Leave type '{$leaveType->name}' updated successfully!");
    }

    /**
     * Toggle active status of a leave type
     */
    public function toggleActive(LeaveType $leaveType)
    {
        // Check permission
        if (! auth()->user()->hasRole('super-admin') &&
            ! auth()->user()->hasRole('admin') &&
            ! auth()->user()->hasRole('hr-manager')) {
            abort(403, 'You do not have permission to modify leave types.');
        }

        // Check if there are active requests
        $activeRequests = $leaveType->leaveRequests()
            ->whereIn('status', ['pending_manager', 'pending_hr', 'approved'])
            ->count();

        if ($leaveType->is_active && $activeRequests > 0) {
            return back()->with('error',
                "Cannot deactivate '{$leaveType->name}'. There are {$activeRequests} active leave request(s) using this type."
            );
        }

        $leaveType->update([
            'is_active' => ! $leaveType->is_active,
        ]);

        $status = $leaveType->is_active ? 'activated' : 'deactivated';

        return back()->with('success',
            "Leave type '{$leaveType->name}' has been {$status}."
        );
    }

    /**
     * Remove the specified leave type
     */
    public function destroy(LeaveType $leaveType)
    {
        // Check permission
        if (! auth()->user()->hasRole('super-admin') &&
            ! auth()->user()->hasRole('admin') &&
            ! auth()->user()->hasRole('hr-manager')) {
            abort(403, 'You do not have permission to delete leave types.');
        }

        // Check if there are any leave requests using this type
        $requestCount = $leaveType->leaveRequests()->count();

        if ($requestCount > 0) {
            return back()->with('error',
                "Cannot delete '{$leaveType->name}'. There are {$requestCount} leave request(s) using this type. Consider deactivating it instead."
            );
        }

        // Check if there are any balances using this type
        $balanceCount = $leaveType->leaveBalances()->count();

        if ($balanceCount > 0) {
            // Delete all balances first
            $leaveType->leaveBalances()->delete();
        }

        $name = $leaveType->name;
        $leaveType->delete();

        return redirect()->route('leave-types.index')
            ->with('success', "Leave type '{$name}' deleted successfully.");
    }

    /**
     * Initialize leave balances for all active users when a new leave type is created
     */
    private function initializeBalancesForNewLeaveType(LeaveType $leaveType)
    {
        $activeUsers = \App\Models\User::where('employment_status', 'active')->get();
        $currentYear = now()->year;

        foreach ($activeUsers as $user) {
            // Check if user is eligible (gender-specific check)
            if ($leaveType->gender_specific && $user->gender !== $leaveType->gender_specific) {
                continue;
            }

            // Create balance for current year
            LeaveBalance::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'leave_type_id' => $leaveType->id,
                    'year' => $currentYear,
                ],
                [
                    'total_days' => $leaveType->days_per_year,
                    'used_days' => 0,
                    'remaining_days' => $leaveType->days_per_year,
                    'carried_over_days' => 0,
                ]
            );
        }
    }

    /**
     * Update existing balances when days_per_year is modified
     */
    private function updateBalancesForModifiedLeaveType(LeaveType $leaveType, $newDaysPerYear)
    {
        $currentYear = now()->year;

        // Only update future years (not current year to avoid conflicts)
        $futureBalances = LeaveBalance::where('leave_type_id', $leaveType->id)
            ->where('year', '>', $currentYear)
            ->get();

        foreach ($futureBalances as $balance) {
            $balance->update([
                'total_days' => $newDaysPerYear,
                'remaining_days' => $newDaysPerYear - $balance->used_days,
            ]);
        }
    }
}
