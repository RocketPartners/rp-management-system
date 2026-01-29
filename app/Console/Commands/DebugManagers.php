<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;

class DebugManagers extends Command
{
    protected $signature = 'debug:managers';

    protected $description = 'Debug manager selection and roles';

    public function handle()
    {
        $this->info('🔍 Debugging Managers & Roles...');
        $this->newLine();

        // Check all roles
        $this->info('📋 All Roles in Database:');
        $roles = Role::all();
        foreach ($roles as $role) {
            $userCount = $role->users()->count();
            $this->line("  • {$role->name} (slug: '{$role->slug}') - {$userCount} users");
        }
        $this->newLine();

        // Check all active users with roles
        $this->info('👥 All Active Users with Roles:');
        $users = User::where('employment_status', 'active')
            ->with('roles')
            ->get();

        foreach ($users as $user) {
            $roleNames = $user->roles->pluck('slug')->toArray();
            $this->line("  • {$user->name} - Roles: [".implode(', ', $roleNames).']');
        }
        $this->newLine();

        // Test the manager query
        $this->info('🎯 Testing Manager Query (excluding current user):');
        $currentUser = User::first();

        $managersWithRoles = User::where('employment_status', 'active')
            ->where('id', '!=', $currentUser->id)
            ->whereHas('roles', function ($query) {
                $query->whereIn('slug', [
                    'super-admin',
                    'admin',
                    'hr-manager',
                    'lead-engineer',
                    'senior-engineer',
                    'project-manager',
                ]);
            })
            ->with('roles')
            ->get();

        $this->line("  Found {$managersWithRoles->count()} managers:");
        foreach ($managersWithRoles as $manager) {
            $roleNames = $manager->roles->pluck('name')->implode(', ');
            $this->line("    ✓ {$manager->name} ({$manager->position}) - {$roleNames}");
        }
        $this->newLine();

        // Fallback query
        $this->info('🔄 Fallback Query (all active users except self):');
        $allUsers = User::where('employment_status', 'active')
            ->where('id', '!=', $currentUser->id)
            ->get();
        $this->line("  Found {$allUsers->count()} users total");

        return 0;
    }
}
