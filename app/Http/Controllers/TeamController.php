<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        if (! $user->hasPermission('teams.view')) {
            abort(403);
        }

        $query = Team::with(['leader:id,name,position,department', 'subLeader:id,name,position,department'])
            ->withCount('members');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('leader', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('subLeader', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $teams = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Teams/Index', [
            'teams' => $teams,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        if (! $user->hasPermission('teams.create')) {
            abort(403);
        }

        $users = User::where('employment_status', 'active')
            ->get(['id', 'name', 'position', 'department', 'profile_picture']);

        return Inertia::render('Admin/Teams/CreateEdit', [
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        if (! $user->hasPermission('teams.create')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'leader_id' => 'nullable|exists:users,id',
            'sub_leader_id' => 'nullable|exists:users,id|different:leader_id',
            'status' => 'required|in:active,inactive,archived',
            'members' => 'nullable|array',
            'members.*' => 'exists:users,id',
        ]);

        $team = Team::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'leader_id' => $validated['leader_id'] ?? null,
            'sub_leader_id' => $validated['sub_leader_id'] ?? null,
            'status' => $validated['status'],
        ]);

        $this->syncMembers($team, $validated);

        return redirect()->route('teams.index')->with('success', 'Team created successfully.');
    }

    public function show(Team $team)
    {
        $user = auth()->user();
        if (! $user->hasPermission('teams.view')) {
            abort(403);
        }

        $team->load([
            'leader:id,name,position,department,profile_picture,email',
            'subLeader:id,name,position,department,profile_picture,email',
            'members' => fn ($q) => $q->select('users.id', 'users.name', 'users.position', 'users.department', 'users.profile_picture', 'users.email'),
        ]);

        return Inertia::render('Admin/Teams/Show', [
            'team' => $team,
        ]);
    }

    public function edit(Team $team)
    {
        $user = auth()->user();
        if (! $user->hasPermission('teams.edit')) {
            abort(403);
        }

        $team->load(['leader:id,name', 'subLeader:id,name', 'members:users.id']);

        $users = User::where('employment_status', 'active')
            ->get(['id', 'name', 'position', 'department', 'profile_picture']);

        return Inertia::render('Admin/Teams/CreateEdit', [
            'team' => $team,
            'users' => $users,
        ]);
    }

    public function update(Request $request, Team $team)
    {
        $user = auth()->user();
        if (! $user->hasPermission('teams.edit')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'leader_id' => 'nullable|exists:users,id',
            'sub_leader_id' => 'nullable|exists:users,id|different:leader_id',
            'status' => 'required|in:active,inactive,archived',
            'members' => 'nullable|array',
            'members.*' => 'exists:users,id',
        ]);

        $team->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'leader_id' => $validated['leader_id'] ?? null,
            'sub_leader_id' => $validated['sub_leader_id'] ?? null,
            'status' => $validated['status'],
        ]);

        $this->syncMembers($team, $validated);

        return redirect()->route('teams.show', $team)->with('success', 'Team updated successfully.');
    }

    public function destroy(Team $team)
    {
        $user = auth()->user();
        if (! $user->hasPermission('teams.delete')) {
            abort(403);
        }

        $team->delete();

        return redirect()->route('teams.index')->with('success', 'Team deleted successfully.');
    }

    private function syncMembers(Team $team, array $validated): void
    {
        $members = collect($validated['members'] ?? []);

        // Auto-add leader and sub-leader to members
        if ($team->leader_id) {
            $members->push($team->leader_id);
        }
        if ($team->sub_leader_id) {
            $members->push($team->sub_leader_id);
        }

        $memberIds = $members->unique()->values();

        // Batch-load existing pivot data to avoid N+1 queries
        $existingPivots = DB::table('team_user')
            ->where('team_id', $team->id)
            ->whereIn('user_id', $memberIds)
            ->pluck('is_primary', 'user_id');

        $usersWithOtherTeams = DB::table('team_user')
            ->where('team_id', '!=', $team->id)
            ->whereIn('user_id', $memberIds)
            ->distinct()
            ->pluck('user_id')
            ->flip();

        $syncData = [];
        foreach ($memberIds as $memberId) {
            $roleInTeam = 'member';
            if ($memberId == $team->leader_id) {
                $roleInTeam = 'lead';
            } elseif ($memberId == $team->sub_leader_id) {
                $roleInTeam = 'sub-lead';
            }

            if ($existingPivots->has($memberId)) {
                $isPrimary = (bool) $existingPivots[$memberId];
            } else {
                // First team for this user — auto-set as primary
                $isPrimary = ! $usersWithOtherTeams->has($memberId);
            }

            $syncData[$memberId] = [
                'role_in_team' => $roleInTeam,
                'is_primary' => $isPrimary,
            ];
        }

        $team->members()->sync($syncData);
    }
}
