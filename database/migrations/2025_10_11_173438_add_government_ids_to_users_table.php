<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Government IDs
            $table->string('sss_number')->nullable()->after('emergency_contact_relationship'); // XX-XXXXXXX-X
            $table->string('tin_number')->nullable()->after('sss_number'); // XXX-XXX-XXX-XXXXX
            $table->string('hdmf_number')->nullable()->after('tin_number'); // XXXXXXXXXXXX (Pag-IBIG)
            $table->string('philhealth_number')->nullable()->after('hdmf_number'); // XXXX-XXXXX-XX

            // Banking
            $table->string('payroll_account')->nullable()->after('philhealth_number'); // XXXXXXXXXXXX (Union Bank)

            // Employment
            $table->string('employment_type')->nullable()->after('employment_status'); // Full-time, Part-time, Contract, etc.

            // Additional phone (personal mobile)
            $table->string('personal_mobile')->nullable()->after('phone_number');

            // Emergency contact mobile (separate from emergency contact phone)
            $table->string('emergency_contact_mobile')->nullable()->after('emergency_contact_phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'sss_number',
                'tin_number',
                'hdmf_number',
                'philhealth_number',
                'payroll_account',
                'employment_type',
                'personal_mobile',
                'emergency_contact_mobile',
            ]);
        });
    }
};
