<?php

namespace Database\Seeders;

use App\Models\LeaveBalance;
use App\Models\User;
use Illuminate\Database\Seeder;

class LeaveBalanceSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::where('employment_status', 'active')->get();
        $year = now()->year;

        foreach ($users as $user) {
            LeaveBalance::initializeForUser($user->id, $year);
        }

        $count = LeaveBalance::where('year', $year)->count();
        $this->command->info("✅ Initialized {$count} leave balances for {$users->count()} users (year {$year})!");
    }
}
