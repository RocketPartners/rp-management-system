<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Clear existing roles
        DB::table('role_user')->truncate();
        Role::truncate();

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $roles = [
            // ============================================
            // ADMINISTRATIVE ROLES
            // ============================================
            [
                'name' => 'Super Admin',
                'slug' => 'super-admin',
                'description' => 'Has full access to all features including system configuration, user management, and all modules',
            ],
            [
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'Can manage users, approve accounts, and access most administrative features',
            ],
            [
                'name' => 'HR Manager',
                'slug' => 'hr-manager',
                'description' => 'Manages employee records, leave requests, asset assignments, and HR-related tasks',
            ],

            // ============================================
            // ENGINEERING ROLES (Hierarchical)
            // ============================================
            [
                'name' => 'Lead Engineer',
                'slug' => 'lead-engineer',
                'description' => 'Team lead with project ownership, can approve leave requests for their team, manages multiple senior engineers',
            ],
            [
                'name' => 'Senior Engineer',
                'slug' => 'senior-engineer',
                'description' => 'Experienced engineer, mentors junior engineers, leads complex projects, can approve leave for juniors',
            ],
            [
                'name' => 'Mid-Level Engineer',
                'slug' => 'mid-level-engineer',
                'description' => 'Competent engineer handling moderate complexity tasks independently, assists in code reviews',
            ],
            [
                'name' => 'Junior Engineer',
                'slug' => 'junior-engineer',
                'description' => 'Growing engineer learning the codebase, works under supervision of senior engineers',
            ],
            [
                'name' => 'Entry-Level Engineer',
                'slug' => 'entry-level-engineer',
                'description' => 'New engineer or fresh graduate, learning fundamentals and working on guided tasks',
            ],

            // ============================================
            // SUPPORT ROLES
            // ============================================
            [
                'name' => 'Project Manager',
                'slug' => 'project-manager',
                'description' => 'Manages projects, timelines, and coordinates between teams',
            ],
            [
                'name' => 'Employee',
                'slug' => 'employee',
                'description' => 'Basic employee access - can view own information, submit leave requests',
            ],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }

        $this->command->info('✅ Created '.count($roles).' roles!');
    }
}
