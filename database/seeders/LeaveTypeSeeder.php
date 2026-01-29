<?php

namespace Database\Seeders;

use App\Models\LeaveType;
use Illuminate\Database\Seeder;

class LeaveTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $leaveTypes = [
            // ============================================
            // VACATION LEAVE (VL)
            // ============================================
            [
                'name' => 'Vacation Leave',
                'code' => 'VL',
                'description' => 'Annual paid vacation time for rest and recreation',
                'days_per_year' => 15,
                'is_paid' => true,
                'requires_medical_cert' => false,
                'medical_cert_days_threshold' => null,
                'is_carry_over_allowed' => true,
                'max_carry_over_days' => 5,
                'requires_manager_approval' => true,
                'requires_hr_approval' => true,
                'color' => '#3B82F6', // Blue
                'icon' => 'Palmtree',
                'sort_order' => 1,
                'gender_specific' => null,
                'is_active' => true,
            ],

            // ============================================
            // SICK LEAVE (SL)
            // ============================================
            [
                'name' => 'Sick Leave',
                'code' => 'SL',
                'description' => 'Paid leave for illness or medical appointments',
                'days_per_year' => 7,
                'is_paid' => true,
                'requires_medical_cert' => true,
                'medical_cert_days_threshold' => 2, // Require cert if > 2 days
                'is_carry_over_allowed' => false, // SL typically doesn't carry over
                'max_carry_over_days' => null,
                'requires_manager_approval' => false, // Auto-approve for emergencies
                'requires_hr_approval' => true,
                'color' => '#EF4444', // Red
                'icon' => 'Heart',
                'sort_order' => 2,
                'gender_specific' => null,
                'is_active' => true,
            ],

            // ============================================
            // EMERGENCY LEAVE (EL)
            // ============================================
            [
                'name' => 'Emergency Leave',
                'code' => 'EL',
                'description' => 'Paid leave for urgent personal or family emergencies',
                'days_per_year' => 3,
                'is_paid' => true,
                'requires_medical_cert' => false,
                'medical_cert_days_threshold' => null,
                'is_carry_over_allowed' => false,
                'max_carry_over_days' => null,
                'requires_manager_approval' => false, // Auto-approve for emergencies
                'requires_hr_approval' => true,
                'color' => '#F59E0B', // Orange
                'icon' => 'AlertTriangle',
                'sort_order' => 3,
                'gender_specific' => null,
                'is_active' => true,
            ],

            // ============================================
            // BEREAVEMENT LEAVE
            // ============================================
            [
                'name' => 'Bereavement Leave',
                'code' => 'BL',
                'description' => 'Paid leave for death of immediate family member',
                'days_per_year' => 3,
                'is_paid' => true,
                'requires_medical_cert' => false,
                'medical_cert_days_threshold' => null,
                'is_carry_over_allowed' => false,
                'max_carry_over_days' => null,
                'requires_manager_approval' => false, // Auto-approve
                'requires_hr_approval' => true,
                'color' => '#6B7280', // Gray
                'icon' => 'Heart',
                'sort_order' => 4,
                'gender_specific' => null,
                'is_active' => true,
            ],

            // ============================================
            // MATERNITY LEAVE (Female only)
            // ============================================
            [
                'name' => 'Maternity Leave',
                'code' => 'ML',
                'description' => 'Paid leave for childbirth and postpartum recovery (105 days)',
                'days_per_year' => 105,
                'is_paid' => true,
                'requires_medical_cert' => true,
                'medical_cert_days_threshold' => 0, // Always require medical cert
                'is_carry_over_allowed' => false,
                'max_carry_over_days' => null,
                'requires_manager_approval' => false,
                'requires_hr_approval' => true,
                'color' => '#EC4899', // Pink
                'icon' => 'Baby',
                'sort_order' => 5,
                'gender_specific' => 'female',
                'is_active' => true,
            ],

            // ============================================
            // PATERNITY LEAVE (Male only)
            // ============================================
            [
                'name' => 'Paternity Leave',
                'code' => 'PL',
                'description' => 'Paid leave for fathers following childbirth (7 days)',
                'days_per_year' => 7,
                'is_paid' => true,
                'requires_medical_cert' => false,
                'medical_cert_days_threshold' => null,
                'is_carry_over_allowed' => false,
                'max_carry_over_days' => null,
                'requires_manager_approval' => false,
                'requires_hr_approval' => true,
                'color' => '#3B82F6', // Blue
                'icon' => 'Baby',
                'sort_order' => 6,
                'gender_specific' => 'male',
                'is_active' => true,
            ],

            // ============================================
            // BIRTHDAY LEAVE (Optional - Nice to have)
            // ============================================
            [
                'name' => 'Birthday Leave',
                'code' => 'BDAY',
                'description' => 'One day off during your birthday month',
                'days_per_year' => 1,
                'is_paid' => true,
                'requires_medical_cert' => false,
                'medical_cert_days_threshold' => null,
                'is_carry_over_allowed' => false,
                'max_carry_over_days' => null,
                'requires_manager_approval' => false, // Auto-approve
                'requires_hr_approval' => true,
                'color' => '#8B5CF6', // Purple
                'icon' => 'Cake',
                'sort_order' => 7,
                'gender_specific' => null,
                'is_active' => true,
            ],

            // ============================================
            // LEAVE WITHOUT PAY (LWOP)
            // ============================================
            [
                'name' => 'Leave Without Pay',
                'code' => 'LWOP',
                'description' => 'Unpaid leave for personal reasons (no limit)',
                'days_per_year' => 365, // Unlimited (set high number)
                'is_paid' => false,
                'requires_medical_cert' => false,
                'medical_cert_days_threshold' => null,
                'is_carry_over_allowed' => false,
                'max_carry_over_days' => null,
                'requires_manager_approval' => true,
                'requires_hr_approval' => true,
                'color' => '#6B7280', // Gray
                'icon' => 'AlertCircle',
                'sort_order' => 8,
                'gender_specific' => null,
                'is_active' => true,
            ],
        ];

        foreach ($leaveTypes as $leaveType) {
            LeaveType::create($leaveType);
        }

        $this->command->info('✅ Created '.count($leaveTypes).' leave types!');
    }
}
