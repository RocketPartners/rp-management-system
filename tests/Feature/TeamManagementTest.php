<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\Team;
use App\Models\User;

// ============================================
// HELPERS
// ============================================

function createPermissions(): void
{
    $slugs = ['teams.view', 'teams.create', 'teams.edit', 'teams.delete'];

    foreach ($slugs as $slug) {
        Permission::firstOrCreate(
            ['slug' => $slug],
            ['name' => $slug, 'description' => $slug, 'category' => 'teams', 'group' => 'teams']
        );
    }
}

function createUserWithPermissions(array $permissionSlugs): User
{
    createPermissions();

    $role = Role::create([
        'name' => 'Test Role '.uniqid(),
        'slug' => 'test-role-'.uniqid(),
    ]);

    $permissionIds = Permission::whereIn('slug', $permissionSlugs)->pluck('id');
    $role->permissions()->sync($permissionIds);

    $user = User::factory()->create(['employment_status' => 'active']);
    $user->roles()->attach($role);

    return $user;
}

// ============================================
// TEAM MODEL TESTS
// ============================================

test('team generates a unique slug on creation', function () {
    $team = Team::create(['name' => 'Engineering Team', 'status' => 'active']);

    expect($team->slug)->toBe('engineering-team');
});

test('team generates unique slug with suffix on collision', function () {
    Team::create(['name' => 'Backend Team', 'status' => 'active']);
    $team2 = Team::create(['name' => 'Backend Team', 'status' => 'active']);

    expect($team2->slug)->toBe('backend-team-2');
});

test('team slug updates when name changes', function () {
    $team = Team::create(['name' => 'Old Name', 'status' => 'active']);
    expect($team->slug)->toBe('old-name');

    $team->update(['name' => 'New Name']);
    expect($team->fresh()->slug)->toBe('new-name');
});

test('team slug does not change if name is not dirty', function () {
    $team = Team::create(['name' => 'My Team', 'status' => 'active']);
    $originalSlug = $team->slug;

    $team->update(['description' => 'Updated description']);
    expect($team->fresh()->slug)->toBe($originalSlug);
});

test('team has leader relationship', function () {
    $leader = User::factory()->create();
    $team = Team::create(['name' => 'Team A', 'status' => 'active', 'leader_id' => $leader->id]);

    expect($team->leader->id)->toBe($leader->id);
});

test('team has sub-leader relationship', function () {
    $subLeader = User::factory()->create();
    $team = Team::create(['name' => 'Team B', 'status' => 'active', 'sub_leader_id' => $subLeader->id]);

    expect($team->subLeader->id)->toBe($subLeader->id);
});

test('team has members relationship with pivot data', function () {
    $team = Team::create(['name' => 'Team C', 'status' => 'active']);
    $user = User::factory()->create();

    $team->members()->attach($user->id, ['is_primary' => true, 'role_in_team' => 'member']);

    $member = $team->members()->first();
    expect($member->id)->toBe($user->id);
    expect((bool) $member->pivot->is_primary)->toBeTrue();
    expect($member->pivot->role_in_team)->toBe('member');
});

test('active scope filters by active status', function () {
    Team::create(['name' => 'Active Team', 'status' => 'active']);
    Team::create(['name' => 'Inactive Team', 'status' => 'inactive']);
    Team::create(['name' => 'Archived Team', 'status' => 'archived']);

    expect(Team::active()->count())->toBe(1);
    expect(Team::active()->first()->name)->toBe('Active Team');
});

test('leader_id is set to null when leader user is deleted', function () {
    $leader = User::factory()->create();
    $team = Team::create(['name' => 'Orphan Team', 'status' => 'active', 'leader_id' => $leader->id]);

    $leader->delete();

    expect($team->fresh()->leader_id)->toBeNull();
});

test('sub_leader_id is set to null when sub-leader user is deleted', function () {
    $subLeader = User::factory()->create();
    $team = Team::create(['name' => 'Orphan Team 2', 'status' => 'active', 'sub_leader_id' => $subLeader->id]);

    $subLeader->delete();

    expect($team->fresh()->sub_leader_id)->toBeNull();
});

