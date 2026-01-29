<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ============================================
// SCHEDULED TASKS
// ============================================

// Clean up expired permission overrides daily at 2:00 AM
Schedule::command('permissions:cleanup-expired')->daily()->at('02:00');

// Reset leave balances on January 1st at 1:00 AM
Schedule::command('leaves:reset-year')
    ->yearly()
    ->monthlyOn(1, '01:00') // January 1st at 1:00 AM
    ->when(function () {
        return now()->month === 1 && now()->day === 1; // Only on Jan 1st
    })
    ->onSuccess(function () {
        \Log::info('Leave balances reset successfully for year '.now()->year);
    })
    ->onFailure(function () {
        \Log::error('Failed to reset leave balances for year '.now()->year);
    });
