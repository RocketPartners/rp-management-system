<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_item_id',
        'user_id',
        'assigned_by',
        'assigned_date',
        'return_date',
        'status',
        'notes',
        'condition_on_assignment',
        'condition_on_return',
    ];

    protected $casts = [
        'assigned_date' => 'date',
        'return_date' => 'date',
    ];

    // Relationship: An assignment belongs to an inventory item
    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    // Relationship: An assignment belongs to a user (assignee)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relationship: An assignment is created by a user
    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    // Scope: Active assignments
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // Scope: Returned assignments
    public function scopeReturned($query)
    {
        return $query->where('status', 'returned');
    }
}