test('team persists when leader is deleted', function () {
    $leader = User::factory()->create();
    $team = Team::create(['name' => 'Persistent Team', 'status' => 'active', 'leader_id' => $leader->id]);

    $leader->delete();

    expect(Team::find($team->id))->not->toBeNull();
    expect($team->fresh()->name)->toBe('Persistent Team');
});

// ============================================
// USER MODEL TEAM RELATIONSHIPS
// ============================================

test('user teams() returns teams through pivot', function () {
    $user = User::factory()->create();
    $team = Team::create(['name' => 'User Team', 'status' => 'active']);

    $team->members()->attach($user->id, ['is_primary' => true, 'role_in_team' => 'member']);

    expect($user->teams()->count())->toBe(1);
    expect($user->teams()->first()->name)->toBe('User Team');
});

test('user ledTeams() returns teams where user is leader', function () {
    $user = User::factory()->create();
    Team::create(['name' => 'Led Team', 'status' => 'active', 'leader_id' => $user->id]);
    Team::create(['name' => 'Other Team', 'status' => 'active']);

    expect($user->ledTeams()->count())->toBe(1);
    expect($user->ledTeams()->first()->name)->toBe('Led Team');
});

test('user subLedTeams() returns teams where user is sub-leader', function () {
    $user = User::factory()->create();
    Team::create(['name' => 'Sub-Led Team', 'status' => 'active', 'sub_leader_id' => $user->id]);

    expect($user->subLedTeams()->count())->toBe(1);
});

test('user primaryTeam() returns the team marked as primary', function () {
    $user = User::factory()->create();
    $team1 = Team::create(['name' => 'Primary Team', 'status' => 'active']);
    $team2 = Team::create(['name' => 'Secondary Team', 'status' => 'active']);

    $team1->members()->attach($user->id, ['is_primary' => true, 'role_in_team' => 'member']);
    $team2->members()->attach($user->id, ['is_primary' => false, 'role_in_team' => 'member']);

    expect($user->primaryTeam()->id)->toBe($team1->id);
});

test('user primaryTeam() returns null when user has no teams', function () {
    $user = User::factory()->create();

    expect($user->primaryTeam())->toBeNull();
});

test('user can belong to multiple teams', function () {
    $user = User::factory()->create();
    $team1 = Team::create(['name' => 'Team Alpha', 'status' => 'active']);
    $team2 = Team::create(['name' => 'Team Beta', 'status' => 'active']);
    $team3 = Team::create(['name' => 'Team Gamma', 'status' => 'active']);

    $team1->members()->attach($user->id, ['is_primary' => true, 'role_in_team' => 'member']);
    $team2->members()->attach($user->id, ['is_primary' => false, 'role_in_team' => 'member']);
    $team3->members()->attach($user->id, ['is_primary' => false, 'role_in_team' => 'lead']);

    expect($user->teams()->count())->toBe(3);
});

// ============================================
// TEAM FACTORY
// ============================================

test('team factory creates a valid team', function () {
    $team = Team::factory()->create();

    expect($team->name)->not->toBeEmpty();
    expect($team->status)->toBe('active');
    expect($team->slug)->not->toBeEmpty();
});

test('team factory inactive state works', function () {
    $team = Team::factory()->inactive()->create();
    expect($team->status)->toBe('inactive');
});

test('team factory archived state works', function () {
    $team = Team::factory()->archived()->create();
    expect($team->status)->toBe('archived');
});

// ============================================
// PERMISSION / AUTHORIZATION TESTS
// ============================================

test('user without teams.view permission cannot access team index', function () {
    $user = createUserWithPermissions([]);

    $this->actingAs($user)
        ->get(route('teams.index'))
        ->assertForbidden();
});

test('user with teams.view permission can access team index', function () {
    $user = createUserWithPermissions(['teams.view']);

    $this->actingAs($user)
        ->get(route('teams.index'))
        ->assertOk();
});

