<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('conversation_participants', function (Blueprint $table) {
            $table->timestamp('approved_at')->nullable()->after('last_read_at');
            $table->unsignedBigInteger('invited_by')->nullable()->after('approved_at');

            $table->index(['conversation_id', 'approved_at']);
            $table->foreign('invited_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('conversation_participants', function (Blueprint $table) {
            $table->dropForeign(['invited_by']);
            $table->dropIndex(['conversation_id', 'approved_at']);
            $table->dropColumn(['approved_at', 'invited_by']);
        });
    }
};
