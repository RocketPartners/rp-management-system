<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('individual_asset_assignments', function (Blueprint $table) {
            $table->id();

            // Link to specific asset (not inventory_item anymore!)
            $table->foreignId('asset_id')
                ->constrained('assets')
                ->onDelete('cascade');

            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->foreignId('assigned_by')
                ->constrained('users')
                ->onDelete('cascade');

            $table->date('assigned_date');
            $table->date('expected_return_date')->nullable();
            $table->date('actual_return_date')->nullable();

            $table->enum('status', ['active', 'returned', 'damaged', 'lost'])
                ->default('active');

            $table->text('assignment_notes')->nullable();
            $table->text('return_notes')->nullable();
            $table->string('condition_on_assignment')->nullable();
            $table->string('condition_on_return')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('individual_asset_assignments');
    }
};
