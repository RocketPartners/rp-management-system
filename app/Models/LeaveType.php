<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'days_per_year',
        'is_paid',
        'requires_medical_cert',
        'medical_cert_days_threshold',
        'is_carry_over_allowed',
        'max_carry_over_days',
        'requires_manager_approval',
        'requires_hr_approval',
        'color',
        'icon',
        'sort_order',
        'gender_specific',
        'is_active',
        'can_approve_roles',        // ✅ ADD THIS
        'skip_manager_for_roles',   // ✅ ADD THIS
    ];

    protected $casts = [
        'is_paid' => 'boolean',
        'requires_medical_cert' => 'boolean',
        'is_carry_over_allowed' => 'boolean',
        'requires_manager_approval' => 'boolean',
        'requires_hr_approval' => 'boolean',
        'is_active' => 'boolean',
        'can_approve_roles' => 'array',        // ✅ ADD THIS
        'skip_manager_for_roles' => 'boolean', // ✅ ADD THIS
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * A leave type has many leave balances (one per user per year)
     */
    public function leaveBalances()
    {
        return $this->hasMany(LeaveBalance::class);
    }

    /**
     * A leave type has many leave requests
     */
    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope: Only active leave types
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Order by sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Scope: Only paid leave types
     */
    public function scopePaid($query)
    {
        return $query->where('is_paid', true);
    }

    /**
     * Scope: Gender-specific leaves
     */
    public function scopeForGender($query, $gender)
    {
        return $query->where(function ($q) use ($gender) {
            $q->whereNull('gender_specific')
                ->orWhere('gender_specific', $gender);
        });
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Check if this leave type requires medical certificate
     * based on the number of days requested
     */
    public function requiresMedicalCertForDays($days)
    {
        if (! $this->requires_medical_cert) {
            return false;
        }

        if ($this->medical_cert_days_threshold === null) {
            return true; // Always require if threshold not set
        }

        return $days > $this->medical_cert_days_threshold;
    }

    /**
     * Get the display name with code
     * Example: "Vacation Leave (VL)"
     */
    public function getDisplayNameAttribute()
    {
        return "{$this->name} ({$this->code})";
    }

    /**
     * Check if user is eligible for this leave type based on gender
     */
    public function isEligibleForUser($user)
    {
        // If not gender-specific, everyone is eligible
        if ($this->gender_specific === null) {
            return true;
        }

        // Check if user's gender matches
        return $user->gender === $this->gender_specific;
    }

    /**
     * Get available leave types for a specific user
     */
    public static function availableForUser($user)
    {
        return self::active()
            ->ordered()
            ->get()
            ->filter(function ($leaveType) use ($user) {
                return $leaveType->isEligibleForUser($user);
            });
    }

    /**
     * Check if a user can approve leaves of this type (based on their roles)
     */
    public function userCanApprove($user)
    {
        // If no specific roles defined, anyone can approve (backward compatibility)
        if (empty($this->can_approve_roles)) {
            return true;
        }

        // Check if user has any of the allowed roles
        return $user->roles()->whereIn('slug', $this->can_approve_roles)->exists();
    }

    /**
     * Check if user should skip manager approval (e.g., Super Admin)
     */
    public function shouldSkipManagerApproval($user)
    {
        if (! $this->skip_manager_for_roles) {
            return false;
        }

        // Check if user has admin/HR roles that skip manager approval
        $adminRoles = ['super-admin', 'admin', 'hr-manager'];

        return $user->roles()->whereIn('slug', $adminRoles)->exists();
    }
}
