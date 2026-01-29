<?php

namespace App\Http\Controllers;

use App\Http\Requests\GrantPermissionRequest;
use App\Http\Requests\RevokePermissionRequest;
use App\Http\Requests\UpdateUserPermissionsRequest;
use App\Models\Permission;
use App\Models\User;
use App\Services\PermissionService;
use Inertia\Inertia;

class UserPermissionController extends Controller
{
    public function __construct(
        protected PermissionService $permissionService
    ) {}

    /**
     * Show user's permission management page
     */
    public function edit(User $user)
    {
        // Authorize: must have users.assign-permissions
        if (! auth()->user()->hasPermission('users.assign-permissions')) {
            abort(403, 'You do not have permission to manage user permissions.');
        }

        // Load relationships
        $user->load('roles');

        // Get permission matrix
        $permissionMatrix = $this->permissionService->getUserPermissionMatrix($user);

        return Inertia::render('Admin/Users/Permissions', [
            'user' => $user,
            'permissionMatrix' => $permissionMatrix,
        ]);
    }

    /**
     * Update user's permission overrides
     */
    public function update(UpdateUserPermissionsRequest $request, User $user)
    {
        // Authorize
        if (! auth()->user()->hasPermission('users.assign-permissions')) {
            abort(403, 'You do not have permission to manage user permissions.');
        }

        $validated = $request->validated();

        \Log::info('Updating user permissions', [
            'user_id' => $user->id,
            'grants' => $validated['grants'] ?? [],
            'revokes' => $validated['revokes'] ?? [],
        ]);

        $this->permissionService->syncUserOverrides(
            $user,
            $validated['grants'] ?? [],
            $validated['revokes'] ?? [],
            auth()->user()
        );

        \Log::info('User permissions updated successfully', ['user_id' => $user->id]);

        return redirect()->back()->with('success', 'User permissions updated successfully.');
    }

    /**
     * Reset to role defaults
     */
    public function reset(User $user)
    {
        // Authorize
        if (! auth()->user()->hasPermission('users.assign-permissions')) {
            abort(403, 'You do not have permission to manage user permissions.');
        }

        $this->permissionService->resetToRoleDefaults($user, auth()->user());

        return redirect()->back()->with('success', 'User permissions reset to role defaults.');
    }

    /**
     * Grant single permission
     */
    public function grant(GrantPermissionRequest $request, User $user, Permission $permission)
    {
        // Authorize
        if (! auth()->user()->hasPermission('users.assign-permissions')) {
            abort(403, 'You do not have permission to manage user permissions.');
        }

        $validated = $request->validated();

        $this->permissionService->grantToUser(
            $user,
            $permission,
            auth()->user(),
            $validated['reason'] ?? null,
            $validated['expires_at'] ? \Carbon\Carbon::parse($validated['expires_at']) : null
        );

        return redirect()->back()->with('success', 'Permission granted successfully.');
    }

    /**
     * Revoke single permission
     */
    public function revoke(RevokePermissionRequest $request, User $user, Permission $permission)
    {
        // Authorize
        if (! auth()->user()->hasPermission('users.assign-permissions')) {
            abort(403, 'You do not have permission to manage user permissions.');
        }

        $validated = $request->validated();

        $this->permissionService->revokeFromUser(
            $user,
            $permission,
            auth()->user(),
            $validated['reason'] ?? null,
            $validated['expires_at'] ? \Carbon\Carbon::parse($validated['expires_at']) : null
        );

        return redirect()->back()->with('success', 'Permission revoked successfully.');
    }

    /**
     * Remove override
     */
    public function removeOverride(User $user, Permission $permission)
    {
        // Authorize
        if (! auth()->user()->hasPermission('users.assign-permissions')) {
            abort(403, 'You do not have permission to manage user permissions.');
        }

        $this->permissionService->removeOverride($user, $permission, auth()->user());

        return redirect()->back()->with('success', 'Permission override removed successfully.');
    }
}
