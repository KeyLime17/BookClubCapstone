<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('book_submissions', function (Blueprint $table) {
            $table->id();

            // user who submitted the book
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->string('title');
            $table->string('author');
            $table->string('image_path')->nullable();   // stored file path
            $table->string('link')->nullable();         // optional store/library URL

            // optional: admin can later fill in details before approving
            $table->text('description')->nullable();
            $table->date('release_date')->nullable();

            // pending / approved / rejected
            $table->string('status')->default('pending');

            // who reviewed it
            $table->foreignId('reviewer_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('book_submissions');
    }
};
