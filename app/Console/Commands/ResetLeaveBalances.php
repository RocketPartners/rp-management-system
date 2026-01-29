<?php

namespace App\Console\Commands;

use App\Models\LeaveBalance;
use App\Models\User;
use Illuminate\Console\Command;

class ResetLeaveBalances extends Command
{
    protected $signature = 'leaves:reset-year 
                            {year? : The new year to create balances for (default: current year)}';

    protected $description = 'Reset leave balances for a new year with carry-over';

    public function handle()
    {
        $newYear = $this->argument('year') ?? now()->year;

        $this->info("🔄 Resetting leave balances for year {$newYear}...");
        $this->newLine();

        // Check if balances already exist for this year
        $existingCount = LeaveBalance::where('year', $newYear)->count();

        if ($existingCount > 0) {
            if (! $this->confirm("⚠️  Balances for {$newYear} already exist ({$existingCount} records). Reset anyway?")) {
                $this->warn('Operation cancelled.');

                return 1;
            }

            // Delete existing balances for this year
            LeaveBalance::where('year', $newYear)->delete();
            $this->info("✓ Deleted {$existingCount} existing balances");
        }

        // Reset balances
        try {
            LeaveBalance::resetForNewYear($newYear);

            $this->newLine();
            $this->info('✅ Leave balances reset successfully!');

            // Show summary
            $totalBalances = LeaveBalance::where('year', $newYear)->count();
            $totalUsers = User::where('employment_status', 'active')->count();
            $totalCarriedOver = LeaveBalance::where('year', $newYear)
                ->where('carried_over_days', '>', 0)
                ->sum('carried_over_days');

            $this->table(
                ['Metric', 'Count'],
                [
                    ['Active Users', $totalUsers],
                    ['Total Balances Created', $totalBalances],
                    ['Total Days Carried Over', number_format($totalCarriedOver, 1)],
                    ['Year', $newYear],
                ]
            );

            return 0;

        } catch (\Exception $e) {
            $this->error('❌ Failed to reset balances: '.$e->getMessage());

            return 1;
        }
    }
}
