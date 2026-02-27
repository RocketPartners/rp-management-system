<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RoleController extends Controller
{
    /**
     * System roles that cannot be deleted or modified
     */
    const PROTECTED_ROLES = ['super-admin', 'admin'];

    /**
     * Display a listing of roles
     */
    public function index(Request $request)
    {
        // Check permission
        if (! auth()->user()->hasPermission('roles.view')) {
            abort(403, 'You do not have permission to access role management.');
        }

        $query = Role::withCount('users', 'permissions');

        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortField = $request->get('sort', 'name');
        $sortDirection = $request->get('direction', 'asc');

        switch ($sortField) {
            case 'users_count':
                $query->orderBy('users_count', $sortDirection);
                break;
            case 'created_at':
                $query->orderBy('created_at', $sortDirection);
                break;
            default:
                $query->orderBy('name', $sortDirection);
        }

        $roles = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
            'filters' => $request->only(['search', 'sort', 'direction']),
        ]);
    }

    /**
     * Show the form for creating a new role
     */
    public function create()
    {
        // Check permission
        if (! auth()->user()->hasPermission('roles.create')) {
            abort(403, 'You do not have permission to create roles.');
        }

        // Load all permissions grouped by category
        $permissions = Permission::all()->groupBy('group');

        return Inertia::render('Admin/Roles/Create', [
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created role in storage
     */
    public function store(Request $request)
    {
        // Check permission
        if (! auth()->user()->hasPermission('roles.create')) {
            abort(403, 'You do not have permission to create roles.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'slug' => [
                'required',
                'string',
                'max:255',
                'unique:roles,slug',
                'regex:/^[a-z0-9-]+$/',
            ],
            'description' => 'nullable|string|max:500',
            'hierarchy_level' => 'required|integer|min:1|max:10',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        // Create role
        $role = Role::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'hierarchy_level' => $validated['hierarchy_level'],
        ]);

        // Sync permissions
        if (isset($validated['permissions'])) {
            $role->permissions()->sync($validated['permissions']);
        }

        return redirect()->route('roles.index')->with('success', 'Role created successfully!');
    }

    /**
     * Display the specified role
     */
    public function show(Role $role)
    {
        // Check permission
        if (! auth()->user()->hasPermission('roles.view')) {
            abort(403, 'You do not have permission to view role details.');
        }

        // Load relationships
        $role->load([
            'permissions' => function ($query) {
                $query->orderBy('group')->orderBy('name');
            },
            'users' => function ($query) {
                $query->select('users.id', 'users.name', 'users.email', 'users.profile_picture')
                    ->latest()
                    ->take(10);
            },
        ]);

        // Load users count
        $role->loadCount('users');

        // Group permissions by category
        $groupedPermissions = $role->permissions->groupBy('group');

        return Inertia::render('Admin/Roles/Show', [
            'role' => $role,
            'groupedPermissions' => $groupedPermissions,
        ]);
    }

    /**
     * Show the form for editing the specified role
     */
    public function edit(Role $role)
    {
        // Check permission
        if (! auth()->user()->hasPermission('roles.edit')) {
            abort(403, 'You do not have permission to edit roles.');
        }

        // Load current permissions
        $role->load('permissions');

        // Load all permissions grouped by category
        $permissions = Permission::all()->groupBy('group');

        return Inertia::render('Admin/Roles/Edit', [
            'role' => $role,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Update the specified role in storage
     */
    public function update(Request $request, Role $role)
    {
        // Check permission
        if (! auth()->user()->hasPermission('roles.edit')) {
            abort(403, 'You do not have permission to update roles.');
        }

        // Prevent modification of system roles
        if (in_array($role->slug, self::PROTECTED_ROLES)) {
            return back()->withErrors([
                'role' => 'Cannot modify system roles (super-admin, admin).',
            ]);
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles')->ignore($role->id),
            ],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles')->ignore($role->id),
                'regex:/^[a-z0-9-]+$/',
            ],
            'description' => 'nullable|string|max:500',
            'hierarchy_level' => 'required|integer|min:1|max:10',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        // Update role
        $role->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'hierarchy_level' => $validated['hierarchy_level'],
        ]);

        // Sync permissions
        if (isset($validated['permissions'])) {
            $role->permissions()->sync($validated['permissions']);
        }

        return redirect()->route('roles.index')->with('success', 'Role updated successfully!');
    }

    /**
     * Remove the specified role from storage
     */
    public function destroy(Request $request, Role $role)
    {
        // Check permission
        if (! auth()->user()->hasPermission('roles.delete')) {
            abort(403, 'You do not have permission to delete roles.');
        }

        // Prevent deletion of system roles
        if (in_array($role->slug, self::PROTECTED_ROLES)) {
            return back()->withErrors([
                'role' => 'Cannot delete system roles (super-admin, admin).',
            ]);
        }

        // Check if any users have this role
        $userCount = $role->users()->count();
        if ($userCount > 0 && ! $request->input('force_delete')) {
            return back()->withErrors([
                'role' => "This role is assigned to {$userCount} user(s). Please reassign them first or use force delete.",
            ]);
        }

        // Delete role (permissions will be auto-detached by pivot table)
        $role->delete();

        return redirect()->route('roles.index')->with('success', 'Role deleted successfully!');
    }
}
