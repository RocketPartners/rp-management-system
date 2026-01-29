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
        Schema::table('permission_user', function (Blueprint $table) {
            // Add expires_at for temporary permissions
            $table->timestamp('expires_at')->nullable()->after('reason');

            // Add type enum (nullable initially for data migration)
            $table->enum('type', ['grant', 'revoke'])->nullable()->after('user_id');
        });

        // Migrate existing data: granted=true → type='grant', granted=false → type='revoke'
        DB::table('permission_user')
            ->where('granted', true)
            ->update(['type' => 'grant']);

        DB::table('permission_user')
            ->where('granted', false)
            ->update(['type' => 'revoke']);

        Schema::table('permission_user', function (Blueprint $table) {
            // Drop the old granted column
            $table->dropColumn('granted');

            // Make type non-nullable now that data is migrated
            // Note: SQLite doesn't support changing column to non-nullable directly
            // This will work for MySQL/PostgreSQL
        });

        // For MySQL/PostgreSQL, make type non-nullable
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE permission_user MODIFY type ENUM("grant", "revoke") NOT NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('permission_user', function (Blueprint $table) {
            // Re-add granted column
            $table->boolean('granted')->default(true)->after('user_id');
        });

        // Migrate data back: type='grant' → granted=true, type='revoke' → granted=false
        DB::table('permission_user')
            ->where('type', 'grant')
            ->update(['granted' => true]);

        DB::table('permission_user')
            ->where('type', 'revoke')
            ->update(['granted' => false]);

        Schema::table('permission_user', function (Blueprint $table) {
            // Drop new columns
            $table->dropColumn(['type', 'expires_at']);
        });
    }
};
