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
        // ============================================
        // 1. CREATE PERMISSIONS TABLE
        // ============================================
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Approve Users"
            $table->string('slug')->unique(); // e.g., "approve-users"
            $table->text('description')->nullable();
            $table->string('category')->default('general'); // Group permissions: user, leave, inventory, etc.
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ============================================
        // 2. PERMISSION - ROLE PIVOT (Role has these permissions)
        // ============================================
        Schema::create('permission_role', function (Blueprint $table) {
            $table->id();
            $table->foreignId('permission_id')->constrained()->onDelete('cascade');
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            // Prevent duplicate assignments
            $table->unique(['permission_id', 'role_id']);
        });

        // ============================================
        // 3. PERMISSION - USER PIVOT (User overrides)
        // ============================================
        Schema::create('permission_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('permission_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->boolean('granted')->default(true); // true = grant, false = revoke
            $table->string('granted_by')->nullable(); // Who gave/revoked this permission
            $table->timestamp('granted_at')->nullable();
            $table->text('reason')->nullable(); // Why was this permission granted/revoked
            $table->timestamps();

            // Prevent duplicate assignments
            $table->unique(['permission_id', 'user_id']);
        });

        // ============================================
        // 4. ADD INDEXES FOR PERFORMANCE
        // ============================================
        Schema::table('permissions', function (Blueprint $table) {
            $table->index('slug');
            $table->index('category');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permission_user');
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('permissions');
    }
};
