<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    class Message extends Model
    {
        protected $fillable = ['club_id','user_id','type','body'];
        protected $casts = ['created_at' => 'datetime'];

        public function club() { return $this->belongsTo(Club::class); }
        public function user() { return $this->belongsTo(User::class); }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