test('user without teams.create permission cannot access create form', function () {
    $user = createUserWithPermissions(['teams.view']);

    $this->actingAs($user)
        ->get(route('teams.create'))
        ->assertForbidden();
});

test('user with teams.create permission can access create form', function () {
    $user = createUserWithPermissions(['teams.view', 'teams.create']);

    $this->actingAs($user)
        ->get(route('teams.create'))
        ->assertOk();
});

test('user without teams.create permission cannot store a team', function () {
    $user = createUserWithPermissions(['teams.view']);

    $this->actingAs($user)
        ->post(route('teams.store'), ['name' => 'Test', 'status' => 'active'])
        ->assertForbidden();
});

test('user without teams.edit permission cannot access edit form', function () {
    $user = createUserWithPermissions(['teams.view']);
    $team = Team::create(['name' => 'Edit Test', 'status' => 'active']);

    $this->actingAs($user)
        ->get(route('teams.edit', $team))
        ->assertForbidden();
});

test('user with teams.edit permission can access edit form', function () {
    $user = createUserWithPermissions(['teams.view', 'teams.edit']);
    $team = Team::create(['name' => 'Edit Test', 'status' => 'active']);

    $this->actingAs($user)
        ->get(route('teams.edit', $team))
        ->assertOk();
});

test('user without teams.edit permission cannot update a team', function () {
    $user = createUserWithPermissions(['teams.view']);
    $team = Team::create(['name' => 'No Edit', 'status' => 'active']);

    $this->actingAs($user)
        ->put(route('teams.update', $team), ['name' => 'Hacked', 'status' => 'active'])
        ->assertForbidden();
});

test('user without teams.delete permission cannot delete a team', function () {
    $user = createUserWithPermissions(['teams.view', 'teams.edit']);
    $team = Team::create(['name' => 'No Delete', 'status' => 'active']);

    $this->actingAs($user)
        ->delete(route('teams.destroy', $team))
        ->assertForbidden();
});

test('user with teams.delete permission can delete a team', function () {
    $user = createUserWithPermissions(['teams.view', 'teams.delete']);
    $team = Team::create(['name' => 'Deletable', 'status' => 'active']);

    $this->actingAs($user)
        ->delete(route('teams.destroy', $team))
        ->assertRedirect(route('teams.index'));

    expect(Team::find($team->id))->toBeNull();
});

test('user without teams.view permission cannot access team show page', function () {
    $user = createUserWithPermissions([]);
    $team = Team::create(['name' => 'Hidden Team', 'status' => 'active']);

    $this->actingAs($user)
        ->get(route('teams.show', $team))
        ->assertForbidden();
});

test('user with teams.view permission can access team show page', function () {
    $user = createUserWithPermissions(['teams.view']);
    $team = Team::create(['name' => 'Visible Team', 'status' => 'active']);

    $this->actingAs($user)
        ->get(route('teams.show', $team))
        ->assertOk();
});

test('unauthenticated user cannot access team routes', function () {
    $team = Team::create(['name' => 'Auth Test', 'status' => 'active']);

    $this->get(route('teams.index'))->assertRedirect(route('login'));
    $this->get(route('teams.create'))->assertRedirect(route('login'));
    $this->post(route('teams.store'))->assertRedirect(route('login'));
    $this->get(route('teams.show', $team))->assertRedirect(route('login'));
    $this->get(route('teams.edit', $team))->assertRedirect(route('login'));
    $this->put(route('teams.update', $team))->assertRedirect(route('login'));
    $this->delete(route('teams.destroy', $team))->assertRedirect(route('login'));
});

// ============================================
// TEAM CRUD TESTS
// ============================================

