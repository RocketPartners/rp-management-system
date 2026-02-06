<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->integer('hierarchy_level')->default(1)->after('slug')->comment('Higher number = higher authority (1-10 scale). Used for automatic leave approval hierarchy');
        });

        // Set hierarchy levels for existing roles
        // Higher number = more authority
        DB::table('roles')->where('slug', 'super-admin')->update(['hierarchy_level' => 100]);
        DB::table('roles')->where('slug', 'admin')->update(['hierarchy_level' => 90]);
        DB::table('roles')->where('slug', 'hr-manager')->update(['hierarchy_level' => 80]);
        DB::table('roles')->where('slug', 'project-manager')->update(['hierarchy_level' => 70]);
        DB::table('roles')->where('slug', 'lead-engineer')->update(['hierarchy_level' => 60]);

        // Same level roles (Senior, DevOps, QA)
        DB::table('roles')->where('slug', 'senior-engineer')->update(['hierarchy_level' => 50]);
        DB::table('roles')->where('slug', 'devops-engineer')->update(['hierarchy_level' => 50]);
        DB::table('roles')->where('slug', 'qa-tester')->update(['hierarchy_level' => 50]);

        DB::table('roles')->where('slug', 'mid-level-engineer')->update(['hierarchy_level' => 40]);
        DB::table('roles')->where('slug', 'junior-engineer')->update(['hierarchy_level' => 30]);
        DB::table('roles')->where('slug', 'entry-level-engineer')->update(['hierarchy_level' => 20]);
        DB::table('roles')->where('slug', 'employee')->update(['hierarchy_level' => 10]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn('hierarchy_level');
        });
    }
};
