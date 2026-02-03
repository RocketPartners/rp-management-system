<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\OnboardingInvite;
use Symfony\Component\HttpFoundation\Response;

class ValidateOnboardingInvite
{
    /**
     * Handle an incoming request.
     *
     * Validates that the onboarding invite token is valid and not expired.
     * Loads the invite into the request for use in controllers.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->route('token');

        if (!$token) {
            abort(404, 'Invite token not found');
        }

        // Load invite with relationships
        $invite = OnboardingInvite::where('token', $token)
            ->with(['submission.documents'])
            ->firstOrFail();

        // Validate invite is still active
        if (!$invite->isValid()) {
            return redirect()
                ->route('guest.onboarding.show', $token)
                ->with('error', 'This invite has expired or is no longer valid.');
        }

        // Make invite available to controller
        $request->merge(['invite' => $invite]);

        return $next($request);
    }
}
