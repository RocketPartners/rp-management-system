<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🔐 Creating permissions...');

        $permissions = [
            // ============================================
            // USERS MANAGEMENT
            // ============================================
            [
                'name' => 'View User List',
                'slug' => 'users.view',
                'description' => 'View user list and profiles',
                'category' => 'users',
                'group' => 'users',
            ],
            [
                'name' => 'Create New Users',
                'slug' => 'users.create',
                'description' => 'Create new user accounts',
                'category' => 'users',
                'group' => 'users',
            ],
            [
                'name' => 'Edit User Details',
                'slug' => 'users.edit',
                'description' => 'Edit user details and information',
                'category' => 'users',
                'group' => 'users',
            ],
            [
                'name' => 'Delete Users',
                'slug' => 'users.delete',
                'description' => 'Delete or deactivate users',
                'category' => 'users',
                'group' => 'users',
            ],
            [
                'name' => 'Approve User Registrations',
                'slug' => 'users.approve',
                'description' => 'Approve pending user registrations',
                'category' => 'users',
                'group' => 'users',
            ],
            [
                'name' => 'Assign User Permissions',
                'slug' => 'users.assign-permissions',
                'description' => 'Manage other users\' permission overrides',
                'category' => 'users',
                'group' => 'users',
            ],

            // ============================================
            // ROLES MANAGEMENT
            // ============================================
            [
                'name' => 'View Roles',
                'slug' => 'roles.view',
                'description' => 'View roles list',
                'category' => 'roles',
                'group' => 'roles',
            ],
            [
                'name' => 'Create Roles',
                'slug' => 'roles.create',
                'description' => 'Create new roles',
                'category' => 'roles',
                'group' => 'roles',
            ],
            [
                'name' => 'Edit Roles',
                'slug' => 'roles.edit',
                'description' => 'Edit role details and built-in permissions',
                'category' => 'roles',
                'group' => 'roles',
            ],
            [
                'name' => 'Delete Roles',
                'slug' => 'roles.delete',
                'description' => 'Delete roles',
                'category' => 'roles',
                'group' => 'roles',
            ],

            // ============================================
            // LEAVE MANAGEMENT
            // ============================================
            [
                'name' => 'View Own Leaves',
                'slug' => 'leaves.view-own',
                'description' => 'View own leave requests',
                'category' => 'leaves',
                'group' => 'leaves',
            ],
            [
                'name' => 'Create Leave Requests',
                'slug' => 'leaves.create',
                'description' => 'Submit leave requests',
                'category' => 'leaves',
                'group' => 'leaves',
            ],
            [
                'name' => 'View Team Leaves',
                'slug' => 'leaves.view-team',
                'description' => 'View direct reports\' leaves',
                'category' => 'leaves',
                'group' => 'leaves',
            ],
            [
                'name' => 'View All Leaves',
                'slug' => 'leaves.view-all',
                'description' => 'View all leaves in system',
                'category' => 'leaves',
                'group' => 'leaves',
            ],
            [
                'name' => 'Approve Leave Requests',
                'slug' => 'leaves.approve',
                'description' => 'Approve/reject leave requests',
                'category' => 'leaves',
                'group' => 'leaves',
            ],
            [
                'name' => 'Manage All Leaves',
                'slug' => 'leaves.manage',
                'description' => 'Edit/cancel any leave request',
                'category' => 'leaves',
                'group' => 'leaves',
            ],

            // ============================================
            // ASSET MANAGEMENT
            // ============================================
            [
                'name' => 'View Assets',
                'slug' => 'assets.view',
                'description' => 'View asset inventory',
                'category' => 'assets',
                'group' => 'assets',
            ],
            [
                'name' => 'Create Assets',
                'slug' => 'assets.create',
                'description' => 'Add new assets',
                'category' => 'assets',
                'group' => 'assets',
            ],
            [
                'name' => 'Edit Assets',
                'slug' => 'assets.edit',
                'description' => 'Edit asset details',
                'category' => 'assets',
                'group' => 'assets',
            ],
            [
                'name' => 'Delete Assets',
                'slug' => 'assets.delete',
                'description' => 'Remove assets',
                'category' => 'assets',
                'group' => 'assets',
            ],
            [
                'name' => 'Assign Assets',
                'slug' => 'assets.assign',
                'description' => 'Assign/unassign assets to users',
                'category' => 'assets',
                'group' => 'assets',
            ],

            // ============================================
            // PROJECT MANAGEMENT
            // ============================================
            [
                'name' => 'View Projects',
                'slug' => 'projects.view',
                'description' => 'View projects',
                'category' => 'projects',
                'group' => 'projects',
            ],
            [
                'name' => 'Create Projects',
                'slug' => 'projects.create',
                'description' => 'Create projects',
                'category' => 'projects',
                'group' => 'projects',
            ],
            [
                'name' => 'Edit Projects',
                'slug' => 'projects.edit',
                'description' => 'Edit project details',
                'category' => 'projects',
                'group' => 'projects',
            ],
            [
                'name' => 'Delete Projects',
                'slug' => 'projects.delete',
                'description' => 'Delete projects',
                'category' => 'projects',
                'group' => 'projects',
            ],
            [
                'name' => 'Manage Project Members',
                'slug' => 'projects.manage-members',
                'description' => 'Add/remove project members',
                'category' => 'projects',
                'group' => 'projects',
            ],
            [
                'name' => 'View Tasks',
                'slug' => 'tasks.view',
                'description' => 'View tasks',
                'category' => 'projects',
                'group' => 'projects',
            ],
            [
                'name' => 'Create Tasks',
                'slug' => 'tasks.create',
                'description' => 'Create tasks',
                'category' => 'projects',
                'group' => 'projects',
            ],
            [
                'name' => 'Edit Tasks',
                'slug' => 'tasks.edit',
                'description' => 'Edit any task',
                'category' => 'projects',
                'group' => 'projects',
            ],
            [
                'name' => 'Assign Tasks',
                'slug' => 'tasks.assign',
                'description' => 'Assign tasks to users',
                'category' => 'projects',
                'group' => 'projects',
            ],

            // ============================================
            // ONBOARDING
            // ============================================
            [
                'name' => 'View Onboarding Submissions',
                'slug' => 'onboarding.view',
                'description' => 'View onboarding submissions',
                'category' => 'onboarding',
                'group' => 'onboarding',
            ],
            [
                'name' => 'Manage Onboarding',
                'slug' => 'onboarding.manage',
                'description' => 'Manage onboarding workflow',
                'category' => 'onboarding',
                'group' => 'onboarding',
            ],
            [
                'name' => 'Approve Onboarding Documents',
                'slug' => 'onboarding.approve-documents',
                'description' => 'Approve submitted documents',
                'category' => 'onboarding',
                'group' => 'onboarding',
            ],

            // ============================================
            // TEAM MANAGEMENT
            // ============================================
            [
                'name' => 'View Teams',
                'slug' => 'teams.view',
                'description' => 'View team list and details',
                'category' => 'teams',
                'group' => 'teams',
            ],
            [
                'name' => 'Create Teams',
                'slug' => 'teams.create',
                'description' => 'Create new teams',
                'category' => 'teams',
                'group' => 'teams',
            ],
            [
                'name' => 'Edit Teams',
                'slug' => 'teams.edit',
                'description' => 'Edit team details and members',
                'category' => 'teams',
                'group' => 'teams',
            ],
            [
                'name' => 'Delete Teams',
                'slug' => 'teams.delete',
                'description' => 'Delete teams',
                'category' => 'teams',
                'group' => 'teams',
            ],

            // ============================================
            // SYSTEM
            // ============================================
            [
                'name' => 'View System Logs',
                'slug' => 'system.view-logs',
                'description' => 'View system/audit logs',
                'category' => 'system',
                'group' => 'system',
            ],
            [
                'name' => 'Manage System Settings',
                'slug' => 'system.manage-settings',
                'description' => 'Manage system settings',
                'category' => 'system',
                'group' => 'system',
            ],
            [
                'name' => 'Manage Role Permissions',
                'slug' => 'system.manage-roles',
                'description' => 'Manage role permissions',
                'category' => 'system',
                'group' => 'system',
            ],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['slug' => $permission['slug']],
                $permission
            );
        }

        $this->command->info('✅ Created '.count($permissions).' permissions!');

        // ============================================
        // ASSIGN PERMISSIONS TO ROLES
        // ============================================
        $this->assignPermissionsToRoles();
    }

    private function assignPermissionsToRoles()
    {
        $this->command->info('🔗 Assigning permissions to roles...');

        // Super Admin - ALL permissions
        $superAdmin = Role::where('slug', 'super-admin')->first();
        if ($superAdmin) {
            $superAdmin->permissions()->sync(Permission::all()->pluck('id'));
            $this->command->info('   ✅ Super Admin → All permissions');
        }

        // Admin - All except system.manage-settings
        $admin = Role::where('slug', 'admin')->first();
        if ($admin) {
            $admin->permissions()->sync(
                Permission::where('slug', '!=', 'system.manage-settings')->pluck('id')
            );
            $this->command->info('   ✅ Admin → All except system settings');
        }

        // HR Manager
        $hrManager = Role::where('slug', 'hr-manager')->first();
        if ($hrManager) {
            $hrManager->permissions()->sync(
                Permission::whereIn('slug', [
                    'users.view', 'users.create', 'users.edit', 'users.delete', 'users.approve',
                    'leaves.view-own', 'leaves.create', 'leaves.view-team', 'leaves.view-all', 'leaves.approve', 'leaves.manage',
                    'onboarding.view', 'onboarding.manage', 'onboarding.approve-documents',
                    'assets.view',
                    'teams.view', 'teams.create', 'teams.edit',
                ])->pluck('id')
            );
            $this->command->info('   ✅ HR Manager → Users, Leaves, Onboarding, Teams');
        }

        // Project Manager / Department Head
        $projectManager = Role::where('slug', 'project-manager')->first();
        if ($projectManager) {
            $projectManager->permissions()->sync(
                Permission::whereIn('slug', [
                    'users.view',
                    'leaves.view-own', 'leaves.create', 'leaves.view-team', 'leaves.view-all', 'leaves.approve',
                    'projects.view', 'projects.create', 'projects.edit', 'projects.delete', 'projects.manage-members',
                    'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.assign',
                    'teams.view',
                ])->pluck('id')
            );
            $this->command->info('   ✅ Project Manager → Leaves, Projects, Tasks, Teams view');
        }

        // Lead Engineer / Team Lead
        $leadEngineer = Role::where('slug', 'lead-engineer')->first();
        if ($leadEngineer) {
            $leadEngineer->permissions()->sync(
                Permission::whereIn('slug', [
                    'users.view',
                    'leaves.view-own', 'leaves.create', 'leaves.view-team', 'leaves.approve',
                    'projects.view', 'projects.edit',
                    'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.assign',
                    'teams.view',
                ])->pluck('id')
            );
            $this->command->info('   ✅ Lead Engineer → Team leaves, Projects, Tasks, Teams view');
        }

        // Senior Engineer
        $seniorEngineer = Role::where('slug', 'senior-engineer')->first();
        if ($seniorEngineer) {
            $seniorEngineer->permissions()->sync(
                Permission::whereIn('slug', [
                    'leaves.view-own', 'leaves.create',
                    'projects.view',
                    'tasks.view', 'tasks.create', 'tasks.edit',
                    'teams.view',
                ])->pluck('id')
            );
            $this->command->info('   ✅ Senior Engineer → Own leaves, Projects view, Tasks, Teams view');
        }

        // Mid-Level Engineer / Employee
        $midLevelEngineer = Role::where('slug', 'mid-level-engineer')->first();
        if ($midLevelEngineer) {
            $midLevelEngineer->permissions()->sync(
                Permission::whereIn('slug', [
                    'leaves.view-own', 'leaves.create',
                    'projects.view',
                    'tasks.view', 'tasks.create',
                    'teams.view',
                ])->pluck('id')
            );
            $this->command->info('   ✅ Mid-Level Engineer → Own leaves, Projects view, Tasks view/create, Teams view');
        }

        // Junior Engineer
        $juniorEngineer = Role::where('slug', 'junior-engineer')->first();
        if ($juniorEngineer) {
            $juniorEngineer->permissions()->sync(
                Permission::whereIn('slug', [
                    'leaves.view-own', 'leaves.create',
                    'projects.view',
                    'tasks.view', 'tasks.create',
                    'teams.view',
                ])->pluck('id')
            );
            $this->command->info('   ✅ Junior Engineer → Own leaves, Projects view, Tasks view/create, Teams view');
        }

        // Entry-Level Engineer / Intern
        $entryLevel = Role::where('slug', 'entry-level-engineer')->first();
        if ($entryLevel) {
            $entryLevel->permissions()->sync(
                Permission::whereIn('slug', [
                    'leaves.view-own',
                    'projects.view',
                    'tasks.view',
                    'teams.view',
                ])->pluck('id')
            );
            $this->command->info('   ✅ Entry-Level Engineer → View only, Teams view');
        }

        $this->command->info('✅ Permission assignments complete!');
    }
}
