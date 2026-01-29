<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPermissionOverride extends Model
{
    use HasFactory;

    protected $table = 'permission_user';

    protected $fillable = [
        'user_id',
        'permission_id',
        'type',
        'reason',
        'granted_by',
        'granted_at',
        'expires_at',
    ];

    protected $casts = [
        'granted_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function permission()
    {
        return $this->belongsTo(Permission::class);
    }

    public function grantedBy()
    {
        return $this->belongsTo(User::class, 'granted_by');
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeGrants($query)
    {
        return $query->where('type', 'grant');
    }

    public function scopeRevokes($query)
    {
        return $query->where('type', 'revoke');
    }

    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
                ->orWhere('expires_at', '>', now());
        });
    }

    public function scopeExpired($query)
    {
        return $query->whereNotNull('expires_at')
            ->where('expires_at', '<=', now());
    }

    // ============================================
    // ACCESSORS
    // ============================================

    public function getIsExpiredAttribute(): bool
    {
        if (! $this->expires_at) {
            return false;
        }

        return $this->expires_at->isPast();
    }
}
