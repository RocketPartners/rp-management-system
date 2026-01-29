<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        // Load assets relationship to show individual asset counts
        $query = InventoryItem::with(['category', 'creator', 'currentAssignment.user', 'assets']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%")
                    ->orWhere('serial_number', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by asset type
        if ($request->has('asset_type')) {
            $query->where('asset_type', $request->asset_type);
        }

        // Filter low stock
        if ($request->has('filter') && $request->filter === 'low-stock') {
            $query->lowStock();
        }

        $items = $query->latest()->paginate(15)->withQueryString();

        $categories = Category::where('type', 'inventory')->get();

        return Inertia::render('Admin/Inventory/Index', [
            'items' => $items,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'status', 'asset_type', 'filter']),
        ]);
    }

    public function create()
    {
        $categories = Category::where('type', 'inventory')->get();

        return Inertia::render('Admin/Inventory/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:inventory_items,sku',
            'barcode' => 'nullable|string|unique:inventory_items,barcode',
            'serial_number' => 'nullable|string',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'quantity' => 'required|integer|min:0',
            'min_quantity' => 'required|integer|min:0',
            'unit_price' => 'required|numeric|min:0',
            'unit' => 'required|string',
            'location' => 'nullable|string',
            'manufacturer' => 'nullable|string',
            'model' => 'nullable|string',
            'purchase_date' => 'nullable|date',
            'warranty_expiry' => 'nullable|date',
            'status' => 'required|in:active,discontinued,out_of_stock',
            'asset_type' => 'required|in:consumable,asset',
        ]);

        $validated['created_by'] = auth()->id();

        // Create the inventory item
        $inventoryItem = InventoryItem::create($validated);

        // If it's an asset type, automatically create individual assets (placeholders)
        if ($validated['asset_type'] === 'asset' && $validated['quantity'] > 0) {
            for ($i = 1; $i <= $validated['quantity']; $i++) {
                \App\Models\Asset::create([
                    'inventory_item_id' => $inventoryItem->id,
                    'asset_tag' => 'ASSET-'.$inventoryItem->id.'-'.str_pad($i, 3, '0', STR_PAD_LEFT),
                    'serial_number' => null,  // HR will enter manually
                    'barcode' => null,  // HR will enter manually
                    'purchase_date' => $validated['purchase_date'],
                    'purchase_price' => $validated['unit_price'],
                    'warranty_expiry' => $validated['warranty_expiry'],
                    'condition' => 'Good',
                    'status' => 'Available',
                    'location' => $validated['location'],
                    'notes' => "Placeholder asset #{$i} - Please add serial number and barcode",
                ]);
            }
        }

        return redirect()->route('inventory.index')->with('success', 'Inventory item created successfully!'.
            ($validated['asset_type'] === 'asset' ? " {$validated['quantity']} individual assets were created. Please add serial numbers and barcodes." : ''));
    }

    public function show(InventoryItem $inventory)
    {
        // Load both old assignments and new individual assets
        $inventory->load([
            'category',
            'creator',
            'assignments.user',
            'assignments.assignedBy',
            'history.user',
            'history.performedBy',
            'assets.currentAssignment.user',  // NEW: Load individual assets
        ]);

        return Inertia::render('Admin/Inventory/Show', [
            'item' => $inventory,
        ]);
    }

    public function edit(InventoryItem $inventory)
    {
        $categories = Category::where('type', 'inventory')->get();

        return Inertia::render('Admin/Inventory/Edit', [
            'item' => [
                ...$inventory->toArray(),
                'purchase_date' => $inventory->purchase_date?->format('Y-m-d'),
                'warranty_expiry' => $inventory->warranty_expiry?->format('Y-m-d'),
            ],
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, InventoryItem $inventory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:inventory_items,sku,'.$inventory->id,
            'barcode' => 'nullable|string|unique:inventory_items,barcode,'.$inventory->id,
            'serial_number' => 'nullable|string',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'quantity' => 'required|integer|min:0',
            'min_quantity' => 'required|integer|min:0',
            'unit_price' => 'required|numeric|min:0',
            'unit' => 'required|string',
            'location' => 'nullable|string',
            'manufacturer' => 'nullable|string',
            'model' => 'nullable|string',
            'purchase_date' => 'nullable|date',
            'warranty_expiry' => 'nullable|date',
            'status' => 'required|in:active,discontinued,out_of_stock',
            'asset_type' => 'required|in:consumable,asset',
        ]);

        // Handle asset quantity changes BEFORE updating
        if ($validated['asset_type'] === 'asset') {
            $currentAssetCount = $inventory->assets()->count();
            $newQuantity = $validated['quantity'];

            if ($newQuantity > $currentAssetCount) {
                // INCREASE: Create more assets
                $assetsToCreate = $newQuantity - $currentAssetCount;

                for ($i = 1; $i <= $assetsToCreate; $i++) {
                    $assetNumber = $currentAssetCount + $i;

                    \App\Models\Asset::create([
                        'inventory_item_id' => $inventory->id,
                        'asset_tag' => 'ASSET-'.$inventory->id.'-'.str_pad($assetNumber, 3, '0', STR_PAD_LEFT),
                        'serial_number' => null,
                        'barcode' => null,
                        'purchase_date' => $validated['purchase_date'],
                        'purchase_price' => $validated['unit_price'],
                        'warranty_expiry' => $validated['warranty_expiry'],
                        'condition' => 'Good',
                        'status' => 'Available',
                        'location' => $validated['location'],
                        'notes' => "Placeholder asset #{$assetNumber} - Please add serial number and barcode",
                    ]);
                }

                $message = "Inventory updated! Added {$assetsToCreate} new placeholder asset(s). Total: {$newQuantity}";

            } elseif ($newQuantity < $currentAssetCount) {
                // DECREASE: Try to auto-delete placeholder assets
                $assetsToRemove = $currentAssetCount - $newQuantity;

                // Find empty placeholder assets (safe to delete)
                $placeholderAssets = $inventory->assets()
                    ->where('status', 'Available')
                    ->whereNull('serial_number')
                    ->whereNull('barcode')
                    ->limit($assetsToRemove)
                    ->get();

                // Check if we have enough placeholders to delete
                if ($placeholderAssets->count() < $assetsToRemove) {
                    $assetsWithData = $currentAssetCount - $placeholderAssets->count();

                    return back()->withInput()->with('error',
                        "Cannot reduce quantity from {$currentAssetCount} to {$newQuantity}. ".
                        "Only {$placeholderAssets->count()} empty placeholder(s) available to remove. ".
                        "{$assetsWithData} asset(s) have serial numbers, barcodes, or are assigned. ".
                        "Please delete specific assets from the 'View Details' page using selective delete."
                    );
                }

                // Safe to delete - all are empty placeholders
                foreach ($placeholderAssets as $asset) {
                    $asset->delete();
                }

                $message = "Inventory updated! Removed {$placeholderAssets->count()} placeholder asset(s). Total: {$newQuantity}";

            } else {
                // Same quantity - no asset changes needed
                $message = 'Inventory item updated successfully!';
            }
        } else {
            // Consumable type - quantity is manual input
            $message = 'Inventory item updated successfully!';
        }

        $inventory->update($validated);

        return redirect()->route('inventory.index')->with('success', $message);
    }

    public function destroy(InventoryItem $inventory)
    {
        // Check if this item has individual assets
        if ($inventory->asset_type === 'asset') {
            $totalAssets = $inventory->assets()->count();

            if ($totalAssets > 0) {
                // Check for ANY assigned assets
                $assignedCount = $inventory->assets()
                    ->where('status', 'Assigned')
                    ->count();

                if ($assignedCount > 0) {
                    return back()->with('error',
                        "Cannot delete '{$inventory->name}'. {$assignedCount} asset(s) are currently assigned to users. Please return them first."
                    );
                }

                // All assets are unassigned - safe to delete everything
                // This includes both empty placeholders AND assets with serial/barcode
                $inventory->assets()->delete();
            }
        }

        $inventory->delete();

        return redirect()->route('inventory.index')
            ->with('success', 'Inventory item and all associated assets deleted successfully!');
    }

    /**
     * Delete selected individual assets (AJAX endpoint)
     * Only deletes assets that are NOT assigned to users
     * Assets can have serial numbers or barcodes and still be deleted if unassigned
     */
    public function deleteSelectedAssets(Request $request)
    {
        $validated = $request->validate([
            'asset_ids' => 'required|array',
            'asset_ids.*' => 'required|exists:assets,id',
        ]);

        // Get the assets
        $assets = \App\Models\Asset::whereIn('id', $validated['asset_ids'])->get();

        // Verify all assets are deletable (NOT assigned to users)
        $assignedAssets = $assets->filter(function ($asset) {
            return $asset->status === 'Assigned';
        });

        if ($assignedAssets->count() > 0) {
            return back()->with('error',
                'Cannot delete selected assets. '.$assignedAssets->count().' asset(s) are currently assigned to users. Please return them first.'
            );
        }

        // Get the inventory item to update quantity
        $inventoryItem = $assets->first()->inventoryItem;
        $deletedCount = $assets->count();

        // Delete the assets (they're all unassigned)
        \App\Models\Asset::whereIn('id', $validated['asset_ids'])->delete();

        // Update the inventory quantity
        $inventoryItem->decrement('quantity', $deletedCount);

        return back()->with('success',
            "Successfully deleted {$deletedCount} asset(s). Inventory quantity updated to {$inventoryItem->fresh()->quantity}."
        );
    }
}
