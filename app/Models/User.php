<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'profile_picture',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'email',
        'phone_number',
        'personal_mobile',
        'work_email',
        'personal_email',
        'gender',
        'civil_status',
        'birthday',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'postal_code',
        'country',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_mobile',
        'emergency_contact_relationship',
        'sss_number',
        'tin_number',
        'hdmf_number',
        'philhealth_number',
        'payroll_account',
        'employee_id',
        'department',
        'position',
        'manager_id',
        'hire_date',
        'employment_status',
        'employment_type',
        'account_status',
        'approved_by',
        'approved_at',
        'password',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'birthday' => 'date',
        'hire_date' => 'date',
        'approved_at' => 'datetime',
        'password' => 'hashed',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factory_recovery_codes',
        'remember_token',
    ];

    // ✅ ADD THESE APPENDS
    protected $appends = [
        'can_approve_users',
        'can_manage_users',
        'can_approve_leaves',
        'can_manage_inventory',
        'can_manage_projects',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // ============================================
    // ROLES RELATIONSHIP
    // ============================================

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    public function hasRole($role)
    {
        return $this->roles()->where('slug', $role)->exists();
    }

    // ============================================
    // PERMISSIONS RELATIONSHIP
    // ============================================

    /**
     * Direct permissions assigned to this user (overrides)
     */
    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'permission_user')
            ->withPivot(['type', 'granted_by', 'granted_at', 'reason', 'expires_at'])
            ->withTimestamps();
    }

    /**
     * Permission overrides for this user (using UserPermissionOverride model)
     */
    public function permissionOverrides()
    {
        return $this->hasMany(UserPermissionOverride::class);
    }

    /**
     * Granted permission overrides only
     */
    public function grantedOverrides()
    {
        return $this->hasMany(UserPermissionOverride::class)->grants();
    }

    /**
     * Revoked permission overrides only
     */
    public function revokedOverrides()
    {
        return $this->hasMany(UserPermissionOverride::class)->revokes();
    }

    /**
     * Check if user has a specific permission
     * Priority: 1) User REVOKE override → deny, 2) User GRANT override → allow, 3) Role permission → allow, 4) Deny
     */
    public function hasPermission($permissionSlug): bool
    {
        // Check if user has direct permission override
        $userPermission = $this->permissions()
            ->where('slug', $permissionSlug)
            ->first();

        if ($userPermission) {
            $pivot = $userPermission->pivot;

            // Check if override has expired
            if ($pivot->expires_at && now()->greaterThan($pivot->expires_at)) {
                // Expired override - fall through to role permissions
            } else {
                // 1. If explicitly REVOKED for this user → deny (highest priority)
                if ($pivot->type === 'revoke') {
                    return false;
                }

                // 2. If explicitly GRANTED to this user → allow
                if ($pivot->type === 'grant') {
                    return true;
                }
            }
        }

        // 3. Check role permissions
        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permissionSlug) {
                $query->where('slug', $permissionSlug);
            })
            ->exists();
    }

    // ============================================
    // ✅ PERMISSION ACCESSORS (for frontend)
    // ============================================

    /**
     * Check if user can approve new user accounts (Senior/PM/Lead/HR/Admin)
     */
    public function getCanApproveUsersAttribute(): bool
    {
        return $this->hasPermission('approve-users');
    }

    /**
     * Check if user can manage users (view all, edit, delete) - HR/Admin ONLY
     */
    public function getCanManageUsersAttribute(): bool
    {
        return $this->roles()->whereIn('slug', [
            'super-admin',
            'admin',
            'hr-manager',
        ])->exists();
    }

    /**
     * Check if user can approve leave requests
     */
    public function getCanApproveLeavesAttribute(): bool
    {
        return $this->hasPermission('approve-leaves');
    }

    /**
     * Check if user can manage inventory
     */
    public function getCanManageInventoryAttribute(): bool
    {
        return $this->hasPermission('manage-inventory');
    }

    /**
     * Check if user can manage projects
     */
    public function getCanManageProjectsAttribute(): bool
    {
        return $this->hasPermission('manage-projects');
    }

    // ============================================
    // ✅ PERMISSION METHODS (for backend logic)
    // ============================================

    /**
     * Check if user can approve new user accounts
     */
    public function canApproveUsers(): bool
    {
        return $this->hasPermission('approve-users');
    }

    /**
     * Check if user can approve leave requests
     */
    public function canApproveLeaves(): bool
    {
        return $this->hasPermission('approve-leaves');
    }

    /**
     * Check if user can manage inventory
     */
    public function canManageInventory(): bool
    {
        return $this->hasPermission('manage-inventory');
    }

    /**
     * Check if user can manage projects
     */
    public function canManageProjects(): bool
    {
        return $this->hasPermission('manage-projects');
    }

    /**
     * Grant a permission directly to this user
     *
     * @deprecated Use PermissionService::grantToUser() instead
     */
    public function grantPermission($permissionSlug, $grantedBy = null, $reason = null)
    {
        $permission = Permission::where('slug', $permissionSlug)->first();

        if (! $permission) {
            return false;
        }

        $this->permissions()->syncWithoutDetaching([
            $permission->id => [
                'type' => 'grant',
                'granted_by' => $grantedBy ?? auth()->id(),
                'granted_at' => now(),
                'reason' => $reason,
            ],
        ]);

        return true;
    }

    /**
     * Revoke a permission directly from this user
     *
     * @deprecated Use PermissionService::revokeFromUser() instead
     */
    public function revokePermission($permissionSlug, $revokedBy = null, $reason = null)
    {
        $permission = Permission::where('slug', $permissionSlug)->first();

        if (! $permission) {
            return false;
        }

        $this->permissions()->syncWithoutDetaching([
            $permission->id => [
                'type' => 'revoke',
                'granted_by' => $revokedBy ?? auth()->id(),
                'granted_at' => now(),
                'reason' => $reason,
            ],
        ]);

        return true;
    }

    /**
     * Remove direct permission assignment (revert to role-based)
     */
    public function clearPermissionOverride($permissionSlug)
    {
        $permission = Permission::where('slug', $permissionSlug)->first();

        if ($permission) {
            $this->permissions()->detach($permission->id);
        }
    }

    /**
     * Get all user permissions (from roles + direct assignments)
     *
     * @deprecated Use getEffectivePermissions() instead
     */
    public function getAllPermissions()
    {
        $rolePermissions = $this->roles()
            ->with('permissions')
            ->get()
            ->pluck('permissions')
            ->flatten()
            ->unique('id');

        $userPermissions = $this->permissions;

        return $rolePermissions->merge($userPermissions)->unique('id');
    }

    /**
     * Check if user has any of the given permissions
     */
    public function hasAnyPermission(array $slugs): bool
    {
        foreach ($slugs as $slug) {
            if ($this->hasPermission($slug)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has all of the given permissions
     */
    public function hasAllPermissions(array $slugs): bool
    {
        foreach ($slugs as $slug) {
            if (! $this->hasPermission($slug)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get effective permissions (after applying role permissions + overrides)
     */
    public function getEffectivePermissions()
    {
        // Get all permissions from roles
        $rolePermissions = $this->roles()
            ->with('permissions')
            ->get()
            ->pluck('permissions')
            ->flatten()
            ->unique('id')
            ->keyBy('id');

        // Get user overrides
        $overrides = $this->permissionOverrides()->active()->with('permission')->get();

        // Apply overrides
        foreach ($overrides as $override) {
            if ($override->type === 'grant') {
                // Add granted permission
                $rolePermissions[$override->permission_id] = $override->permission;
            } elseif ($override->type === 'revoke') {
                // Remove revoked permission
                unset($rolePermissions[$override->permission_id]);
            }
        }

        return $rolePermissions->values();
    }

    /**
     * Get array of effective permission slugs (cached for performance)
     */
    public function getEffectivePermissionSlugs(): array
    {
        return \Cache::remember(
            "user:{$this->id}:permissions",
            now()->addHours(1),
            fn () => $this->getEffectivePermissions()->pluck('slug')->toArray()
        );
    }

    /**
     * Get permissions from roles only (no overrides)
     */
    public function getRolePermissions()
    {
        return $this->roles()
            ->with('permissions')
            ->get()
            ->pluck('permissions')
            ->flatten()
            ->unique('id');
    }

    /**
     * Get permission overrides only
     */
    public function getPermissionOverrides()
    {
        return $this->permissionOverrides()->active()->with('permission')->get();
    }

    /**
     * Get permissions grouped by group for UI display
     */
    public function getPermissionsGroupedForUI(): array
    {
        $allPermissions = Permission::active()->orderBy('group')->orderBy('name')->get();
        $rolePermissions = $this->getRolePermissions()->pluck('id')->toArray();
        $overrides = $this->permissionOverrides()->active()->get()->keyBy('permission_id');

        $grouped = [];

        foreach ($allPermissions as $permission) {
            $group = $permission->group ?? $permission->category ?? 'general';

            if (! isset($grouped[$group])) {
                $grouped[$group] = [];
            }

            $override = $overrides->get($permission->id);

            $grouped[$group][] = [
                'id' => $permission->id,
                'name' => $permission->name,
                'slug' => $permission->slug,
                'description' => $permission->description,
                'from_role' => in_array($permission->id, $rolePermissions),
                'override' => $override ? $override->type : null,
                'effective' => $this->hasPermission($permission->slug),
                'override_info' => $override ? [
                    'granted_by' => $override->grantedBy,
                    'reason' => $override->reason,
                    'expires_at' => $override->expires_at,
                    'created_at' => $override->created_at,
                ] : null,
            ];
        }

        return $grouped;
    }

    /**
     * Check if user has an override for this permission
     * Returns: 'grant', 'revoke', or null
     */
    public function hasPermissionOverride(string $slug): ?string
    {
        $permission = Permission::where('slug', $slug)->first();
        if (! $permission) {
            return null;
        }

        $override = $this->permissionOverrides()->active()
            ->where('permission_id', $permission->id)
            ->first();

        return $override ? $override->type : null;
    }

    /**
     * Check if permission comes from user's role
     */
    public function isPermissionFromRole(string $slug): bool
    {
        return $this->roles()
            ->whereHas('permissions', function ($query) use ($slug) {
                $query->where('slug', $slug);
            })
            ->exists();
    }

    /**
     * Check if permission is granted directly to user (override)
     */
    public function isPermissionGrantedDirectly(string $slug): bool
    {
        return $this->hasPermissionOverride($slug) === 'grant';
    }

    /**
     * Check if permission is revoked for user (override)
     */
    public function isPermissionRevoked(string $slug): bool
    {
        return $this->hasPermissionOverride($slug) === 'revoke';
    }

    /**
     * Clear permission cache for this user
     */
    public function clearPermissionCache(): void
    {
        \Cache::forget("user:{$this->id}:permissions");
    }

    // ============================================
    // PROJECTS & TASKS
    // ============================================

    public function ownedProjects()
    {
        return $this->hasMany(Project::class, 'owner_id');
    }

    public function assignedTasks()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function createdTasks()
    {
        return $this->hasMany(Task::class, 'created_by');
    }

    // ============================================
    // ASSET ASSIGNMENTS - OLD SYSTEM
    // ============================================

    public function assetAssignments()
    {
        return $this->hasMany(AssetAssignment::class);
    }

    public function currentAssets()
    {
        return $this->hasMany(AssetAssignment::class)->where('status', 'active');
    }

    // ============================================
    // ASSET ASSIGNMENTS - NEW SYSTEM
    // ============================================

    public function individualAssetAssignments()
    {
        return $this->hasMany(IndividualAssetAssignment::class);
    }

    public function currentIndividualAssets()
    {
        return $this->hasMany(IndividualAssetAssignment::class)
            ->where('status', 'active')
            ->whereNull('actual_return_date')
            ->with('asset.inventoryItem');
    }

    public function assignedAssets()
    {
        return $this->hasManyThrough(
            Asset::class,
            IndividualAssetAssignment::class,
            'user_id',
            'id',
            'id',
            'asset_id'
        )->where('individual_asset_assignments.status', 'active')
            ->whereNull('individual_asset_assignments.actual_return_date');
    }

    // ============================================
    // LEAVE MANAGEMENT RELATIONSHIPS
    // ============================================

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function subordinates()
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    public function leaveBalances()
    {
        return $this->hasMany(LeaveBalance::class);
    }

    public function currentYearLeaveBalances()
    {
        return $this->hasMany(LeaveBalance::class)
            ->where('year', now()->year)
            ->with('leaveType');
    }

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function pendingLeaveRequests()
    {
        return $this->hasMany(LeaveRequest::class)
            ->whereIn('status', ['pending_manager', 'pending_hr']);
    }

    public function approvedLeaveRequests()
    {
        return $this->hasMany(LeaveRequest::class)
            ->where('status', 'approved');
    }

    public function leaveRequestsToApprove()
    {
        return $this->hasMany(LeaveRequest::class, 'manager_id')
            ->where('status', 'pending_manager')
            ->with(['user', 'leaveType']);
    }

    public function getLeaveBalance($leaveTypeId)
    {
        return $this->leaveBalances()
            ->where('leave_type_id', $leaveTypeId)
            ->where('year', now()->year)
            ->first();
    }

    public function isManager()
    {
        return $this->subordinates()->exists();
    }

    public function getPendingLeaveApprovalsCountAttribute()
    {
        return $this->leaveRequestsToApprove()->count();
    }
}
