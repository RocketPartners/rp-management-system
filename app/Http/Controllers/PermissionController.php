<?php

namespace App\Http\Controllers;

use App\Services\PermissionService;
use Inertia\Inertia;

class PermissionController extends Controller
{
    public function __construct(
        protected PermissionService $permissionService
    ) {}

    /**
     * List all permissions (for reference)
     */
    public function index()
    {
        // Authorize: at least need to be able to view permissions
        // Can be accessible to admins or anyone who needs to see what permissions exist
        if (! auth()->user()->hasAnyPermission([
            'users.assign-permissions',
            'system.manage-roles',
            'system.view-logs',
        ])) {
            abort(403, 'You do not have permission to view permissions.');
        }

        $permissions = $this->permissionService->getAllPermissionsGrouped();

        return Inertia::render('Permissions/Index', [
            'permissions' => $permissions,
        ]);
    }
}
