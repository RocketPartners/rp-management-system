<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ✅ Run RoleSeeder FIRST so roles exist
        $this->call([
            RoleSeeder::class,
        ]);

        // ✅ Run PermissionSeeder SECOND to create permissions and assign to roles
        $this->call([
            PermissionSeeder::class, // ← ADD THIS LINE
        ]);

        // ✅ Create Super Admin User
 $admin = User::create([                                                                                                                                                                                                                                                                                                            
      'name' => 'Admin User',                                                                                                                                                                                                                                                                                                        
      'email' => 'admin@example.com',                                                                                                                                                                                                                                                                                                
      'email_verified_at' => now(),                                                                                                                                                                                                                                                                                                  
      'password' => bcrypt('password'),                                                                                                                                                                                                                                                                                              
      'account_status' => 'active',                                                                                                                                                                                                                                                                                                  
  ]);        
        // ✅ Assign Super Admin role
        $superAdminRole = Role::where('slug', 'super-admin')->first();
        if ($superAdminRole) {
            $admin->roles()->attach($superAdminRole->id);
            $this->command->info('✅ Admin user created with super-admin role!');
        }

        // ✅ Run remaining seeders
        $this->call([
            CategorySeeder::class,
            InventoryItemSeeder::class,
            AssetSeeder::class,
            ProjectSeeder::class,
            LeaveTypeSeeder::class,
            TestUsersSeeder::class,
            LeaveRequestSeeder::class,
            CalendarEventTypeSeeder::class,
            CalendarTestDataSeeder::class,
        ]);
    }
}
