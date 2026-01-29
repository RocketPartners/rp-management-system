<?php

namespace Database\Seeders;

use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Illuminate\Database\Seeder;

class LeaveRequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first user (admin)
        $user = User::first();

        if (! $user) {
            $this->command->error('No users found. Please create users first.');

            return;
        }

        // Get leave types
        $vacationLeave = LeaveType::where('code', 'VL')->first();
        $sickLeave = LeaveType::where('code', 'SL')->first();
        $emergencyLeave = LeaveType::where('code', 'EL')->first();

        if (! $vacationLeave || ! $sickLeave || ! $emergencyLeave) {
            $this->command->error('Leave types not found. Run LeaveTypeSeeder first.');

            return;
        }

        // Create sample leave requests with different statuses
        $leaveRequests = [
            // Approved Vacation Leave
            [
                'user_id' => $user->id,
                'leave_type_id' => $vacationLeave->id,
                'start_date' => now()->addDays(30),
                'end_date' => now()->addDays(34),
                'total_days' => 5,
                'duration' => 'full_day',
                'reason' => 'Family vacation to Boracay. Planning to rest and spend quality time with family.',
                'emergency_contact_name' => 'Jane Doe',
                'emergency_contact_phone' => '9171234567',
                'use_default_emergency_contact' => false,
                'availability' => 'emergency_only',
                'manager_id' => $user->id, // Self for demo
                'status' => 'approved',
                'manager_approved_by' => $user->id,
                'manager_approved_at' => now()->subDays(5),
                'manager_comments' => 'Approved. Enjoy your vacation!',
                'hr_approved_by' => $user->id,
                'hr_approved_at' => now()->subDays(4),
                'hr_comments' => 'Leave approved. Balance deducted.',
            ],

            // Pending HR Sick Leave
            [
                'user_id' => $user->id,
                'leave_type_id' => $sickLeave->id,
                'start_date' => now()->addDays(7),
                'end_date' => now()->addDays(8),
                'total_days' => 2,
                'duration' => 'full_day',
                'reason' => 'Medical checkup and recovery from flu symptoms.',
                'emergency_contact_name' => 'John Smith',
                'emergency_contact_phone' => '9181234567',
                'use_default_emergency_contact' => false,
                'availability' => 'offline',
                'manager_id' => $user->id,
                'status' => 'pending_hr',
                'manager_approved_by' => $user->id,
                'manager_approved_at' => now()->subHours(2),
                'manager_comments' => 'Approved by manager. Forwarding to HR.',
            ],

            // Pending Manager Emergency Leave
            [
                'user_id' => $user->id,
                'leave_type_id' => $emergencyLeave->id,
                'start_date' => now()->addDays(3),
                'end_date' => now()->addDays(3),
                'total_days' => 1,
                'duration' => 'full_day',
                'reason' => 'Family emergency - need to attend to urgent family matter.',
                'emergency_contact_name' => 'Emergency Contact',
                'emergency_contact_phone' => '9191234567',
                'use_default_emergency_contact' => true,
                'availability' => 'reachable',
                'manager_id' => $user->id,
                'status' => 'pending_manager',
            ],

            // Half Day Vacation Leave - Approved
            [
                'user_id' => $user->id,
                'leave_type_id' => $vacationLeave->id,
                'start_date' => now()->addDays(10),
                'end_date' => now()->addDays(10),
                'total_days' => 0.5,
                'duration' => 'half_day_pm',
                'reason' => 'Afternoon off for personal appointment.',
                'emergency_contact_name' => $user->emergency_contact_name,
                'emergency_contact_phone' => $user->emergency_contact_phone,
                'use_default_emergency_contact' => true,
                'availability' => 'reachable',
                'manager_id' => $user->id,
                'status' => 'approved',
                'manager_approved_by' => $user->id,
                'manager_approved_at' => now()->subDays(3),
                'hr_approved_by' => $user->id,
                'hr_approved_at' => now()->subDays(2),
            ],

            // Rejected by Manager
            [
                'user_id' => $user->id,
                'leave_type_id' => $vacationLeave->id,
                'start_date' => now()->addDays(5),
                'end_date' => now()->addDays(9),
                'total_days' => 5,
                'duration' => 'full_day',
                'reason' => 'Want to take time off during busy season.',
                'emergency_contact_name' => 'Contact Person',
                'emergency_contact_phone' => '9201234567',
                'use_default_emergency_contact' => false,
                'availability' => 'offline',
                'manager_id' => $user->id,
                'status' => 'rejected_by_manager',
                'manager_approved_by' => $user->id,
                'manager_approved_at' => now()->subDays(1),
                'manager_comments' => 'Unfortunately, we have critical deadlines during this period. Please reschedule.',
            ],

            // Cancelled Request
            [
                'user_id' => $user->id,
                'leave_type_id' => $sickLeave->id,
                'start_date' => now()->addDays(15),
                'end_date' => now()->addDays(16),
                'total_days' => 2,
                'duration' => 'full_day',
                'reason' => 'Feeling unwell, need rest.',
                'emergency_contact_name' => $user->emergency_contact_name,
                'emergency_contact_phone' => $user->emergency_contact_phone,
                'use_default_emergency_contact' => true,
                'availability' => 'offline',
                'manager_id' => $user->id,
                'status' => 'cancelled',
            ],

            // Past Approved Leave
            [
                'user_id' => $user->id,
                'leave_type_id' => $vacationLeave->id,
                'start_date' => now()->subDays(10),
                'end_date' => now()->subDays(8),
                'total_days' => 3,
                'duration' => 'full_day',
                'reason' => 'Short vacation break to recharge.',
                'emergency_contact_name' => $user->emergency_contact_name,
                'emergency_contact_phone' => $user->emergency_contact_phone,
                'use_default_emergency_contact' => true,
                'availability' => 'emergency_only',
                'manager_id' => $user->id,
                'status' => 'approved',
                'manager_approved_by' => $user->id,
                'manager_approved_at' => now()->subDays(15),
                'hr_approved_by' => $user->id,
                'hr_approved_at' => now()->subDays(14),
            ],
        ];

        foreach ($leaveRequests as $leaveRequest) {
            LeaveRequest::create($leaveRequest);
        }

        $this->command->info('✅ Created '.count($leaveRequests).' sample leave requests!');
    }
}
