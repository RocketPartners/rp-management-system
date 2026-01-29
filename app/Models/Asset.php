<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Asset extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'inventory_item_id',
        'asset_tag',
        'serial_number',
        'barcode',
        'purchase_date',
        'purchase_price',
        'warranty_expiry',
        'condition',
        'status',
        'location',
        'notes',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'warranty_expiry' => 'date',
        'purchase_price' => 'decimal:2',
    ];

    // Relationship: An asset belongs to an inventory item (the product type)
    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    // Relationship: An asset has many assignment records (NEW system)
    public function assignments()
    {
        return $this->hasMany(IndividualAssetAssignment::class);
    }

    // Relationship: Current active assignment (NEW system)
    public function currentAssignment()
    {
        return $this->hasOne(IndividualAssetAssignment::class)
            ->where('status', 'active')
            ->whereNull('actual_return_date')
            ->latest();
    }

    // Relationship: Currently assigned user (NEW system)
    public function assignedUser()
    {
        return $this->hasOneThrough(
            User::class,
            IndividualAssetAssignment::class,
            'asset_id',      // Foreign key on individual_asset_assignments
            'id',            // Foreign key on users
            'id',            // Local key on assets
            'user_id'        // Local key on individual_asset_assignments
        )->where('individual_asset_assignments.status', 'active')
            ->whereNull('individual_asset_assignments.actual_return_date');
    }

    // Check if this specific asset is currently assigned
    public function isAssigned()
    {
        return $this->currentAssignment()->exists();
    }

    // Check if this specific asset is available
    public function isAvailable()
    {
        return $this->status === 'Available' && ! $this->isAssigned();
    }

    // Scope: Available assets only
    public function scopeAvailable($query)
    {
        return $query->where('status', 'Available')
            ->whereDoesntHave('currentAssignment');
    }

    // Scope: Assigned assets only
    public function scopeAssigned($query)
    {
        return $query->where('status', 'Assigned')
            ->whereHas('currentAssignment');
    }
}