test('can create a team with minimal data', function () {
    $user = createUserWithPermissions(['teams.view', 'teams.create']);

    $this->actingAs($user)
        ->post(route('teams.store'), [
            'name' => 'Minimal Team',
            'status' => 'active',
        ])
        ->assertRedirect(route('teams.index'))
        ->assertSessionHas('success');

    $team = Team::where('name', 'Minimal Team')->first();
    expect($team)->not->toBeNull();
    expect($team->slug)->toBe('minimal-team');
    expect($team->leader_id)->toBeNull();
    expect($team->sub_leader_id)->toBeNull();
});

test('can create a team with leader and sub-leader', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.create']);
    $leader = User::factory()->create(['employment_status' => 'active']);
    $subLeader = User::factory()->create(['employment_status' => 'active']);

    $this->actingAs($admin)
        ->post(route('teams.store'), [
            'name' => 'Full Team',
            'description' => 'A complete team',
            'leader_id' => $leader->id,
            'sub_leader_id' => $subLeader->id,
            'status' => 'active',
            'members' => [],
        ])
        ->assertRedirect(route('teams.index'));

    $team = Team::where('name', 'Full Team')->first();
    expect($team->leader_id)->toBe($leader->id);
    expect($team->sub_leader_id)->toBe($subLeader->id);
    expect($team->description)->toBe('A complete team');
});

test('leader and sub-leader are auto-added as members', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.create']);
    $leader = User::factory()->create(['employment_status' => 'active']);
    $subLeader = User::factory()->create(['employment_status' => 'active']);

    $this->actingAs($admin)
        ->post(route('teams.store'), [
            'name' => 'Auto-Add Team',
            'leader_id' => $leader->id,
            'sub_leader_id' => $subLeader->id,
            'status' => 'active',
            'members' => [],
        ]);

    $team = Team::where('name', 'Auto-Add Team')->first();
    $memberIds = $team->members()->pluck('users.id')->toArray();

    expect($memberIds)->toContain($leader->id);
    expect($memberIds)->toContain($subLeader->id);
});

test('leader gets role_in_team set to lead', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.create']);
    $leader = User::factory()->create(['employment_status' => 'active']);

    $this->actingAs($admin)
        ->post(route('teams.store'), [
            'name' => 'Role Test Team',
            'leader_id' => $leader->id,
            'status' => 'active',
            'members' => [],
        ]);

    $team = Team::where('name', 'Role Test Team')->first();
    $leaderPivot = $team->members()->where('users.id', $leader->id)->first()->pivot;

    expect($leaderPivot->role_in_team)->toBe('lead');
});

test('sub-leader gets role_in_team set to sub-lead', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.create']);
    $subLeader = User::factory()->create(['employment_status' => 'active']);

    $this->actingAs($admin)
        ->post(route('teams.store'), [
            'name' => 'Sub Role Team',
            'sub_leader_id' => $subLeader->id,
            'status' => 'active',
            'members' => [],
        ]);

    $team = Team::where('name', 'Sub Role Team')->first();
    $subPivot = $team->members()->where('users.id', $subLeader->id)->first()->pivot;

    expect($subPivot->role_in_team)->toBe('sub-lead');
});

test('regular member gets role_in_team set to member', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.create']);
    $member = User::factory()->create(['employment_status' => 'active']);

    $this->actingAs($admin)
        ->post(route('teams.store'), [
            'name' => 'Member Role Team',
            'status' => 'active',
            'members' => [$member->id],
        ]);

    $team = Team::where('name', 'Member Role Team')->first();
    $memberPivot = $team->members()->where('users.id', $member->id)->first()->pivot;

    expect($memberPivot->role_in_team)->toBe('member');
});

test('first team for a user is auto-set as primary', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.create']);
    $member = User::factory()->create(['employment_status' => 'active']);

    // User has no teams yet
    expect($member->teams()->count())->toBe(0);

    $this->actingAs($admin)
        ->post(route('teams.store'), [
            'name' => 'First Team',
            'status' => 'active',
            'members' => [$member->id],
        ]);

    $team = Team::where('name', 'First Team')->first();
    $pivot = $team->members()->where('users.id', $member->id)->first()->pivot;

    expect((bool) $pivot->is_primary)->toBeTrue();
});

