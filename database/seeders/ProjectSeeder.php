<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $webDevCategory = Category::where('slug', 'web-development')->first();
        $internalToolsCategory = Category::where('slug', 'internal-tools')->first();
        $mobileDevCategory = Category::where('slug', 'mobile-development')->first();

        $firstUser = User::first();

        // Project 1
        $project1 = Project::create([
            'name' => 'Employee Management System',
            'code' => 'PRJ-001',
            'description' => 'Internal tool for managing employees, inventory, and projects',
            'category_id' => $internalToolsCategory->id,
            'owner_id' => $firstUser->id ?? 1,
            'start_date' => now()->subDays(30),
            'end_date' => now()->addDays(60),
            'status' => 'in_progress',
            'priority' => 'high',
            'progress' => 45,
            'budget' => 50000.00,
        ]);

        // Tasks for Project 1
        Task::create([
            'project_id' => $project1->id,
            'title' => 'Design database schema',
            'description' => 'Create database tables and relationships',
            'assigned_to' => $firstUser->id ?? 1,
            'created_by' => $firstUser->id ?? 1,
            'status' => 'completed',
            'priority' => 'high',
            'due_date' => now()->subDays(20),
            'estimated_hours' => 16,
            'actual_hours' => 18,
            'order' => 1,
        ]);

        Task::create([
            'project_id' => $project1->id,
            'title' => 'Build authentication system',
            'description' => 'Implement login, registration, and role-based access',
            'assigned_to' => $firstUser->id ?? 1,
            'created_by' => $firstUser->id ?? 1,
            'status' => 'in_progress',
            'priority' => 'high',
            'due_date' => now()->addDays(5),
            'estimated_hours' => 24,
            'actual_hours' => 16,
            'order' => 2,
        ]);

        Task::create([
            'project_id' => $project1->id,
            'title' => 'Create inventory management module',
            'description' => 'Build CRUD operations for inventory items with barcode support',
            'assigned_to' => $firstUser->id ?? 1,
            'created_by' => $firstUser->id ?? 1,
            'status' => 'todo',
            'priority' => 'medium',
            'due_date' => now()->addDays(15),
            'estimated_hours' => 32,
            'actual_hours' => null,
            'order' => 3,
        ]);

        // Project 2
        $project2 = Project::create([
            'name' => 'Company Website Redesign',
            'code' => 'PRJ-002',
            'description' => 'Complete redesign of company public website',
            'category_id' => $webDevCategory->id,
            'owner_id' => $firstUser->id ?? 1,
            'start_date' => now()->subDays(45),
            'end_date' => now()->addDays(30),
            'status' => 'in_progress',
            'priority' => 'medium',
            'progress' => 70,
            'budget' => 30000.00,
        ]);

        Task::create([
            'project_id' => $project2->id,
            'title' => 'Create wireframes and mockups',
            'description' => 'Design all page layouts in Figma',
            'assigned_to' => $firstUser->id ?? 1,
            'created_by' => $firstUser->id ?? 1,
            'status' => 'completed',
            'priority' => 'high',
            'due_date' => now()->subDays(30),
            'estimated_hours' => 40,
            'actual_hours' => 45,
            'order' => 1,
        ]);

        Task::create([
            'project_id' => $project2->id,
            'title' => 'Implement responsive homepage',
            'description' => 'Build homepage with React and Tailwind CSS',
            'assigned_to' => $firstUser->id ?? 1,
            'created_by' => $firstUser->id ?? 1,
            'status' => 'in_progress',
            'priority' => 'high',
            'due_date' => now()->addDays(7),
            'estimated_hours' => 24,
            'actual_hours' => 20,
            'order' => 2,
        ]);

        // Project 3
        $project3 = Project::create([
            'name' => 'Mobile App Development',
            'code' => 'PRJ-003',
            'description' => 'Native mobile app for iOS and Android',
            'category_id' => $mobileDevCategory->id,
            'owner_id' => $firstUser->id ?? 1,
            'start_date' => now()->addDays(7),
            'end_date' => now()->addDays(120),
            'status' => 'planning',
            'priority' => 'medium',
            'progress' => 5,
            'budget' => 75000.00,
        ]);

        Task::create([
            'project_id' => $project3->id,
            'title' => 'Research technology stack',
            'description' => 'Evaluate React Native vs Flutter',
            'assigned_to' => $firstUser->id ?? 1,
            'created_by' => $firstUser->id ?? 1,
            'status' => 'todo',
            'priority' => 'high',
            'due_date' => now()->addDays(10),
            'estimated_hours' => 8,
            'actual_hours' => null,
            'order' => 1,
        ]);
    }
}
