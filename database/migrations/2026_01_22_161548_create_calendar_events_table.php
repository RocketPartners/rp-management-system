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
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();

            // Basic event info
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('event_type', ['leave', 'announcement', 'holiday', 'birthday', 'event', 'other'])
                ->default('other');

            // Date and time
            $table->date('start_date');
            $table->date('end_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->boolean('all_day')->default(true);

            // Styling
            $table->string('color')->nullable(); // Override default color

            // Polymorphic relation to source (LeaveRequest, Announcement, etc.)
            $table->string('eventable_type')->nullable();
            $table->unsignedBigInteger('eventable_id')->nullable();
            $table->index(['eventable_type', 'eventable_id']);

            // Users and visibility
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('visibility', ['public', 'department', 'team', 'private'])->default('public');
            $table->string('department')->nullable(); // Store department string since no Department model exists

            // Additional data
            $table->json('metadata')->nullable();

            // Recurring events (future feature)
            $table->boolean('is_recurring')->default(false);
            $table->string('recurrence_rule')->nullable();

            // Timestamps and soft deletes
            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index('event_type');
            $table->index(['start_date', 'end_date']);
            $table->index('user_id');
            $table->index('visibility');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calendar_events');
    }
};
