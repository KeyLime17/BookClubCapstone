<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('clubs', function (Blueprint $table) {
            if (!Schema::hasColumn('clubs', 'name')) {
                // nullable for existing rows; we’ll set a value when we create public clubs
                $table->string('name', 255)->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('clubs', function (Blueprint $table) {
            if (Schema::hasColumn('clubs', 'name')) {
                $table->dropColumn('name');
            }
        });
    }
};