test('second team for a user is not auto-set as primary', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.create']);
    $member = User::factory()->create(['employment_status' => 'active']);

    // Create first team (auto-primary)
    $this->actingAs($admin)
        ->post(route('teams.store'), [
            'name' => 'First Team Ever',
            'status' => 'active',
            'members' => [$member->id],
        ]);

    // Create second team
    $this->actingAs($admin)
        ->post(route('teams.store'), [
            'name' => 'Second Team Ever',
            'status' => 'active',
            'members' => [$member->id],
        ]);

    $team2 = Team::where('name', 'Second Team Ever')->first();
    $pivot = $team2->members()->where('users.id', $member->id)->first()->pivot;

    expect((bool) $pivot->is_primary)->toBeFalse();
});

test('can update a team', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.edit']);
    $team = Team::create(['name' => 'Original Name', 'status' => 'active']);

    $this->actingAs($admin)
        ->put(route('teams.update', $team), [
            'name' => 'Updated Name',
            'description' => 'New description',
            'status' => 'inactive',
        ])
        ->assertRedirect(route('teams.show', $team));

    $team->refresh();
    expect($team->name)->toBe('Updated Name');
    expect($team->description)->toBe('New description');
    expect($team->status)->toBe('inactive');
});

test('deleting a team removes member associations', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.delete']);
    $member = User::factory()->create(['employment_status' => 'active']);

    $team = Team::create(['name' => 'Doomed Team', 'status' => 'active']);
    $team->members()->attach($member->id, ['is_primary' => true, 'role_in_team' => 'member']);

    $this->actingAs($admin)
        ->delete(route('teams.destroy', $team));

    expect(Team::find($team->id))->toBeNull();
    expect(\DB::table('team_user')->where('team_id', $team->id)->count())->toBe(0);
    // User still exists
    expect(User::find($member->id))->not->toBeNull();
});

test('updating a team preserves existing is_primary values', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.create', 'teams.edit']);
    $member = User::factory()->create(['employment_status' => 'active']);

    // Create first team — member becomes primary
    $this->actingAs($admin)
        ->post(route('teams.store'), [
            'name' => 'Preserve Primary Team',
            'status' => 'active',
            'members' => [$member->id],
        ]);

    $team = Team::where('name', 'Preserve Primary Team')->first();
    $pivot = $team->members()->where('users.id', $member->id)->first()->pivot;
    expect((bool) $pivot->is_primary)->toBeTrue();

    // Update team (re-sync members)
    $newMember = User::factory()->create(['employment_status' => 'active']);

    $this->actingAs($admin)
        ->put(route('teams.update', $team), [
            'name' => 'Preserve Primary Team',
            'status' => 'active',
            'members' => [$member->id, $newMember->id],
        ]);

    // Original member should still be primary
    $pivotAfter = $team->members()->where('users.id', $member->id)->first()->pivot;
    expect((bool) $pivotAfter->is_primary)->toBeTrue();
});

// ============================================
// VALIDATION TESTS
// ============================================

test('team name is required', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.create']);

    $this->actingAs($admin)
        ->post(route('teams.store'), [
            'name' => '',
            'status' => 'active',
        ])
        ->assertSessionHasErrors('name');
});

test('team name max length is 255', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.create']);

    $this->actingAs($admin)
        ->post(route('teams.store'), [
            'name' => str_repeat('a', 256),
            'status' => 'active',
        ])
        ->assertSessionHasErrors('name');
});

test('team status is required', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.create']);

    $this->actingAs($admin)
        ->post(route('teams.store'), [
            'name' => 'No Status Team',
        ])
        ->assertSessionHasErrors('status');
});

test('team status must be valid enum', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.create']);

    $this->actingAs($admin)
        ->post(route('teams.store'), [
            'name' => 'Bad Status Team',
            'status' => 'invalid_status',
        ])
        ->assertSessionHasErrors('status');
});

