<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    ...$user->load('roles')->toArray(),
                    // ✅ New permission system - array of slugs
                    'permissions' => $user->getEffectivePermissionSlugs(),
                    // ✅ Legacy permission flags (for backward compatibility)
                    'can_approve_users' => $user->canApproveUsers(),
                    'can_approve_leaves' => $user->canApproveLeaves(),
                    'can_manage_inventory' => $user->canManageInventory(),
                    'can_manage_projects' => $user->canManageProjects(),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
