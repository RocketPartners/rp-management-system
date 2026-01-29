<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetHistory extends Model
{
    use HasFactory;

    protected $table = 'asset_history';

    protected $fillable = [
        'inventory_item_id',
        'user_id',
        'performed_by',
        'action',
        'notes',
        'metadata',
        'action_date',
    ];

    protected $casts = [
        'metadata' => 'array',
        'action_date' => 'datetime',
    ];

    // Relationship: History belongs to an inventory item
    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    // Relationship: History relates to a user (who the asset was assigned to)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relationship: History performed by a user
    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
