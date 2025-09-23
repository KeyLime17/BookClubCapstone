<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();

            // FK to users and books (cascade so deletes clean up ratings)
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('book_id')->constrained('books')->cascadeOnDelete();

            // 1–5 stars
            $table->unsignedTinyInteger('rating'); // app will validate 1..5

            // Optional text review for later
            $table->text('review')->nullable();

            $table->timestamps();

            // one rating per user per book
            $table->unique(['user_id', 'book_id']);

            // helpful indexes (MySQL can use these for lookups/aggregates)
            $table->index('book_id');
            $table->index('user_id');
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
