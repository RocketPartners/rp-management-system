<?php

namespace App\Console\Commands\Test;

use App\Models\OnboardingInvite;
use Illuminate\Console\Command;

class GetLatestInviteToken extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:get-latest-token';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Get the token of the most recently created onboarding invite';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $invite = OnboardingInvite::latest()->first();

        if (! $invite) {
            $this->error('No invites found in database.');

            return 1;
        }

        // Output just the token for easy parsing
        $this->line($invite->token);

        return 0;
    }
}
