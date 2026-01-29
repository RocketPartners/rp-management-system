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
        Schema::table('permissions', function (Blueprint $table) {
            // Add group field for new permission system
            $table->string('group')->after('category')->nullable();

            // Copy existing category values to group for backward compatibility
            // After this migration, we'll use 'group' primarily but keep 'category' for legacy code
        });

        // Copy category to group for all existing permissions
        DB::table('permissions')->update([
            'group' => DB::raw('category'),
        ]);

        // Add index for group field
        Schema::table('permissions', function (Blueprint $table) {
            $table->index('group');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropIndex(['group']);
            $table->dropColumn('group');
        });
    }
};
