<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::with(['project', 'assignee', 'creator']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by priority
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        // Filter by assignee
        if ($request->has('assignee')) {
            $query->where('assigned_to', $request->assignee);
        }

        // Filter by project
        if ($request->has('project')) {
            $query->where('project_id', $request->project);
        }

        $tasks = $query->latest()->paginate(20)->withQueryString();
        $projects = Project::orderBy('name')->get();
        $users = User::orderBy('name')->get();

        return Inertia::render('Admin/Tasks/Index', [
            'tasks' => $tasks,
            'projects' => $projects,
            'users' => $users,
            'filters' => $request->only(['search', 'status', 'priority', 'assignee', 'project']),
        ]);
    }

    // Kanban board view
    public function kanban(Request $request)
    {
        $query = Task::with(['project', 'assignee']);

        // Filter by project
        if ($request->has('project')) {
            $query->where('project_id', $request->project);
        }

        // Filter by assignee
        if ($request->has('assignee')) {
            $query->where('assigned_to', $request->assignee);
        }

        $tasks = $query->orderBy('order')->get();

        // Group by status for Kanban
        $kanbanTasks = [
            'todo' => $tasks->where('status', 'todo')->values(),
            'in_progress' => $tasks->where('status', 'in_progress')->values(),
            'review' => $tasks->where('status', 'review')->values(),
            'completed' => $tasks->where('status', 'completed')->values(),
        ];

        $projects = Project::orderBy('name')->get();
        $users = User::orderBy('name')->get();

        return Inertia::render('Admin/Tasks/Kanban', [
            'kanbanTasks' => $kanbanTasks,
            'projects' => $projects,
            'users' => $users,
            'filters' => $request->only(['project', 'assignee']),
        ]);
    }

    public function create()
    {
        $projects = Project::where('status', '!=', 'completed')->orderBy('name')->get();
        $users = User::orderBy('name')->get();

        return Inertia::render('Admin/Tasks/Create', [
            'projects' => $projects,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'status' => 'required|in:todo,in_progress,review,completed',
            'priority' => 'required|in:low,medium,high,urgent',
            'due_date' => 'nullable|date',
            'estimated_hours' => 'nullable|integer|min:0',
        ]);

        $validated['created_by'] = auth()->id();

        Task::create($validated);

        return redirect()->route('tasks.index')->with('success', 'Task created successfully!');
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'status' => 'required|in:todo,in_progress,review,completed',
            'priority' => 'required|in:low,medium,high,urgent',
            'due_date' => 'nullable|date',
            'estimated_hours' => 'nullable|integer|min:0',
            'actual_hours' => 'nullable|integer|min:0',
        ]);

        $task->update($validated);

        return back()->with('success', 'Task updated successfully!');
    }

    // Update task status (for Kanban drag & drop)
    public function updateStatus(Request $request, Task $task)
    {
        $validated = $request->validate([
            'status' => 'required|in:todo,in_progress,review,completed',
        ]);

        $task->update($validated);

        return back();
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return redirect()->route('tasks.index')->with('success', 'Task deleted successfully!');
    }
}
