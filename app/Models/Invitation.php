<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invitation extends Model
{
    protected $fillable = ['club_id','inviter_id','invitee_id','email','token','expires_at','accepted_at'];
    protected $casts = ['expires_at'=>'datetime','accepted_at'=>'datetime'];

    public function club()     { return $this->belongsTo(Club::class); }
    public function inviter()  { return $this->belongsTo(User::class, 'inviter_id'); }
    public function invitee()  { return $this->belongsTo(User::class, 'invitee_id'); }
}

