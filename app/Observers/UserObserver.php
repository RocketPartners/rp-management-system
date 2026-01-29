<?php

namespace App\Observers;

use App\Models\LeaveBalance;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class UserObserver
{
    /**
     * Handle the User "saved" event (fires after database commit)
     */
    public function saved(User $user)
    {
        Log::info('🔔 UserObserver: User saved', [
            'user_id' => $user->id,
            'status' => $user->employment_status,
            'wasRecentlyCreated' => $user->wasRecentlyCreated,
        ]);

        // Only for newly created active users
        if ($user->wasRecentlyCreated && $user->employment_status === 'active') {
            Log::info('✅ Creating leave balances for NEW user', ['user_id' => $user->id]);

            // Check if balances already exist (safety check)
            $existingBalances = LeaveBalance::where('user_id', $user->id)
                ->where('year', now()->year)
                ->exists();

            if (! $existingBalances) {
                LeaveBalance::initializeForUser($user->id, now()->year);
                Log::info('✅ Leave balances created successfully', ['user_id' => $user->id]);
            } else {
                Log::info('ℹ️ Balances already exist', ['user_id' => $user->id]);
            }
        }
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user)
    {
        Log::info('🔔 UserObserver: User updated', ['user_id' => $user->id]);

        // If employment status changed to active
        if ($user->wasChanged('employment_status') && $user->employment_status === 'active') {
            $existingBalances = LeaveBalance::where('user_id', $user->id)
                ->where('year', now()->year)
                ->exists();

            if (! $existingBalances) {
                Log::info('✅ Creating leave balances (employment status change)', ['user_id' => $user->id]);
                LeaveBalance::initializeForUser($user->id, now()->year);
            }
        }

        // If account status changed to active
        if ($user->wasChanged('account_status') && $user->account_status === 'active') {
            $existingBalances = LeaveBalance::where('user_id', $user->id)
                ->where('year', now()->year)
                ->exists();

            if (! $existingBalances) {
                Log::info('✅ Creating leave balances (account status change)', ['user_id' => $user->id]);
                LeaveBalance::initializeForUser($user->id, now()->year);
            }
        }
    }
}
