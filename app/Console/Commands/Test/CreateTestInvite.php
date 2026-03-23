<?php

namespace App\Console\Commands\Test;

use App\Models\OnboardingInvite;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class CreateTestInvite extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:create-invite
                            {--email= : Email address for the invite}
                            {--first_name= : First name of the candidate}
                            {--last_name= : Last name of the candidate}
                            {--position= : Position/role for the candidate}
                            {--department= : Department for the candidate}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a test onboarding invite for Playwright E2E tests';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Get first HR user as creator
        $creator = User::whereHas('roles', function ($query) {
            $query->whereIn('slug', ['super-admin', 'admin', 'hr-manager']);
        })->first();

        if (! $creator) {
            $this->error('No HR user found. Please seed the database first.');

            return 1;
        }

        // Create the invite
        $invite = OnboardingInvite::create([
            'email' => $this->option('email') ?: 'test-'.Str::random(8).'@example.com',
            'first_name' => $this->option('first_name') ?: 'Test',
            'last_name' => $this->option('last_name') ?: 'User',
            'position' => $this->option('position') ?: 'employee',
            'department' => $this->option('department') ?: 'Engineering',
            'token' => Str::random(64),
            'expires_at' => now()->addDays(7),
            'status' => 'pending',
            'created_by' => $creator->id,
        ]);

        // Output JSON for Playwright to parse
        $this->line(json_encode([
            'id' => $invite->id,
            'token' => $invite->token,
            'email' => $invite->email,
            'url' => url("/guest/onboarding/{$invite->token}"),
        ]));

        return 0;
    }
}
