<?php

namespace App\Policies;

use App\Models\Club;
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

        $userId = method_exists($user, 'getAuthIdentifier')
            ? $user->getAuthIdentifier()
            : ($user->id ?? null);

        if (!$userId) {
            return false;
        }

        if ((int) $club->owner_id === (int) $userId) {
            return true;
        }

        return $club->members()->where('user_id', $userId)->exists();
    }

    // Post messages: must be logged-in AND (public OR private-member)
    public function post(?AuthUser $user, Club $club): bool
    {
        if (!$user) return false;

        $userId = method_exists($user, 'getAuthIdentifier')
            ? $user->getAuthIdentifier()
            : ($user->id ?? null);

        if (!$userId) return false;

        if ($club->is_public) {
            // any logged-in user may post in public club
            return true;
        }

        return (int) $club->owner_id === (int) $userId
            || $club->members()->where('user_id', $userId)->exists();
    }

    // Manage settings (rename, etc.): owner or moderator
    public function manage(AuthUser $user, Club $club): bool
    {
        $uid = method_exists($user, 'getAuthIdentifier')
            ? $user->getAuthIdentifier()
            : ($user->id ?? null);

        if (!$uid) return false;

        return (int) $club->owner_id === (int) $uid
            || $club->members()
                ->where('user_id', $uid)
                ->where('role', 'moderator')
                ->exists();
    }

    public function invite(?AuthUser $user, Club $club): bool
    {
        if (!$user) return false;

        $uid = method_exists($user, 'getAuthIdentifier')
            ? $user->getAuthIdentifier()
            : ($user->id ?? null);

        if (!$uid) return false;

        if ((int) $club->owner_id === (int) $uid) {
            return true;
        }

        return $club->members()
            ->where('user_id', $uid)
            ->where('role', 'moderator')
            ->exists();
    }

    // Delete club: only owner (optionally admins here if you want)
    public function delete(AuthUser $user, Club $club): bool
    {
        $uid = method_exists($user, 'getAuthIdentifier')
            ? $user->getAuthIdentifier()
            : ($user->id ?? null);

        if (!$uid) return false;

        return (int) $club->owner_id === (int) $uid;
    }
}
