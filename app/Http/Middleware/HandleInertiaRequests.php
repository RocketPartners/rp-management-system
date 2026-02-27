<?php

namespace App\Http\Middleware;

use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // Calculate pending counts
        $pendingCounts = [
            'users' => 0,
            'manager_leaves' => 0,
            'hr_leaves' => 0,
            'my_leave_updates' => 0,
        ];

        if ($user) {
            // Pending user approvals (for HR/Admin)
            if ($user->hasPermission('users.approve')) {
                $pendingCounts['users'] = User::where('account_status', 'pending')->count();
            }

            // Pending manager leave approvals
            if ($user->hasPermission('leaves.approve')) {
                $userMaxHierarchyLevel = $user->roles->max('hierarchy_level');

                // Don't count for HR/Admin (level 9+)
                if ($userMaxHierarchyLevel < 9) {
                    $canApproveRoles = \App\Models\Role::where('hierarchy_level', '<', $userMaxHierarchyLevel)
                        ->pluck('slug')
                        ->toArray();

                    $pendingCounts['manager_leaves'] = LeaveRequest::where('status', 'pending_manager')
                        ->where(function ($q) use ($user, $canApproveRoles) {
                            $q->where('manager_id', $user->id);

                            if (!empty($canApproveRoles)) {
                                $q->orWhere(function ($roleQuery) use ($canApproveRoles) {
                                    $roleQuery->whereNull('manager_id')
                                        ->whereHas('user.roles', function ($q) use ($canApproveRoles) {
                                            $q->whereIn('slug', $canApproveRoles);
                                        });
                                });
                            }
                        })
                        ->count();
                }
            }

            // Pending HR leave approvals
            if ($user->hasPermission('leaves.manage') || $user->hasPermission('leaves.view-all')) {
                $pendingCounts['hr_leaves'] = LeaveRequest::where('status', 'pending_hr')
                    ->where(function ($q) use ($user) {
                        $q->where('manager_id', $user->id)
                          ->orWhereNull('manager_id');
                    })
                    ->count();
            }

            // My leave updates (approved/rejected since last check)
            $lastCheck = $user->last_notification_check ?? now()->subDays(7);
            $pendingCounts['my_leave_updates'] = LeaveRequest::where('user_id', $user->id)
                ->whereIn('status', ['approved', 'rejected_by_manager', 'rejected_by_hr'])
                ->where(function ($q) use ($lastCheck) {
                    $q->where('updated_at', '>', $lastCheck)
                      ->orWhere('hr_approved_at', '>', $lastCheck)
                      ->orWhere('manager_approved_at', '>', $lastCheck);
                })
                ->count();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    ...$user->load('roles')->toArray(),
                    // ✅ New permission system - array of slugs
                    'permissions' => $user->getEffectivePermissionSlugs(),
                    // ✅ Legacy permission flags (for backward compatibility)
                    'can_approve_users' => $user->canApproveUsers(),
                    'can_approve_leaves' => $user->canApproveLeaves(),
                    'can_manage_inventory' => $user->canManageInventory(),
                    'can_manage_projects' => $user->canManageProjects(),
                ] : null,
            ],
            'pendingCounts' => $pendingCounts,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
