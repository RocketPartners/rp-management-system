<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leave_types', function (Blueprint $table) {
            // JSON array of role slugs that can approve this leave type
            // Example: ["super-admin", "admin", "hr-manager"]
            $table->json('can_approve_roles')->nullable()->after('requires_hr_approval');

            // Allow specific roles to bypass manager approval and go straight to HR
            $table->boolean('skip_manager_for_roles')->default(false)->after('can_approve_roles');
        });
    }

    public function down(): void
    {
        Schema::table('leave_types', function (Blueprint $table) {
            $table->dropColumn(['can_approve_roles', 'skip_manager_for_roles']);
        });
    }
};
