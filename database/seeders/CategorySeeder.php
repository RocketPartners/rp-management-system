<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            // Inventory Categories
            [
                'name' => 'Computers',
                'slug' => 'computers',
                'description' => 'Laptops, desktops, and workstations',
                'type' => 'inventory',
                'color' => '#3B82F6',
            ],
            [
                'name' => 'Monitors',
                'slug' => 'monitors',
                'description' => 'Display screens and monitors',
                'type' => 'inventory',
                'color' => '#8B5CF6',
            ],
            [
                'name' => 'Peripherals',
                'slug' => 'peripherals',
                'description' => 'Keyboards, mice, headsets, etc.',
                'type' => 'inventory',
                'color' => '#10B981',
            ],
            [
                'name' => 'Mobile Devices',
                'slug' => 'mobile-devices',
                'description' => 'Phones, tablets, etc.',
                'type' => 'inventory',
                'color' => '#F59E0B',
            ],
            [
                'name' => 'Office Supplies',
                'slug' => 'office-supplies',
                'description' => 'Paper, pens, and other consumables',
                'type' => 'inventory',
                'color' => '#6366F1',
            ],
            [
                'name' => 'Furniture',
                'slug' => 'furniture',
                'description' => 'Desks, chairs, cabinets',
                'type' => 'inventory',
                'color' => '#EC4899',
            ],

            // Project Categories
            [
                'name' => 'Web Development',
                'slug' => 'web-development',
                'description' => 'Web application projects',
                'type' => 'project',
                'color' => '#3B82F6',
            ],
            [
                'name' => 'Mobile Development',
                'slug' => 'mobile-development',
                'description' => 'Mobile app projects',
                'type' => 'project',
                'color' => '#10B981',
            ],
            [
                'name' => 'Internal Tools',
                'slug' => 'internal-tools',
                'description' => 'Internal system projects',
                'type' => 'project',
                'color' => '#F59E0B',
            ],
            [
                'name' => 'Research & Development',
                'slug' => 'research-development',
                'description' => 'R&D projects',
                'type' => 'project',
                'color' => '#8B5CF6',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
