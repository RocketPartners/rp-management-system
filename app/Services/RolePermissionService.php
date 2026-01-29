<?php

namespace App\Services;

use App\Models\Permission;
use App\Models\PermissionAuditLog;
use App\Models\Role;
use App\Models\User;

class RolePermissionService
{
    /**
     * Add permission to role (affects all users with this role)
     */
    public function addPermissionToRole(Role $role, Permission|string $permission, User $actor): void
    {
        if (is_string($permission)) {
            $permission = Permission::where('slug', $permission)->firstOrFail();
        }

        // Check if already exists
        if (! $role->permissions()->where('permission_id', $permission->id)->exists()) {
            $role->permissions()->attach($permission->id);

            // Log for each user with this role
            $users = $role->users;
            foreach ($users as $user) {
                PermissionAuditLog::create([
                    'user_id' => $user->id,
                    'permission_id' => $permission->id,
                    'action' => 'role_permission_added',
                    'actor_id' => $actor->id,
                    'context' => [
                        'role_id' => $role->id,
                        'role_name' => $role->name,
                    ],
                ]);

                // Clear permission cache
                $user->clearPermissionCache();
            }
        }
    }

    /**
     * Remove permission from role
     */
    public function removePermissionFromRole(Role $role, Permission|string $permission, User $actor): void
    {
        if (is_string($permission)) {
            $permission = Permission::where('slug', $permission)->firstOrFail();
        }

        // Check if exists
        if ($role->permissions()->where('permission_id', $permission->id)->exists()) {
            $role->permissions()->detach($permission->id);

            // Log for each user with this role
            $users = $role->users;
            foreach ($users as $user) {
                PermissionAuditLog::create([
                    'user_id' => $user->id,
                    'permission_id' => $permission->id,
                    'action' => 'role_permission_removed',
                    'actor_id' => $actor->id,
                    'context' => [
                        'role_id' => $role->id,
                        'role_name' => $role->name,
                    ],
                ]);

                // Clear permission cache
                $user->clearPermissionCache();
            }
        }
    }

    /**
     * Sync role permissions
     */
    public function syncRolePermissions(Role $role, array $permissionIds, User $actor): void
    {
        // Get current permissions
        $currentPermissions = $role->permissions()->pluck('permission_id')->toArray();

        // Sync
        $role->permissions()->sync($permissionIds);

        // Determine what changed
        $added = array_diff($permissionIds, $currentPermissions);
        $removed = array_diff($currentPermissions, $permissionIds);

        // Get users with this role
        $users = $role->users;

        // Log additions
        foreach ($added as $permissionId) {
            $permission = Permission::find($permissionId);
            if ($permission) {
                foreach ($users as $user) {
                    PermissionAuditLog::create([
                        'user_id' => $user->id,
                        'permission_id' => $permission->id,
                        'action' => 'role_permission_added',
                        'actor_id' => $actor->id,
                        'context' => [
                            'role_id' => $role->id,
                            'role_name' => $role->name,
                        ],
                    ]);
                }
            }
        }

        // Log removals
        foreach ($removed as $permissionId) {
            $permission = Permission::find($permissionId);
            if ($permission) {
                foreach ($users as $user) {
                    PermissionAuditLog::create([
                        'user_id' => $user->id,
                        'permission_id' => $permission->id,
                        'action' => 'role_permission_removed',
                        'actor_id' => $actor->id,
                        'context' => [
                            'role_id' => $role->id,
                            'role_name' => $role->name,
                        ],
                    ]);
                }
            }
        }

        // Clear cache for all users with this role
        foreach ($users as $user) {
            $user->clearPermissionCache();
        }
    }

    /**
     * Get role permission matrix for UI
     */
    public function getRolePermissionMatrix(Role $role): array
    {
        $allPermissions = Permission::active()->orderBy('group')->orderBy('name')->get();
        $rolePermissions = $role->permissions->pluck('id')->toArray();

        $grouped = [];

        foreach ($allPermissions as $permission) {
            $group = $permission->group ?? $permission->category ?? 'general';

            if (! isset($grouped[$group])) {
                $grouped[$group] = [];
            }

            $grouped[$group][] = [
                'id' => $permission->id,
                'name' => $permission->name,
                'slug' => $permission->slug,
                'description' => $permission->description,
                'assigned' => in_array($permission->id, $rolePermissions),
            ];
        }

        return $grouped;
    }

    /**
     * Preview impact: how many users affected if we add/remove permission from role
     */
    public function previewImpact(Role $role, Permission $permission, string $action): array
    {
        $users = $role->users;
        $usersCount = $users->count();

        $affected = [];
        $unaffected = [];

        foreach ($users as $user) {
            $override = $user->permissionOverrides()
                ->where('permission_id', $permission->id)
                ->active()
                ->first();

            if ($override) {
                // User has override - might not be affected
                if ($action === 'add' && $override->type === 'grant') {
                    $unaffected[] = $user->name.' (already granted)';
                } elseif ($action === 'remove' && $override->type === 'grant') {
                    $unaffected[] = $user->name.' (has grant override)';
                } elseif ($action === 'add' && $override->type === 'revoke') {
                    $unaffected[] = $user->name.' (has revoke override)';
                } elseif ($action === 'remove' && $override->type === 'revoke') {
                    $unaffected[] = $user->name.' (already revoked)';
                } else {
                    $affected[] = $user->name;
                }
            } else {
                // No override - will be affected
                $affected[] = $user->name;
            }
        }

        return [
            'total_users' => $usersCount,
            'affected_count' => count($affected),
            'unaffected_count' => count($unaffected),
            'affected_users' => $affected,
            'unaffected_users' => $unaffected,
            'action' => $action,
            'permission' => $permission->name,
            'role' => $role->name,
        ];
    }
}
