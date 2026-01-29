<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // First, update any existing 'police_clearance' to 'pnp_clearance'
        DB::table('onboarding_documents')
            ->where('document_type', 'police_clearance')
            ->update(['document_type' => 'pnp_clearance']);

        // Then change column type to VARCHAR
        Schema::table('onboarding_documents', function (Blueprint $table) {
            $table->string('document_type', 100)->change();
        });
    }

    public function down()
    {
        // Optional: revert back
    }
};
