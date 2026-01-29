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
        Schema::create('assets', function (Blueprint $table) {
            $table->id();

            // Link to the product/item (your current inventory_items table)
            $table->foreignId('inventory_item_id')
                ->constrained('inventory_items')
                ->onDelete('cascade');

            // Unique identifiers for THIS SPECIFIC physical asset
            $table->string('asset_tag')->unique();  // e.g., "LAPTOP-001"
            $table->string('serial_number')->unique()->nullable();  // Manufacturer serial
            $table->string('barcode')->nullable();

            // Purchase information (specific to this unit)
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->date('warranty_expiry')->nullable();

            // Current state of THIS asset
            $table->enum('condition', ['New', 'Good', 'Fair', 'Poor', 'Damaged'])
                ->default('Good');
            $table->enum('status', ['Available', 'Assigned', 'In Repair', 'Retired', 'Lost'])
                ->default('Available');

            // Location and notes for THIS asset
            $table->string('location')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
