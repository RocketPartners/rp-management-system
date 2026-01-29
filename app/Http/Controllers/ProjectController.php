<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Project::with(['category', 'owner', 'tasks']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
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

        // Filter by priority
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        $projects = $query->latest()->paginate(15)->withQueryString();
        $categories = Category::where('type', 'project')->get();

        return Inertia::render('Admin/Projects/Index', [
            'projects' => $projects,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'status', 'priority']),
        ]);
    }

    public function create()
    {
        $categories = Category::where('type', 'project')->get();
        $users = User::orderBy('name')->get();

        return Inertia::render('Admin/Projects/Create', [
            'categories' => $categories,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:projects,code',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'owner_id' => 'required|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:planning,in_progress,on_hold,completed,cancelled',
            'priority' => 'required|in:low,medium,high,urgent',
            'progress' => 'nullable|integer|min:0|max:100',
            'budget' => 'nullable|numeric|min:0',
        ]);

        Project::create($validated);

        return redirect()->route('projects.index')->with('success', 'Project created successfully!');
    }

    public function show(Project $project)
    {
        $project->load([
            'category',
            'owner',
            'tasks.assignee',
            'tasks.creator',
        ]);

        return Inertia::render('Projects/Show', [
            'project' => $project,
        ]);
    }

    public function edit(Project $project)
    {
        $categories = Category::where('type', 'project')->get();
        $users = User::orderBy('name')->get();

        return Inertia::render('Admin/Projects/Edit', [
            'project' => $project,
            'categories' => $categories,
            'users' => $users,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:projects,code,'.$project->id,
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'owner_id' => 'required|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:planning,in_progress,on_hold,completed,cancelled',
            'priority' => 'required|in:low,medium,high,urgent',
            'progress' => 'nullable|integer|min:0|max:100',
            'budget' => 'nullable|numeric|min:0',
        ]);

        $project->update($validated);

        return redirect()->route('projects.index')->with('success', 'Project updated successfully!');
    }

    public function destroy(Project $project)
    {
        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Project deleted successfully!');
    }
}
