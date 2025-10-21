<?php

namespace App\Policies;

use App\Models\Club;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ClubPolicy
{
    // Public/global clubs: anyone can view; Private: only members
    public function view(?User $user, Club $club): bool
    {
        if ($club->is_public) return true;
        if (!$user) return false;
        return $club->members()->where('user_id', $user->id)->exists();
    }

    // Post messages: must be logged-in AND (public OR private-member)
    public function post(User $user, Club $club): bool
    {
        if ($club->is_public) return true;
        return $club->members()->where('user_id', $user->id)->exists();
    }

    public function manage(User $user, Club $club): bool
    {
        return $club->owner_id === $user->id
            || $club->members()->where('user_id',$user->id)->where('role','moderator')->exists();
    }

    public function invite(User $user, Club $club): bool
    {
        return $this->manage($user, $club);
    }
}

