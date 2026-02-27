<?php

namespace Database\Seeders;

use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class CalendarTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users and leave types
        $users = User::all();
        $leaveTypes = LeaveType::all();

        if ($users->isEmpty()) {
            $this->command->error('No users found. Please create users first.');

            return;
        }

        if ($leaveTypes->isEmpty()) {
            $this->command->error('No leave types found. Please run leave types seeder first.');

            return;
        }

        $this->command->info('Creating test leave requests for calendar...');

        // Test date for overflow scenario - 10 days from now
        $overflowTestDate = Carbon::now()->addDays(10);

        // Create a specific date with 5+ users for overflow testing
        $this->command->info("Creating overflow test scenario on {$overflowTestDate->format('M d, Y')}...");

        $testLeaves = [
            // OVERFLOW TEST: 6 users on the same day (to test +3 more functionality)
            [
                'user' => $users->skip(0)->first(),
                'leave_type' => $leaveTypes->where('code', 'VL')->first() ?? $leaveTypes->first(),
                'start_date' => $overflowTestDate,
                'end_date' => $overflowTestDate,
                'status' => 'approved',
            ],
            [
                'user' => $users->skip(1)->first(),
                'leave_type' => $leaveTypes->where('code', 'SL')->first() ?? $leaveTypes->first(),
                'start_date' => $overflowTestDate,
                'end_date' => $overflowTestDate,
                'status' => 'approved',
            ],
            [
                'user' => $users->skip(2)->first(),
                'leave_type' => $leaveTypes->where('code', 'EL')->first() ?? $leaveTypes->first(),
                'start_date' => $overflowTestDate,
                'end_date' => $overflowTestDate,
                'status' => 'approved',
            ],
            [
                'user' => $users->skip(3)->first(),
                'leave_type' => $leaveTypes->where('code', 'VL')->first() ?? $leaveTypes->first(),
                'start_date' => $overflowTestDate,
                'end_date' => $overflowTestDate,
                'status' => 'approved',
            ],
            [
                'user' => $users->skip(4)->first(),
                'leave_type' => $leaveTypes->where('code', 'SL')->first() ?? $leaveTypes->first(),
                'start_date' => $overflowTestDate,
                'end_date' => $overflowTestDate,
                'status' => 'approved',
            ],
            [
                'user' => $users->skip(5)->first(),
                'leave_type' => $leaveTypes->where('code', 'ML')->first() ?? $leaveTypes->first(),
                'start_date' => $overflowTestDate,
                'end_date' => $overflowTestDate,
                'status' => 'approved',
            ],

            // MODERATE TEST: 4 users on another day
            [
                'user' => $users->skip(6)->first(),
                'leave_type' => $leaveTypes->random(),
                'start_date' => Carbon::now()->startOfMonth()->addDays(5),
                'end_date' => Carbon::now()->startOfMonth()->addDays(5),
                'status' => 'approved',
            ],
            [
                'user' => $users->skip(7)->first(),
                'leave_type' => $leaveTypes->random(),
                'start_date' => Carbon::now()->startOfMonth()->addDays(5),
                'end_date' => Carbon::now()->startOfMonth()->addDays(5),
                'status' => 'approved',
            ],
            [
                'user' => $users->skip(8)->first(),
                'leave_type' => $leaveTypes->random(),
                'start_date' => Carbon::now()->startOfMonth()->addDays(5),
                'end_date' => Carbon::now()->startOfMonth()->addDays(5),
                'status' => 'approved',
            ],
            [
                'user' => $users->skip(9)->first(),
                'leave_type' => $leaveTypes->random(),
                'start_date' => Carbon::now()->startOfMonth()->addDays(5),
                'end_date' => Carbon::now()->startOfMonth()->addDays(5),
                'status' => 'approved',
            ],

            // Current month - varied dates
            [
                'user' => $users->random(),
                'leave_type' => $leaveTypes->random(),
                'start_date' => Carbon::now()->startOfMonth()->addDays(12),
                'end_date' => Carbon::now()->startOfMonth()->addDays(14),
                'status' => 'approved',
            ],
            [
                'user' => $users->random(),
                'leave_type' => $leaveTypes->random(),
                'start_date' => Carbon::now()->startOfMonth()->addDays(15),
                'end_date' => Carbon::now()->startOfMonth()->addDays(15),
                'status' => 'approved',
            ],
            [
                'user' => $users->random(),
                'leave_type' => $leaveTypes->random(),
                'start_date' => Carbon::now()->startOfMonth()->addDays(20),
                'end_date' => Carbon::now()->startOfMonth()->addDays(22),
                'status' => 'approved',
            ],
            // This week
            [
                'user' => $users->random(),
                'leave_type' => $leaveTypes->random(),
                'start_date' => Carbon::now()->startOfWeek()->addDays(1),
                'end_date' => Carbon::now()->startOfWeek()->addDays(2),
                'status' => 'approved',
            ],
            [
                'user' => $users->random(),
                'leave_type' => $leaveTypes->random(),
                'start_date' => Carbon::now()->startOfWeek()->addDays(3),
                'end_date' => Carbon::now()->startOfWeek()->addDays(4),
                'status' => 'approved',
            ],
            // Today - 3 users to test exact limit
            [
                'user' => $users->skip(10)->first(),
                'leave_type' => $leaveTypes->random(),
                'start_date' => Carbon::today(),
                'end_date' => Carbon::today(),
                'status' => 'approved',
            ],
            [
                'user' => $users->skip(11)->first(),
                'leave_type' => $leaveTypes->random(),
                'start_date' => Carbon::today(),
                'end_date' => Carbon::today(),
                'status' => 'approved',
            ],
            [
                'user' => $users->skip(12)->first(),
                'leave_type' => $leaveTypes->random(),
                'start_date' => Carbon::today(),
                'end_date' => Carbon::today(),
                'status' => 'approved',
            ],
            // Tomorrow
            [
                'user' => $users->random(),
                'leave_type' => $leaveTypes->random(),
                'start_date' => Carbon::tomorrow(),
                'end_date' => Carbon::tomorrow()->addDay(),
                'status' => 'approved',
            ],
            // Next week
            [
                'user' => $users->random(),
                'leave_type' => $leaveTypes->random(),
                'start_date' => Carbon::now()->addWeek()->startOfWeek(),
                'end_date' => Carbon::now()->addWeek()->startOfWeek()->addDays(4),
                'status' => 'approved',
            ],
            // Next month
            [
                'user' => $users->random(),
                'leave_type' => $leaveTypes->random(),
                'start_date' => Carbon::now()->addMonth()->startOfMonth()->addDays(5),
                'end_date' => Carbon::now()->addMonth()->startOfMonth()->addDays(9),
                'status' => 'approved',
            ],
            // Some pending requests (won't show on calendar)
            [
                'user' => $users->random(),
                'leave_type' => $leaveTypes->random(),
                'start_date' => Carbon::now()->addDays(3),
                'end_date' => Carbon::now()->addDays(5),
                'status' => 'pending',
            ],
        ];

        $manager = User::whereHas('roles', function ($query) {
            $query->whereIn('slug', ['manager', 'admin', 'super-admin']);
        })->first();

        foreach ($testLeaves as $leave) {
            $totalDays = $leave['start_date']->diffInDays($leave['end_date']) + 1;

            LeaveRequest::create([
                'user_id' => $leave['user']->id,
                'leave_type_id' => $leave['leave_type']->id,
                'manager_id' => $manager?->id,
                'start_date' => $leave['start_date'],
                'end_date' => $leave['end_date'],
                'total_days' => $totalDays,
                'reason' => 'Test leave request for calendar demonstration',
                'status' => $leave['status'] === 'approved' ? 'approved' : 'pending_manager',
                'manager_approved_by' => $leave['status'] === 'approved' ? $manager?->id : null,
                'manager_approved_at' => $leave['status'] === 'approved' ? now() : null,
                'hr_approved_by' => $leave['status'] === 'approved' ? $manager?->id : null,
                'hr_approved_at' => $leave['status'] === 'approved' ? now() : null,
            ]);

            $this->command->info("Created {$leave['status']} leave for {$leave['user']->name}: {$leave['start_date']->format('M d')} - {$leave['end_date']->format('M d')}");
        }

        $this->command->info('✓ Calendar test data created successfully!');
        $this->command->info('Total approved leaves: '.LeaveRequest::where('status', 'approved')->count());
        $this->command->info('');
        $this->command->info('📊 Test Scenarios Created:');
        $this->command->info("   • {$overflowTestDate->format('M d, Y')}: 6 users (tests +3 more overflow)");
        $this->command->info('   • '.Carbon::now()->startOfMonth()->addDays(5)->format('M d, Y').': 4 users (tests +1 more)');
        $this->command->info('   • Today: 3 users (tests exact limit, no overflow)');
        $this->command->info('');
        $this->command->info('🎯 Navigate to the calendar to see the overflow behavior!');
    }
}
