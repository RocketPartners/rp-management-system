<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class OnboardingInvite extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'email',
        'first_name',
        'last_name',
        'position',
        'department',
        'token',
        'expires_at',
        'status',
        'created_by',
        'submitted_at',
        'approved_at',
        'approved_by',
        'converted_user_id',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    protected $appends = [
        'full_name',
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * HR user who created the invite
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * HR user who approved the submission
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * The submission data from the candidate
     */
    public function submission()
    {
        return $this->hasOne(OnboardingSubmission::class, 'invite_id');
    }

    /**
     * The created user account (after conversion)
     */
    public function convertedUser()
    {
        return $this->belongsTo(User::class, 'converted_user_id');
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'in_progress', 'submitted'])
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now())
            ->whereNotIn('status', ['approved', 'submitted']);
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Generate unique token for guest link
     */
    public static function generateToken()
    {
        return Str::random(64);
    }

    /**
     * Get the guest onboarding URL
     * ✅ FIXED: Use /guest/onboarding/ prefix to match routes
     */
    public function getGuestUrlAttribute()
    {
        return url("/guest/onboarding/{$this->token}");
    }

    /**
     * Check if invite is still valid
     */
    public function isValid()
    {
        return $this->status !== 'expired'
               && $this->status !== 'cancelled'
               && ($this->expires_at === null || $this->expires_at->isFuture());
    }

    /**
     * Check if invite has expired
     */
    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast()
               && ! in_array($this->status, ['approved', 'submitted']);
    }

    /**
     * Mark invite as expired
     */
    public function markAsExpired()
    {
        $this->update(['status' => 'expired']);
    }

    /**
     * Mark invite as in progress (candidate started)
     */
    public function markAsInProgress()
    {
        if ($this->status === 'pending') {
            $this->update(['status' => 'in_progress']);
        }
    }

    /**
     * Mark invite as submitted
     */
    public function markAsSubmitted()
    {
        $this->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);
    }

    /**
     * Get full name
     */
    public function getFullNameAttribute()
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    /**
     * Get status badge color
     */
    public function getStatusColorAttribute()
    {
        return match ($this->status) {
            'pending' => 'yellow',
            'in_progress' => 'blue',
            'submitted' => 'purple',
            'approved' => 'green',
            'expired' => 'gray',
            'cancelled' => 'red',
            default => 'gray',
        };
    }

    /**
     * Get days until expiration
     */
    public function getDaysUntilExpirationAttribute()
    {
        if (! $this->expires_at) {
            return null;
        }

        return now()->diffInDays($this->expires_at, false);
    }
}
