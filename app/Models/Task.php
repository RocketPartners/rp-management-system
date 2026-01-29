<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'project_id',
        'title',
        'description',
        'assigned_to',
        'created_by',
        'status',
        'priority',
        'due_date',
        'estimated_hours',
        'actual_hours',
        'order',
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    // Relationship: A task belongs to a project
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    // Relationship: A task is assigned to a user
    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // Relationship: A task is created by a user
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Check if task is overdue
    public function isOverdue()
    {
        return $this->due_date && $this->due_date->isPast() && $this->status !== 'completed';
    }

    // Scope: Filter by status
    public function scopeTodo($query)
    {
        return $query->where('status', 'todo');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}
