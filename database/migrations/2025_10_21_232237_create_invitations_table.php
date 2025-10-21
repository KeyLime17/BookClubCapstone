<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    class Invitation extends Model
    {
        protected $fillable = ['club_id','inviter_id','invitee_id','email','token','expires_at','accepted_at'];
        protected $casts = ['expires_at'=>'datetime','accepted_at'=>'datetime'];

        public function club()     { return $this->belongsTo(Club::class); }
        public function inviter()  { return $this->belongsTo(User::class, 'inviter_id'); }
        public function invitee()  { return $this->belongsTo(User::class, 'invitee_id'); }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invitations');
    }
};
