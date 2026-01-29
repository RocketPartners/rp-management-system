<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'category_id',
        'owner_id',
        'start_date',
        'end_date',
        'status',
        'priority',
        'progress',
        'budget',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'budget' => 'decimal:2',
    ];

    // Relationship: A project belongs to a category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Relationship: A project belongs to an owner (user)
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    // Relationship: A project has many tasks
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    // Get all team members (users assigned to tasks)
    public function teamMembers()
    {
        return User::whereHas('assignedTasks', function ($query) {
            $query->where('project_id', $this->id);
        })->distinct()->get();
    }

    // Scope: Filter by status
    public function scopeActive($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    // Check if project is overdue
    public function isOverdue()
    {
        return $this->end_date && $this->end_date->isPast() && $this->status !== 'completed';
    }
}
