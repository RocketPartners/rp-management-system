<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('account_status', ['pending', 'active', 'suspended', 'rejected'])
                ->default('pending')
                ->after('employment_status');
            $table->foreignId('approved_by')->nullable()->constrained('users')->after('account_status');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['account_status', 'approved_by', 'approved_at']);
        });
    }
};
