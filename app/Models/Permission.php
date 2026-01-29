<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'category',
        'group',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * Roles that have this permission
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'permission_role')
            ->withTimestamps();
    }

    /**
     * Users who have this permission (direct assignment/override)
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'permission_user')
            ->withPivot(['type', 'granted_by', 'granted_at', 'reason', 'expires_at'])
            ->withTimestamps();
    }

    /**
     * User overrides for this permission
     */
    public function userOverrides()
    {
        return $this->hasMany(UserPermissionOverride::class);
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeInGroup($query, string $group)
    {
        return $query->where('group', $group);
    }

    public function scopeBySlug($query, string $slug)
    {
        return $query->where('slug', $slug);
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Check if a specific role has this permission
     */
    public function isGrantedToRole($roleId)
    {
        return $this->roles()->where('role_id', $roleId)->exists();
    }

    /**
     * Check if a specific user has this permission (override)
     * Returns: 'grant', 'revoke', or null
     */
    public function isGrantedToUser($userId)
    {
        $pivot = $this->users()->where('user_id', $userId)->first();

        return $pivot ? $pivot->pivot->type : null;
    }
}
