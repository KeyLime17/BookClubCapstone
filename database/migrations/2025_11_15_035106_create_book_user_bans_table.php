<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('book_user_bans', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade');

            $table->foreignId('book_id')
                ->constrained('books')
                ->onDelete('cascade');

            // null = permanent ban for that book; otherwise temp until this date/time
            $table->timestamp('banned_until')->nullable();

            $table->timestamps();

            $table->unique(['user_id', 'book_id']); // one ban per user/book
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('book_user_bans');
    }
};
