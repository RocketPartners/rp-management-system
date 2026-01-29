<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveBalance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'leave_type_id',
        'year',
        'total_days',
        'used_days',
        'remaining_days',
        'carried_over_days',
        'adjustment_days',
        'adjustment_reason',
        'adjusted_by',
    ];

    protected $casts = [
        'year' => 'integer',
        'total_days' => 'decimal:1',
        'used_days' => 'decimal:1',
        'remaining_days' => 'decimal:1',
        'carried_over_days' => 'decimal:1',
        'adjustment_days' => 'decimal:1',
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * A leave balance belongs to a user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * A leave balance belongs to a leave type
     */
    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }

    /**
     * The user who made the adjustment (if any)
     */
    public function adjuster()
    {
        return $this->belongsTo(User::class, 'adjusted_by');
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope: Current year balances
     */
    public function scopeCurrentYear($query)
    {
        return $query->where('year', now()->year);
    }

    /**
     * Scope: For a specific user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: For a specific year
     */
    public function scopeForYear($query, $year)
    {
        return $query->where('year', $year);
    }

    /**
     * Scope: Low balance (< 25% remaining)
     */
    public function scopeLowBalance($query)
    {
        return $query->whereRaw('remaining_days < (total_days * 0.25)');
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Deduct days from balance (when leave is approved)
     */
    public function deductDays($days)
    {
        $this->used_days += $days;
        $this->remaining_days = $this->total_days - $this->used_days;
        $this->save();
    }

    /**
     * Restore days to balance (when leave is cancelled/rejected)
     */
    public function restoreDays($days)
    {
        $this->used_days = max(0, $this->used_days - $days);
        $this->remaining_days = $this->total_days - $this->used_days;
        $this->save();
    }

    /**
     * Check if user has enough balance for requested days
     */
    public function hasSufficientBalance($requestedDays)
    {
        return $this->remaining_days >= $requestedDays;
    }

    /**
     * Get balance percentage remaining
     */
    public function getBalancePercentageAttribute()
    {
        if ($this->total_days == 0) {
            return 0;
        }

        return round(($this->remaining_days / $this->total_days) * 100);
    }

    /**
     * Check if balance is low (< 25%)
     */
    public function isLowBalance()
    {
        return $this->balance_percentage < 25;
    }

    /**
     * Initialize balance for a new user or new year
     */
    public static function initializeForUser($userId, $year = null)
    {
        $year = $year ?? now()->year;

        // Get all active leave types
        $leaveTypes = LeaveType::active()->get();

        foreach ($leaveTypes as $leaveType) {
            // Check if balance already exists
            $exists = self::where('user_id', $userId)
                ->where('leave_type_id', $leaveType->id)
                ->where('year', $year)
                ->exists();

            if (! $exists) {
                self::create([
                    'user_id' => $userId,
                    'leave_type_id' => $leaveType->id,
                    'year' => $year,
                    'total_days' => $leaveType->days_per_year,
                    'used_days' => 0,
                    'remaining_days' => $leaveType->days_per_year,
                    'carried_over_days' => 0,
                ]);
            }
        }
    }

    /**
     * Reset all balances for a new year (run on Jan 1)
     */
    public static function resetForNewYear($newYear)
    {
        $previousYear = $newYear - 1;

        // Get all users
        $users = User::where('employment_status', 'active')->get();

        foreach ($users as $user) {
            $leaveTypes = LeaveType::active()->get();

            foreach ($leaveTypes as $leaveType) {
                // Get previous year's balance
                $previousBalance = self::where('user_id', $user->id)
                    ->where('leave_type_id', $leaveType->id)
                    ->where('year', $previousYear)
                    ->first();

                // Calculate carry over
                $carryOver = 0;
                if ($previousBalance && $leaveType->is_carry_over_allowed) {
                    $carryOver = min(
                        $previousBalance->remaining_days,
                        $leaveType->max_carry_over_days ?? 0
                    );
                }

                // Create new year balance
                self::create([
                    'user_id' => $user->id,
                    'leave_type_id' => $leaveType->id,
                    'year' => $newYear,
                    'total_days' => $leaveType->days_per_year + $carryOver,
                    'used_days' => 0,
                    'remaining_days' => $leaveType->days_per_year + $carryOver,
                    'carried_over_days' => $carryOver,
                ]);
            }
        }
    }
}
