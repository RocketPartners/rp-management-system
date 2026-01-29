<?php

namespace App\Http\Controllers\Onboarding;

use App\Http\Controllers\Controller;
use App\Models\OnboardingInvite;
use App\Services\Onboarding\OnboardingInviteService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OnboardingInviteController extends Controller
{
    protected $inviteService;

    public function __construct(OnboardingInviteService $inviteService)
    {
        $this->inviteService = $inviteService;
    }

    /**
     * Display all onboarding invites (HR view)
     */
    public function index(Request $request)
    {
        // Check permission (HR/Admin only)
        if (! auth()->user()->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count()) {
            abort(403, 'Only HR can access onboarding invites.');
        }

        $query = OnboardingInvite::with(['creator', 'submission', 'convertedUser']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $invites = $query->latest()->paginate(15)->withQueryString();

        // Get statistics
        $stats = $this->inviteService->getStatistics();

        return Inertia::render('Admin/Onboarding/Invites/Index', [
            'invites' => $invites,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show form to create new invite
     */
    public function create()
    {
        // Check permission
        if (! auth()->user()->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count()) {
            abort(403, 'Only HR can create onboarding invites.');
        }

        // ✅ Get all roles from database (not hardcoded)
        $roles = \App\Models\Role::orderBy('name')->get(['id', 'name', 'slug', 'description']);

        // ✅ Get unique departments from users
        $departments = \App\Models\User::whereNotNull('department')
            ->distinct()
            ->pluck('department')
            ->sort()
            ->values();

        // ✅ Add common departments if none exist
        if ($departments->isEmpty()) {
            $departments = collect([
                'Engineering',
                'Project Management',
                'Human Resources',
                'Administration',
                'Sales',
                'Marketing',
                'Finance',
                'Operations',
            ]);
        }

        return Inertia::render('Admin/Onboarding/Invites/Create', [
            'roles' => $roles,
            'departments' => $departments,
        ]);
    }

    /**
     * Store new invite and send email
     */
    public function store(Request $request)
    {
        // Check permission
        if (! auth()->user()->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count()) {
            abort(403, 'Only HR can create onboarding invites.');
        }

        // ✅ Get valid role slugs from database
        $validRoles = \App\Models\Role::pluck('slug')->toArray();

        $validated = $request->validate([
            'email' => 'required|email|unique:onboarding_invites,email',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'position' => ['required', 'string', 'in:'.implode(',', $validRoles)], // ✅ Dynamic validation
            'department' => 'required|string|max:255',
        ]);

        try {
            $invite = $this->inviteService->createInvite($validated);

            return redirect()->route('onboarding.invites.index')
                ->with('success', "Onboarding invite sent to {$invite->email}! Guest link: {$invite->guest_url}");

        } catch (\Exception $e) {
            return back()->withInput()->with('error', 'Failed to create invite: '.$e->getMessage());
        }
    }

    /**
     * Show invite details
     */
    public function show(OnboardingInvite $invite)
    {
        // Check permission
        if (! auth()->user()->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count()) {
            abort(403, 'Only HR can view onboarding invites.');
        }

        $invite->load(['creator', 'submission.documents', 'convertedUser']);

        return Inertia::render('Admin/Onboarding/Invites/Show', [
            'invite' => $invite,
        ]);
    }

    /**
     * Resend invitation email
     */
    public function resend(OnboardingInvite $invite)
    {
        // Check permission
        if (! auth()->user()->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count()) {
            abort(403);
        }

        try {
            $this->inviteService->resendInvite($invite);

            return back()->with('success', 'Invitation email resent successfully!');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Extend invite expiration
     */
    public function extend(Request $request, OnboardingInvite $invite)
    {
        // Check permission
        if (! auth()->user()->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count()) {
            abort(403);
        }

        $validated = $request->validate([
            'days' => 'required|integer|min:1|max:30',
        ]);

        try {
            $this->inviteService->extendExpiration($invite, $validated['days']);

            return back()->with('success', "Invite extended by {$validated['days']} days!");

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Cancel an invite
     */
    public function cancel(OnboardingInvite $invite)
    {
        // Check permission
        if (! auth()->user()->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count()) {
            abort(403);
        }

        try {
            $this->inviteService->cancelInvite($invite);

            return redirect()->route('onboarding.invites.index')
                ->with('success', 'Invite cancelled successfully.');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Convert approved submission to user account
     */
    public function convertToUser(OnboardingInvite $invite)
    {
        // Check permission
        if (! auth()->user()->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count()) {
            abort(403);
        }

        try {
            $user = $this->inviteService->convertToUser($invite);

            return redirect()->route('users.show', $user->id)
                ->with('success', "User account created for {$user->name}! Temporary password sent via email.");

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
