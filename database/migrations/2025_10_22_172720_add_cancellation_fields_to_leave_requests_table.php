<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            // Cancellation workflow fields
            $table->text('cancellation_reason')->nullable()->after('appealed_at');
            $table->timestamp('cancellation_requested_at')->nullable()->after('cancellation_reason');
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->onDelete('set null')->after('cancellation_requested_at');
            $table->foreignId('cancellation_approved_by')->nullable()->constrained('users')->onDelete('set null')->after('cancelled_by');
            $table->timestamp('cancellation_approved_at')->nullable()->after('cancellation_approved_by');
            $table->text('cancellation_hr_comments')->nullable()->after('cancellation_approved_at');
        });

        // Update status enum to include 'pending_cancellation' (MySQL only)
        // SQLite doesn't support ENUM and stores it as TEXT anyway
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE leave_requests MODIFY COLUMN status ENUM(
                'pending_manager',
                'pending_hr',
                'approved',
                'rejected_by_manager',
                'rejected_by_hr',
                'appealed',
                'cancelled',
                'pending_cancellation'
            ) DEFAULT 'pending_manager'");
        }
    }

    public function down(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropForeign(['cancelled_by']);
            $table->dropForeign(['cancellation_approved_by']);
            $table->dropColumn([
                'cancellation_reason',
                'cancellation_requested_at',
                'cancelled_by',
                'cancellation_approved_by',
                'cancellation_approved_at',
                'cancellation_hr_comments',
            ]);
        });

        // Restore original enum (MySQL only)
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE leave_requests MODIFY COLUMN status ENUM(
                'pending_manager',
                'pending_hr',
                'approved',
                'rejected_by_manager',
                'rejected_by_hr',
                'appealed',
                'cancelled'
            ) DEFAULT 'pending_manager'");
        }
    }
};
