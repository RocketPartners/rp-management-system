<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class TestUsersSeeder extends Seeder
{
    /**
     * Create test users for each role
     */
    public function run(): void
    {
        $this->command->info('🔧 Creating test users for role testing...');
        $this->command->info('');

        // ========================================
        // 1 SUPER ADMIN
        // ========================================
        $superAdmin = $this->createUser([
            'name' => 'Super Admin',
            'email' => 'superadmin@example.com',
            'position' => 'System Administrator',
            'department' => 'IT',
            'employee_id' => 'SA-001',
        ], 'super-admin');

        // ========================================
        // 2 ADMINS
        // ========================================
        $this->createUser([
            'name' => 'Admin One',
            'email' => 'admin1@example.com',
            'position' => 'Administrator',
            'department' => 'Administration',
            'employee_id' => 'ADM-001',
        ], 'admin');

        $this->createUser([
            'name' => 'Admin Two',
            'email' => 'admin2@example.com',
            'position' => 'Administrator',
            'department' => 'Administration',
            'employee_id' => 'ADM-002',
        ], 'admin');

        // ========================================
        // 2 HR MANAGERS
        // ========================================
        $this->createUser([
            'name' => 'HR Manager One',
            'email' => 'hr1@example.com',
            'position' => 'HR Manager',
            'department' => 'Human Resources',
            'employee_id' => 'HR-001',
        ], 'hr-manager');

        $this->createUser([
            'name' => 'HR Manager Two',
            'email' => 'hr2@example.com',
            'position' => 'HR Manager',
            'department' => 'Human Resources',
            'employee_id' => 'HR-002',
        ], 'hr-manager');

        // ========================================
        // 2 PROJECT MANAGERS
        // ========================================
        $this->createUser([
            'name' => 'Project Manager One',
            'email' => 'pm1@example.com',
            'position' => 'Project Manager',
            'department' => 'Project Management',
            'employee_id' => 'PM-001',
        ], 'project-manager');

        $this->createUser([
            'name' => 'Project Manager Two',
            'email' => 'pm2@example.com',
            'position' => 'Project Manager',
            'department' => 'Project Management',
            'employee_id' => 'PM-002',
        ], 'project-manager');

        // ========================================
        // 3 LEAD ENGINEERS
        // ========================================
        $leadEng1 = $this->createUser([
            'name' => 'Lead Engineer One',
            'email' => 'lead1@example.com',
            'position' => 'Lead Software Engineer',
            'department' => 'Engineering',
            'employee_id' => 'LEAD-001',
        ], 'lead-engineer');

        $leadEng2 = $this->createUser([
            'name' => 'Lead Engineer Two',
            'email' => 'lead2@example.com',
            'position' => 'Lead Software Engineer',
            'department' => 'Engineering',
            'employee_id' => 'LEAD-002',
        ], 'lead-engineer');

        $leadEng3 = $this->createUser([
            'name' => 'Lead Engineer Three',
            'email' => 'lead3@example.com',
            'position' => 'Lead Software Engineer',
            'department' => 'Engineering',
            'employee_id' => 'LEAD-003',
        ], 'lead-engineer');

        // ========================================
        // 3 SENIOR ENGINEERS (reporting to Lead Engineers)
        // ========================================
        $this->createUser([
            'name' => 'Senior Engineer One',
            'email' => 'senior1@example.com',
            'position' => 'Senior Software Engineer',
            'department' => 'Engineering',
            'employee_id' => 'SEN-001',
            'manager_id' => $leadEng1->id,
        ], 'senior-engineer');

        $this->createUser([
            'name' => 'Senior Engineer Two',
            'email' => 'senior2@example.com',
            'position' => 'Senior Software Engineer',
            'department' => 'Engineering',
            'employee_id' => 'SEN-002',
            'manager_id' => $leadEng2->id,
        ], 'senior-engineer');

        $this->createUser([
            'name' => 'Senior Engineer Three',
            'email' => 'senior3@example.com',
            'position' => 'Senior Software Engineer',
            'department' => 'Engineering',
            'employee_id' => 'SEN-003',
            'manager_id' => $leadEng3->id,
        ], 'senior-engineer');

        $this->command->info('');
        $this->command->info('✅ Total users created: 14');
        $this->command->info('');
        $this->command->info('👥 USER SUMMARY:');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('');
        $this->command->info('CAN APPROVE USERS (9 users):');
        $this->command->info('  1. Super Admin        → superadmin@example.com');
        $this->command->info('  2. Admin One          → admin1@example.com');
        $this->command->info('  3. Admin Two          → admin2@example.com');
        $this->command->info('  4. HR Manager One     → hr1@example.com');
        $this->command->info('  5. HR Manager Two     → hr2@example.com');
        $this->command->info('  6. Project Manager 1  → pm1@example.com');
        $this->command->info('  7. Project Manager 2  → pm2@example.com');
        $this->command->info('  8. Lead Engineer 1    → lead1@example.com');
        $this->command->info('  9. Lead Engineer 2    → lead2@example.com');
        $this->command->info(' 10. Lead Engineer 3    → lead3@example.com');
        $this->command->info(' 11. Senior Engineer 1  → senior1@example.com');
        $this->command->info(' 12. Senior Engineer 2  → senior2@example.com');
        $this->command->info(' 13. Senior Engineer 3  → senior3@example.com');
        $this->command->info('');
        $this->command->info('🔒 All passwords: password');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    /**
     * Helper method to create a user with role
     */
    private function createUser(array $userData, string $roleSlug): User
    {
        $user = User::create([
            'first_name' => explode(' ', $userData['name'])[0],
            'last_name' => explode(' ', $userData['name'])[count(explode(' ', $userData['name'])) - 1],
            'name' => $userData['name'],
            'email' => $userData['email'],
            'password' => bcrypt('password'),
            'account_status' => 'active',
            'employment_status' => 'active',
            'position' => $userData['position'],
            'department' => $userData['department'],
            'employee_id' => $userData['employee_id'],
            'manager_id' => $userData['manager_id'] ?? null,
            'email_verified_at' => now(),
        ]);

        // Assign role
        $role = Role::where('slug', $roleSlug)->first();
        if ($role) {
            $user->roles()->attach($role->id);
        }

        return $user;
    }
}
