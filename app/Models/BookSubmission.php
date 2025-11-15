<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookSubmission extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'author',
        'image_path',
        'link',
        'description',
        'release_date',
        'status',
        'reviewer_id',
        'reviewed_at',
    ];

    protected $casts = [
        'release_date' => 'date',
        'reviewed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}

