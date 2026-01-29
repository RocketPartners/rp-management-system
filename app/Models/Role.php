<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    /**
     * ✅ NEW: Permissions assigned to this role
     */
    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'permission_role')
            ->withTimestamps();
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Check if this role has a specific permission
     */
    public function hasPermission($permissionSlug)
    {
        return $this->permissions()->where('slug', $permissionSlug)->exists();
    }

    /**
     * Grant a permission to this role
     */
    public function grantPermission($permissionSlug)
    {
        $permission = Permission::where('slug', $permissionSlug)->first();
        if ($permission && ! $this->hasPermission($permissionSlug)) {
            $this->permissions()->attach($permission->id);
        }
    }

    /**
     * Revoke a permission from this role
     */
    public function revokePermission($permissionSlug)
    {
        $permission = Permission::where('slug', $permissionSlug)->first();
        if ($permission) {
            $this->permissions()->detach($permission->id);
        }
    }

    /**
     * Sync permissions for this role
     */
    public function syncPermissions(array $permissionIds)
    {
        $this->permissions()->sync($permissionIds);
    }

    /**
     * Get array of permission slugs for this role
     */
    public function getPermissionSlugs(): array
    {
        return $this->permissions()->pluck('slug')->toArray();
    }
}
