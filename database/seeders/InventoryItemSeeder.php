<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\InventoryItem;
use App\Models\User;
use Illuminate\Database\Seeder;

class InventoryItemSeeder extends Seeder
{
    public function run(): void
    {
        $computerCategory = Category::where('slug', 'computers')->first();
        $monitorCategory = Category::where('slug', 'monitors')->first();
        $peripheralCategory = Category::where('slug', 'peripherals')->first();
        $mobileCategory = Category::where('slug', 'mobile-devices')->first();

        $firstUser = User::first();

        $items = [
            // Computers
            [
                'name' => 'MacBook Pro 16" M3',
                'sku' => 'COMP-001',
                'barcode' => 'MBP-2024-001',
                'serial_number' => 'C02XL123456',
                'description' => '16-inch MacBook Pro with M3 chip, 32GB RAM, 1TB SSD',
                'category_id' => $computerCategory->id,
                'quantity' => 1,
                'min_quantity' => 1,
                'unit_price' => 3499.00,
                'unit' => 'piece',
                'location' => 'IT Storage Room A',
                'manufacturer' => 'Apple',
                'model' => 'MacBook Pro 16" 2024',
                'purchase_date' => now()->subMonths(2),
                'warranty_expiry' => now()->addMonths(10),
                'status' => 'active',
                'asset_type' => 'asset',
                'created_by' => $firstUser->id ?? null,
            ],
            [
                'name' => 'Dell XPS 15',
                'sku' => 'COMP-002',
                'barcode' => 'DELL-2024-002',
                'serial_number' => 'DL789456123',
                'description' => 'Dell XPS 15, Intel i7, 16GB RAM, 512GB SSD',
                'category_id' => $computerCategory->id,
                'quantity' => 1,
                'min_quantity' => 1,
                'unit_price' => 1899.00,
                'unit' => 'piece',
                'location' => 'IT Storage Room A',
                'manufacturer' => 'Dell',
                'model' => 'XPS 15 9530',
                'purchase_date' => now()->subMonths(3),
                'warranty_expiry' => now()->addMonths(9),
                'status' => 'active',
                'asset_type' => 'asset',
                'created_by' => $firstUser->id ?? null,
            ],

            // Monitors
            [
                'name' => 'LG UltraWide 34"',
                'sku' => 'MON-001',
                'barcode' => 'LG-UW-001',
                'serial_number' => 'LG34WK123456',
                'description' => '34-inch UltraWide monitor, 3440x1440, USB-C',
                'category_id' => $monitorCategory->id,
                'quantity' => 3,
                'min_quantity' => 2,
                'unit_price' => 599.00,
                'unit' => 'piece',
                'location' => 'IT Storage Room B',
                'manufacturer' => 'LG',
                'model' => '34WK95U',
                'purchase_date' => now()->subMonths(4),
                'warranty_expiry' => now()->addMonths(8),
                'status' => 'active',
                'asset_type' => 'asset',
                'created_by' => $firstUser->id ?? null,
            ],
            [
                'name' => 'Dell UltraSharp 27"',
                'sku' => 'MON-002',
                'barcode' => 'DELL-US-002',
                'serial_number' => 'DL27US456789',
                'description' => '27-inch 4K monitor, IPS, USB-C',
                'category_id' => $monitorCategory->id,
                'quantity' => 5,
                'min_quantity' => 3,
                'unit_price' => 449.00,
                'unit' => 'piece',
                'location' => 'IT Storage Room B',
                'manufacturer' => 'Dell',
                'model' => 'U2723DE',
                'purchase_date' => now()->subMonths(1),
                'warranty_expiry' => now()->addMonths(11),
                'status' => 'active',
                'asset_type' => 'asset',
                'created_by' => $firstUser->id ?? null,
            ],

            // Peripherals
            [
                'name' => 'Logitech MX Keys',
                'sku' => 'KEY-001',
                'barcode' => 'LOG-MXK-001',
                'serial_number' => null,
                'description' => 'Wireless keyboard with backlight',
                'category_id' => $peripheralCategory->id,
                'quantity' => 10,
                'min_quantity' => 5,
                'unit_price' => 99.00,
                'unit' => 'piece',
                'location' => 'Supply Closet',
                'manufacturer' => 'Logitech',
                'model' => 'MX Keys',
                'purchase_date' => now()->subMonth(),
                'warranty_expiry' => now()->addYear(),
                'status' => 'active',
                'asset_type' => 'asset',
                'created_by' => $firstUser->id ?? null,
            ],
            [
                'name' => 'Logitech MX Master 3',
                'sku' => 'MOUSE-001',
                'barcode' => 'LOG-MXM-001',
                'serial_number' => null,
                'description' => 'Wireless mouse with precision scroll',
                'category_id' => $peripheralCategory->id,
                'quantity' => 8,
                'min_quantity' => 5,
                'unit_price' => 99.00,
                'unit' => 'piece',
                'location' => 'Supply Closet',
                'manufacturer' => 'Logitech',
                'model' => 'MX Master 3',
                'purchase_date' => now()->subMonth(),
                'warranty_expiry' => now()->addYear(),
                'status' => 'active',
                'asset_type' => 'asset',
                'created_by' => $firstUser->id ?? null,
            ],

            // Mobile Devices
            [
                'name' => 'iPhone 15 Pro',
                'sku' => 'PHONE-001',
                'barcode' => 'IPH-15P-001',
                'serial_number' => 'F17XYZ123456',
                'description' => 'iPhone 15 Pro, 256GB, Space Black',
                'category_id' => $mobileCategory->id,
                'quantity' => 1,
                'min_quantity' => 1,
                'unit_price' => 1199.00,
                'unit' => 'piece',
                'location' => 'IT Storage Room A',
                'manufacturer' => 'Apple',
                'model' => 'iPhone 15 Pro',
                'purchase_date' => now()->subMonths(2),
                'warranty_expiry' => now()->addMonths(10),
                'status' => 'active',
                'asset_type' => 'asset',
                'created_by' => $firstUser->id ?? null,
            ],
        ];

        foreach ($items as $item) {
            InventoryItem::create($item);
        }
    }
}
