<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Club extends Model
{
    protected $fillable = ['owner_id','book_id','name','is_public','cover_image'];
    protected $casts = ['is_public' => 'boolean'];

    public function owner()     { return $this->belongsTo(User::class, 'owner_id'); }
    public function book()      { return $this->belongsTo(Book::class); }
    public function members()   { return $this->hasMany(ClubMember::class); }
    public function users()     { return $this->belongsToMany(User::class, 'club_members')->using(ClubMember::class)->withTimestamps(); }
    public function messages()  { return $this->hasMany(Message::class)->latest(); }

    public function isPrivate(): bool { return !$this->is_public; }
}

