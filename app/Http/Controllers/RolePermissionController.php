<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateRolePermissionsRequest;
use App\Models\Permission;
use App\Models\Role;
use App\Services\RolePermissionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RolePermissionController extends Controller
{
    public function __construct(
        protected RolePermissionService $rolePermissionService
    ) {}

    /**
     * Show role's built-in permissions
     */
    public function edit(Role $role)
    {
        // Authorize: must have system.manage-roles
        if (! auth()->user()->hasPermission('system.manage-roles')) {
            abort(403, 'You do not have permission to manage role permissions.');
        }

        // Load relationships
        $role->load('users');

        // Get permission matrix
        $permissionMatrix = $this->rolePermissionService->getRolePermissionMatrix($role);

        return Inertia::render('Roles/Permissions', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug,
                'description' => $role->description,
                'users_count' => $role->users->count(),
            ],
            'permissionMatrix' => $permissionMatrix,
        ]);
    }

    /**
     * Update role's built-in permissions
     */
    public function update(UpdateRolePermissionsRequest $request, Role $role)
    {
        // Authorize
        if (! auth()->user()->hasPermission('system.manage-roles')) {
            abort(403, 'You do not have permission to manage role permissions.');
        }

        $validated = $request->validated();

        $this->rolePermissionService->syncRolePermissions(
            $role,
            $validated['permissions'] ?? [],
            auth()->user()
        );

        return redirect()->back()->with('success', 'Role permissions updated successfully.');
    }

    /**
     * Preview impact of changes
     */
    public function preview(Request $request, Role $role)
    {
        // Authorize
        if (! auth()->user()->hasPermission('system.manage-roles')) {
            abort(403, 'You do not have permission to manage role permissions.');
        }

        $permissionId = $request->input('permission_id');
        $action = $request->input('action'); // 'add' or 'remove'

        $permission = Permission::findOrFail($permissionId);

        $impact = $this->rolePermissionService->previewImpact($role, $permission, $action);

        return response()->json($impact);
    }
}
