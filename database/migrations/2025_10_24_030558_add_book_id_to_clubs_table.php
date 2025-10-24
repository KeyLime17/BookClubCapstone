<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('clubs', function (Blueprint $table) {
            if (!Schema::hasColumn('clubs', 'book_id')) {
                $table->foreignId('book_id')->nullable()
                      ->constrained('books')
                      ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('clubs', function (Blueprint $table) {
            if (Schema::hasColumn('clubs', 'book_id')) {
                $table->dropConstrainedForeignId('book_id');
            }
        });
    }
};

