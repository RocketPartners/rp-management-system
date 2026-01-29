<?php

namespace App\Services\Onboarding;

use App\Mail\Onboarding\GuestInviteMail;
use App\Models\OnboardingInvite;
use App\Models\OnboardingSubmission;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class OnboardingInviteService
{
    /**
     * Create a new onboarding invite and send email
     */
    public function createInvite(array $data)
    {
        DB::beginTransaction();

        try {
            // Generate unique token
            $token = $this->generateUniqueToken();

            // Set expiration (14 days from now)
            $expiresAt = now()->addDays(14);

            // Create invite
            $invite = OnboardingInvite::create([
                'email' => $data['email'],
                'first_name' => $data['first_name'] ?? null,
                'last_name' => $data['last_name'] ?? null,
                'position' => $data['position'] ?? null,
                'department' => $data['department'] ?? null,
                'token' => $token,
                'expires_at' => $expiresAt,
                'status' => 'pending',
                'created_by' => auth()->id(),
            ]);

            // Create empty submission for the invite
            OnboardingSubmission::create([
                'invite_id' => $invite->id,
                'status' => 'draft',
                'completion_percentage' => 0,
            ]);

            // Send invitation email using Mailable
            $this->sendInviteEmail($invite);

            DB::commit();

            return $invite;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Generate unique token for guest access
     */
    private function generateUniqueToken()
    {
        do {
            $token = Str::random(64);
        } while (OnboardingInvite::where('token', $token)->exists());

        return $token;
    }

    /**
     * Send invitation email to candidate using Mailable
     */
    public function sendInviteEmail(OnboardingInvite $invite)
    {
        Mail::to($invite->email)->send(new GuestInviteMail($invite));
    }

    /**
     * Resend invitation email
     */
    public function resendInvite(OnboardingInvite $invite)
    {
        if (! $invite->isValid()) {
            throw new \Exception('Cannot resend expired or cancelled invite.');
        }

        $this->sendInviteEmail($invite);

        return true;
    }

    /**
     * Extend invite expiration
     */
    public function extendExpiration(OnboardingInvite $invite, int $days = 7)
    {
        $newExpiration = $invite->expires_at
            ? $invite->expires_at->addDays($days)
            : now()->addDays($days);

        $invite->update([
            'expires_at' => $newExpiration,
            'status' => 'pending', // Reset from expired if needed
        ]);

        return $invite;
    }

    /**
     * Cancel an invite
     */
    public function cancelInvite(OnboardingInvite $invite)
    {
        if (in_array($invite->status, ['approved', 'submitted'])) {
            throw new \Exception('Cannot cancel already submitted or approved invites.');
        }

        $invite->update(['status' => 'cancelled']);

        return true;
    }

    /**
     * Mark expired invites (cron job helper)
     */
    public function markExpiredInvites()
    {
        $expiredInvites = OnboardingInvite::where('expires_at', '<=', now())
            ->whereIn('status', ['pending', 'in_progress'])
            ->get();

        foreach ($expiredInvites as $invite) {
            $invite->markAsExpired();
        }

        return $expiredInvites->count();
    }

    /**
     * Convert approved submission to User account
     */
    public function convertToUser(OnboardingInvite $invite)
    {
        if ($invite->status !== 'submitted') {
            throw new \Exception('Can only convert submitted invites to user accounts.');
        }

        if (! $invite->submission) {
            throw new \Exception('No submission found for this invite.');
        }

        DB::beginTransaction();

        try {
            // Convert submission data to user array
            $userData = $invite->submission->toUserArray();

            // Create user account
            $user = User::create($userData);

            // Update invite
            $invite->update([
                'status' => 'approved',
                'approved_at' => now(),
                'approved_by' => auth()->id(),
                'converted_user_id' => $user->id,
            ]);

            // Update submission
            $invite->submission->update([
                'status' => 'approved',
                'reviewed_at' => now(),
                'reviewed_by' => auth()->id(),
            ]);

            // TODO: Send welcome email with credentials
            // TODO: Initialize leave balances

            DB::commit();

            return $user;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get invite statistics
     */
    public function getStatistics()
    {
        return [
            'total' => OnboardingInvite::count(),
            'pending' => OnboardingInvite::pending()->count(),
            'in_progress' => OnboardingInvite::inProgress()->count(),
            'submitted' => OnboardingInvite::submitted()->count(),
            'approved' => OnboardingInvite::approved()->count(),
            'expired' => OnboardingInvite::expired()->count(),
        ];
    }
}
