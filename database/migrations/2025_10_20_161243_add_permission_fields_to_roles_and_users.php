<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // ✅ Add permission fields to roles table
        Schema::table('roles', function (Blueprint $table) {
            $table->boolean('can_approve_users')->default(false)->after('description');
            $table->boolean('can_approve_leaves')->default(false)->after('can_approve_users');
            $table->boolean('can_manage_inventory')->default(false)->after('can_approve_leaves');
            $table->boolean('can_manage_projects')->default(false)->after('can_manage_inventory');
        });

        // ✅ Also add individual user override field
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('can_approve_users_override')->nullable()->after('account_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn([
                'can_approve_users',
                'can_approve_leaves',
                'can_manage_inventory',
                'can_manage_projects',
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('can_approve_users_override');
        });
    }
};
