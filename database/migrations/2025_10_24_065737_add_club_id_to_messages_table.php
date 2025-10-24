<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // Add only if missing (safe to run on your current table)
            if (!Schema::hasColumn('messages', 'club_id')) {
                $table->foreignId('club_id')
                    ->after('id')
                    ->constrained('clubs')
                    ->cascadeOnDelete();
                $table->index(['club_id', 'created_at']);
            }

            if (!Schema::hasColumn('messages', 'user_id')) {
                $table->foreignId('user_id')
                    ->nullable()
                    ->after('club_id')
                    ->constrained('users')
                    ->nullOnDelete(); // null => system messages
            }

            if (!Schema::hasColumn('messages', 'type')) {
                // use enum if you prefer; string is simpler and portable
                $table->enum('type', ['text','system'])->default('text')->after('user_id');
            }

            if (!Schema::hasColumn('messages', 'body')) {
                $table->text('body')->after('type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // Drop in reverse (guard with hasColumn so down() doesn't explode)
            if (Schema::hasColumn('messages', 'body')) {
                $table->dropColumn('body');
            }
            if (Schema::hasColumn('messages', 'type')) {
                $table->dropColumn('type');
            }
            if (Schema::hasColumn('messages', 'user_id')) {
                $table->dropConstrainedForeignId('user_id');
            }
            if (Schema::hasColumn('messages', 'club_id')) {
                // drop index if it exists; ignore if not
                try { $table->dropIndex(['club_id','created_at']); } catch (\Throwable $e) {}
                $table->dropConstrainedForeignId('club_id');
            }
        });
    }
};
