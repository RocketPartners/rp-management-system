<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'type',
        'color',
    ];

    // Relationship: A category has many inventory items
    public function inventoryItems()
    {
        return $this->hasMany(InventoryItem::class);
    }

    // Relationship: A category has many projects
    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    // Scope: Filter by type
    public function scopeInventory($query)
    {
        return $query->where('type', 'inventory');
    }

    public function scopeProject($query)
    {
        return $query->where('type', 'project');
    }
}