test('leader_id must exist in users table', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.create']);

    $this->actingAs($admin)
        ->post(route('teams.store'), [
            'name' => 'Ghost Leader',
            'status' => 'active',
            'leader_id' => 99999,
        ])
        ->assertSessionHasErrors('leader_id');
});

test('sub_leader_id must be different from leader_id', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.create']);
    $user = User::factory()->create();

    $this->actingAs($admin)
        ->post(route('teams.store'), [
            'name' => 'Same Leader Team',
            'status' => 'active',
            'leader_id' => $user->id,
            'sub_leader_id' => $user->id,
        ])
        ->assertSessionHasErrors('sub_leader_id');
});

test('description max length is 1000', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.create']);

    $this->actingAs($admin)
        ->post(route('teams.store'), [
            'name' => 'Long Desc Team',
            'status' => 'active',
            'description' => str_repeat('a', 1001),
        ])
        ->assertSessionHasErrors('description');
});

test('members must exist in users table', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.create']);

    $this->actingAs($admin)
        ->post(route('teams.store'), [
            'name' => 'Ghost Members Team',
            'status' => 'active',
            'members' => [99999],
        ])
        ->assertSessionHasErrors('members.0');
});

// ============================================
// SEARCH & FILTER TESTS
// ============================================

test('team index can search by team name', function () {
    $user = createUserWithPermissions(['teams.view']);
    Team::create(['name' => 'Alpha Squad', 'status' => 'active']);
    Team::create(['name' => 'Beta Squad', 'status' => 'active']);

    $response = $this->actingAs($user)
        ->get(route('teams.index', ['search' => 'Alpha']));

    $response->assertOk();
    $teams = $response->original->getData()['page']['props']['teams']['data'];
    expect(count($teams))->toBe(1);
    expect($teams[0]['name'])->toBe('Alpha Squad');
});

test('team index can filter by status', function () {
    $user = createUserWithPermissions(['teams.view']);
    Team::create(['name' => 'Active One', 'status' => 'active']);
    Team::create(['name' => 'Inactive One', 'status' => 'inactive']);
    Team::create(['name' => 'Archived One', 'status' => 'archived']);

    $response = $this->actingAs($user)
        ->get(route('teams.index', ['status' => 'inactive']));

    $response->assertOk();
    $teams = $response->original->getData()['page']['props']['teams']['data'];
    expect(count($teams))->toBe(1);
    expect($teams[0]['name'])->toBe('Inactive One');
});

test('team index can search by leader name', function () {
    $user = createUserWithPermissions(['teams.view']);
    $leader = User::factory()->create(['name' => 'John Leader']);

    Team::create(['name' => 'Johns Team', 'status' => 'active', 'leader_id' => $leader->id]);
    Team::create(['name' => 'Other Team', 'status' => 'active']);

    $response = $this->actingAs($user)
        ->get(route('teams.index', ['search' => 'John Leader']));

    $response->assertOk();
    $teams = $response->original->getData()['page']['props']['teams']['data'];
    expect(count($teams))->toBe(1);
    expect($teams[0]['name'])->toBe('Johns Team');
});

test('team index with status=all returns all teams', function () {
    $user = createUserWithPermissions(['teams.view']);
    Team::create(['name' => 'All Active', 'status' => 'active']);
    Team::create(['name' => 'All Inactive', 'status' => 'inactive']);

    $response = $this->actingAs($user)
        ->get(route('teams.index', ['status' => 'all']));

    $response->assertOk();
    $teams = $response->original->getData()['page']['props']['teams']['data'];
    expect(count($teams))->toBeGreaterThanOrEqual(2);
});

// ============================================
// LEAVE AUTO-PREFILL INTEGRATION TESTS
// ============================================

