<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\InventoryItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AssetSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Clear existing assets
        Asset::truncate();

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Get all inventory items that are assets (not consumables)
        $inventoryItems = InventoryItem::where('asset_type', 'asset')->get();

        $globalAssetCounter = 1; // Global counter for unique asset tags

        foreach ($inventoryItems as $item) {
            // Create individual assets for each quantity
            for ($i = 1; $i <= $item->quantity; $i++) {
                Asset::create([
                    'inventory_item_id' => $item->id,
                    // Use item ID + counter for truly unique asset tags
                    'asset_tag' => 'ASSET-'.$item->id.'-'.str_pad($i, 3, '0', STR_PAD_LEFT),
                    'serial_number' => $item->serial_number ? $item->serial_number.'-'.$i : null,
                    'barcode' => $item->barcode ? $item->barcode.'-'.str_pad($i, 3, '0', STR_PAD_LEFT) : 'BAR-'.$item->id.'-'.str_pad($i, 3, '0', STR_PAD_LEFT),
                    'purchase_date' => $item->purchase_date,
                    'purchase_price' => $item->unit_price,
                    'warranty_expiry' => $item->warranty_expiry,
                    'condition' => 'Good',
                    'status' => 'Available',
                    'location' => $item->location,
                    'notes' => "Auto-generated asset #{$i} for {$item->name}",
                ]);

                $globalAssetCounter++;
            }
        }

        $this->command->info('✅ Created '.($globalAssetCounter - 1).' individual assets!');
    }
}
