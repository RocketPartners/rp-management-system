<?php

namespace App\Policies;

use App\Models\OnboardingSubmission;
use App\Models\User;

class OnboardingSubmissionPolicy
{
    /**
     * Determine if the user can view any submissions
     */
    public function viewAny(User $user): bool
    {
        return $this->isHrUser($user);
    }

    /**
     * Determine if the user can view a specific submission
     */
    public function view(User $user, OnboardingSubmission $submission): bool
    {
        return $this->isHrUser($user);
    }

    /**
     * Determine if the user can review/approve submissions
     */
    public function review(User $user, OnboardingSubmission $submission): bool
    {
        return $this->isHrUser($user);
    }

    /**
     * Determine if the user can approve documents
     */
    public function approveDocument(User $user): bool
    {
        return $this->isHrUser($user);
    }

    /**
     * Determine if the user can finalize submissions
     */
    public function finalize(User $user, OnboardingSubmission $submission): bool
    {
        return $this->isHrUser($user);
    }

    /**
     * Check if user has HR role
     */
    private function isHrUser(User $user): bool
    {
        // Eager load roles if not already loaded
        if (! $user->relationLoaded('roles')) {
            $user->load('roles');
        }

        return $user->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->isNotEmpty();
    }
}
