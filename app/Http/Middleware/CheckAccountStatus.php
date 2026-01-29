<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAccountStatus
{
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            $user = auth()->user();

            // If account is pending approval
            if ($user->account_status === 'pending') {
                // ✅ FIX: Allow access to the pending page itself, logout, and verification routes
                if (! $request->routeIs('account.pending') &&
                    ! $request->routeIs('logout') &&
                    ! $request->routeIs('verification.*') &&
                    ! str_starts_with($request->path(), 'user/')) {
                    return redirect()->route('account.pending');
                }
            }

            // If account is rejected or suspended
            if (in_array($user->account_status, ['rejected', 'suspended'])) {
                // ✅ Don't redirect if already on login page
                if (! $request->routeIs('login')) {
                    auth()->logout();

                    return redirect()->route('login')
                        ->with('error', 'Your account has been '.$user->account_status.'.');
                }
            }
        }

        return $next($request);
    }
}
