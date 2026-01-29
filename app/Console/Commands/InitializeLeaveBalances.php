<?php

namespace App\Console\Commands;

use App\Models\LeaveBalance;
use App\Models\User;
use Illuminate\Console\Command;

class InitializeLeaveBalances extends Command
{
    protected $signature = 'leaves:initialize-balances 
                            {--year= : The year to initialize balances for (default: current year)}
                            {--user= : Specific user ID to initialize (optional)}';

    protected $description = 'Initialize leave balances for all active users';

    public function handle()
    {
        $year = $this->option('year') ?? now()->year;
        $userId = $this->option('user');

        $this->info("Initializing leave balances for year {$year}...");

        if ($userId) {
            $users = User::where('id', $userId)
                ->where('employment_status', 'active')
                ->get();

            if ($users->isEmpty()) {
                $this->error("User with ID {$userId} not found or not active.");

                return 1;
            }
        } else {
            $users = User::where('employment_status', 'active')->get();
        }

        $this->info("Found {$users->count()} user(s) to initialize.");

        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        $initialized = 0;

        foreach ($users as $user) {
            $created = LeaveBalance::initializeForUser($user->id, $year);
            $initialized += $created;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info('✅ Leave balances initialized successfully!');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Users processed', $users->count()],
                ['Balances created', $initialized],
                ['Year', $year],
            ]
        );

        return 0;
    }
}