test('leave apply page returns defaultApproverId from primary team leader', function () {
    createPermissions();

    $leader = User::factory()->create(['employment_status' => 'active']);
    $leaderRole = Role::create(['name' => 'Approver Role', 'slug' => 'lead-engineer-'.uniqid()]);
    $leader->roles()->attach($leaderRole);

    $member = User::factory()->create(['employment_status' => 'active']);
    $memberRole = Role::create(['name' => 'Member Role', 'slug' => 'junior-engineer-'.uniqid()]);
    $member->roles()->attach($memberRole);

    $team = Team::create(['name' => 'Leave Test Team', 'status' => 'active', 'leader_id' => $leader->id]);
    $team->members()->attach($member->id, ['is_primary' => true, 'role_in_team' => 'member']);
    $team->members()->attach($leader->id, ['is_primary' => false, 'role_in_team' => 'lead']);

    $response = $this->actingAs($member)
        ->get(route('my-leaves.apply'));

    $response->assertOk();
    $props = $response->original->getData()['page']['props'];
    expect($props['defaultApproverId'])->toBe($leader->id);
});

test('leave apply page returns null defaultApproverId when user has no team', function () {
    $user = User::factory()->create(['employment_status' => 'active']);

    $response = $this->actingAs($user)
        ->get(route('my-leaves.apply'));

    $response->assertOk();
    $props = $response->original->getData()['page']['props'];
    expect($props['defaultApproverId'])->toBeNull();
});

test('leave apply page returns null defaultApproverId when team has no leader', function () {
    $member = User::factory()->create(['employment_status' => 'active']);
    $team = Team::create(['name' => 'Leaderless Team', 'status' => 'active', 'leader_id' => null]);
    $team->members()->attach($member->id, ['is_primary' => true, 'role_in_team' => 'member']);

    $response = $this->actingAs($member)
        ->get(route('my-leaves.apply'));

    $response->assertOk();
    $props = $response->original->getData()['page']['props'];
    expect($props['defaultApproverId'])->toBeNull();
});

test('leave apply page returns null defaultApproverId when user is the team leader', function () {
    $leader = User::factory()->create(['employment_status' => 'active']);
    $team = Team::create(['name' => 'Self Leader Team', 'status' => 'active', 'leader_id' => $leader->id]);
    $team->members()->attach($leader->id, ['is_primary' => true, 'role_in_team' => 'lead']);

    $response = $this->actingAs($leader)
        ->get(route('my-leaves.apply'));

    $response->assertOk();
    $props = $response->original->getData()['page']['props'];
    expect($props['defaultApproverId'])->toBeNull();
});

test('leave auto-prefill uses primary team not secondary team', function () {
    $leader1 = User::factory()->create(['employment_status' => 'active', 'name' => 'Leader One']);
    $leader2 = User::factory()->create(['employment_status' => 'active', 'name' => 'Leader Two']);
    $member = User::factory()->create(['employment_status' => 'active']);

    $team1 = Team::create(['name' => 'Primary', 'status' => 'active', 'leader_id' => $leader1->id]);
    $team2 = Team::create(['name' => 'Secondary', 'status' => 'active', 'leader_id' => $leader2->id]);

    $team1->members()->attach($member->id, ['is_primary' => true, 'role_in_team' => 'member']);
    $team2->members()->attach($member->id, ['is_primary' => false, 'role_in_team' => 'member']);

    $response = $this->actingAs($member)
        ->get(route('my-leaves.apply'));

    $props = $response->original->getData()['page']['props'];
    expect($props['defaultApproverId'])->toBe($leader1->id);
});

// ============================================
// EDGE CASE TESTS
// ============================================

test('unique constraint prevents duplicate team_user entries', function () {
    $team = Team::create(['name' => 'Unique Pivot Team', 'status' => 'active']);
    $user = User::factory()->create();

    $team->members()->attach($user->id, ['is_primary' => true, 'role_in_team' => 'member']);

    // Second attach should fail due to unique constraint
    expect(fn () => $team->members()->attach($user->id, ['is_primary' => false, 'role_in_team' => 'member']))
        ->toThrow(\Illuminate\Database\QueryException::class);
});

