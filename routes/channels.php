<?php

use App\Models\Club;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('club.{clubId}', function ($user, $clubId) {
    $club = Club::query()->find($clubId);
    if (!$club) {
        return false;
    }

    // Public/global clubs: allow any authenticated user to listen on the private channel.
    // (Guests will listen on the *public* Channel from the frontend, no auth needed.)
    if ($club->is_public) {
        return $user ? true : false;
    }

    // Private clubs: only members
    return $user
        && $club->members()->where('user_id', $user->id)->exists();
});
