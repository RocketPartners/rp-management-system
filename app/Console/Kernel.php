<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // 🎯 Reset leave balances every January 1st at 12:00 AM
        $schedule->command('leaves:reset-year '.(now()->year + 1))
            ->yearlyOn(1, 1, '00:00') // Month 1, Day 1, at midnight
            ->timezone('Asia/Manila') // Change to your timezone if needed
            ->onSuccess(function () {
                \Log::info('✅ Leave balances reset successfully for year '.now()->year);
            })
            ->onFailure(function () {
                \Log::error('❌ Failed to reset leave balances for year '.now()->year);
            });
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
