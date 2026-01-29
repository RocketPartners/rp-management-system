<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IndividualAssetAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'user_id',
        'assigned_by',
        'assigned_date',
        'expected_return_date',
        'actual_return_date',
        'status',
        'assignment_notes',
        'return_notes',
        'condition_on_assignment',
        'condition_on_return',
    ];

    protected $casts = [
        'assigned_date' => 'date',
        'expected_return_date' => 'date',
        'actual_return_date' => 'date',
    ];

    // Relationship: Assignment belongs to a specific asset
    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    // Relationship: Assignment belongs to a user (the person it's assigned to)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relationship: Assignment was created by a user
    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    // Scope: Active assignments only
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->whereNull('actual_return_date');
    }

    // Scope: Returned assignments
    public function scopeReturned($query)
    {
        return $query->where('status', 'returned')
            ->whereNotNull('actual_return_date');
    }

    // Check if assignment is overdue (if expected return date passed)
    public function isOverdue()
    {
        return $this->expected_return_date
               && $this->expected_return_date->isPast()
               && $this->status === 'active';
    }
}
