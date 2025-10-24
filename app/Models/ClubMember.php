<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;

class ClubMember extends Pivot
{
    protected $table = 'club_members';
    protected $fillable = ['club_id','user_id','role','joined_at'];
    protected $casts = ['joined_at' => 'datetime'];

    public function club() { return $this->belongsTo(Club::class); }
    public function user() { return $this->belongsTo(User::class); }
}

