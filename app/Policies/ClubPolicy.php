<?php

namespace App\Policies;

use App\Models\Club;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable as AuthUser;

class ClubPolicy
{
    // Public/global clubs: anyone can view; Private: only members
    public function view(?AuthUser $user, Club $club): bool
    {
        if ($club->is_public) {
            return true;
        }

        if (!$user) {
            return false;
        }

        // Get numeric id from any user implementation
        $userId = method_exists($user, 'getAuthIdentifier')
            ? $user->getAuthIdentifier()
            : ($user->id ?? null);

        if (!$userId) {
            return false;
        }

        if ((int)$club->owner_id === (int)$userId) {
            return true;
        }

        return $club->members()->where('user_id', $userId)->exists();
    }

    // Post messages: must be logged-in AND (public OR private-member)
    public function post(?AuthUser $user, Club $club): bool
    {
        if (!$user) return false;
        $userId = method_exists($user, 'getAuthIdentifier') ? $user->getAuthIdentifier() : ($user->id ?? null);
        if (!$userId) return false;
        if ($club->is_public) return true; // anyone logged-in may post in public
        return (int)$club->owner_id === (int)$userId
            || $club->members()->where('user_id', $userId)->exists();
    }

    public function manage(User $user, Club $club): bool
    {
        return $club->owner_id === $user->id
            || $club->members()->where('user_id',$user->id)->where('role','moderator')->exists();
    }

    public function invite(?AuthUser $user, \App\Models\Club $club): bool
    {
        if (!$user) return false;
        $uid = method_exists($user, 'getAuthIdentifier') ? $user->getAuthIdentifier() : null;
        if (!$uid) return false;

        if ((int)$club->owner_id === (int)$uid) return true;

        return $club->members()
            ->where('user_id', $uid)
            ->where('role', 'moderator')
            ->exists();
    }

    public function delete(User $user, Club $club): bool
    {
        return (int)$club->owner_id === (int)$user->id;
    }

}

