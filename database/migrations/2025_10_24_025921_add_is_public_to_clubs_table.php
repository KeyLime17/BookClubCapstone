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
        Schema::table('clubs', function (Illuminate\Database\Schema\Blueprint $table) {
        if (!Schema::hasColumn('clubs', 'is_public')) {
            // no "after('name')" — add it wherever Laravel places it
            $table->boolean('is_public')->default(true);
        }
    });
    }

    public function down(): void
    {
        Schema::table('clubs', function (Illuminate\Database\Schema\Blueprint $table) {
            if (Schema::hasColumn('clubs', 'is_public')) {
                $table->dropColumn('is_public');
            }
        });
    }

};