test('team with no members has members_count of zero', function () {
    $user = createUserWithPermissions(['teams.view']);
    Team::create(['name' => 'Empty Team', 'status' => 'active']);

    $response = $this->actingAs($user)
        ->get(route('teams.index'));

    $teams = $response->original->getData()['page']['props']['teams']['data'];
    $emptyTeam = collect($teams)->firstWhere('name', 'Empty Team');
    expect($emptyTeam['members_count'])->toBe(0);
});

test('team show page loads leader sub-leader and members', function () {
    $user = createUserWithPermissions(['teams.view']);
    $leader = User::factory()->create(['employment_status' => 'active']);
    $subLeader = User::factory()->create(['employment_status' => 'active']);
    $member = User::factory()->create(['employment_status' => 'active']);

    $team = Team::create([
        'name' => 'Full Show Team',
        'status' => 'active',
        'leader_id' => $leader->id,
        'sub_leader_id' => $subLeader->id,
    ]);
    $team->members()->attach($leader->id, ['role_in_team' => 'lead', 'is_primary' => false]);
    $team->members()->attach($subLeader->id, ['role_in_team' => 'sub-lead', 'is_primary' => false]);
    $team->members()->attach($member->id, ['role_in_team' => 'member', 'is_primary' => true]);

    $response = $this->actingAs($user)
        ->get(route('teams.show', $team));

    $response->assertOk();
    $teamData = $response->original->getData()['page']['props']['team'];
    expect($teamData['leader']['id'])->toBe($leader->id);
    expect($teamData['sub_leader']['id'])->toBe($subLeader->id);
    expect(count($teamData['members']))->toBe(3);
});

test('can create team with nullable leader and sub-leader', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.create']);

    $this->actingAs($admin)
        ->post(route('teams.store'), [
            'name' => 'Headless Team',
            'status' => 'active',
            'leader_id' => null,
            'sub_leader_id' => null,
        ])
        ->assertRedirect(route('teams.index'));

    $team = Team::where('name', 'Headless Team')->first();
    expect($team->leader_id)->toBeNull();
    expect($team->sub_leader_id)->toBeNull();
});

test('updating team leader updates member role_in_team', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.create', 'teams.edit']);
    $oldLeader = User::factory()->create(['employment_status' => 'active']);
    $newLeader = User::factory()->create(['employment_status' => 'active']);

    $this->actingAs($admin)
        ->post(route('teams.store'), [
            'name' => 'Swap Leader Team',
            'leader_id' => $oldLeader->id,
            'status' => 'active',
            'members' => [],
        ]);

    $team = Team::where('name', 'Swap Leader Team')->first();

    // Update leader
    $this->actingAs($admin)
        ->put(route('teams.update', $team), [
            'name' => 'Swap Leader Team',
            'leader_id' => $newLeader->id,
            'status' => 'active',
            'members' => [$oldLeader->id],
        ]);

    $team->refresh();
    expect($team->leader_id)->toBe($newLeader->id);

    $newLeaderPivot = $team->members()->where('users.id', $newLeader->id)->first()->pivot;
    expect($newLeaderPivot->role_in_team)->toBe('lead');

    $oldLeaderPivot = $team->members()->where('users.id', $oldLeader->id)->first()->pivot;
    expect($oldLeaderPivot->role_in_team)->toBe('member');
});

test('team members are removed from pivot on team deletion via cascade', function () {
    $admin = createUserWithPermissions(['teams.view', 'teams.delete']);
    $member1 = User::factory()->create(['employment_status' => 'active']);
    $member2 = User::factory()->create(['employment_status' => 'active']);

    $team = Team::create(['name' => 'Cascade Test', 'status' => 'active']);
    $team->members()->attach($member1->id, ['is_primary' => true, 'role_in_team' => 'member']);
    $team->members()->attach($member2->id, ['is_primary' => false, 'role_in_team' => 'member']);

    expect(\DB::table('team_user')->where('team_id', $team->id)->count())->toBe(2);

    $this->actingAs($admin)->delete(route('teams.destroy', $team));

    expect(\DB::table('team_user')->where('team_id', $team->id)->count())->toBe(0);
});
