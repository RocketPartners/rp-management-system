<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Contact Information
            $table->string('phone_number')->nullable()->after('suffix');
            $table->string('work_email')->nullable()->after('phone_number');
            $table->string('personal_email')->nullable()->after('work_email');

            // Personal Information
            $table->enum('gender', ['male', 'female', 'other', 'prefer_not_to_say'])->nullable()->after('personal_email');
            $table->date('birthday')->nullable()->after('gender');

            // Address
            $table->text('address_line_1')->nullable()->after('birthday');
            $table->text('address_line_2')->nullable()->after('address_line_1');
            $table->string('city')->nullable()->after('address_line_2');
            $table->string('state')->nullable()->after('city');
            $table->string('postal_code')->nullable()->after('state');
            $table->string('country')->default('Philippines')->after('postal_code');

            // Emergency Contact
            $table->string('emergency_contact_name')->nullable()->after('country');
            $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_name');
            $table->string('emergency_contact_relationship')->nullable()->after('emergency_contact_phone');

            // Employment Information
            $table->string('employee_id')->unique()->nullable()->after('emergency_contact_relationship');
            $table->string('department')->nullable()->after('employee_id');
            $table->string('position')->nullable()->after('department');
            $table->date('hire_date')->nullable()->after('position');
            $table->enum('employment_status', ['active', 'on_leave', 'terminated', 'resigned'])->default('active')->after('hire_date');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone_number',
                'work_email',
                'personal_email',
                'gender',
                'birthday',
                'address_line_1',
                'address_line_2',
                'city',
                'state',
                'postal_code',
                'country',
                'emergency_contact_name',
                'emergency_contact_phone',
                'emergency_contact_relationship',
                'employee_id',
                'department',
                'position',
                'hire_date',
                'employment_status',
            ]);
        });
    }
};
