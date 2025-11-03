<?php

namespace App\Http\Controllers;

use App\Models\Club;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class MessageController extends Controller
{
    /**
     * List messages for a club.
     * Guests can read ONLY if club is public.
     * Uses cursor pagination for infinite scroll.
     */
    public function index(Request $request, \App\Models\Club $club)
    {
        // Public club: guests can read
        if ($club->is_public) {
            return $club->messages()
                ->with('user:id,name')
                ->orderByDesc('id')
                ->limit(30)
                ->get();
        }

        // Private club: must be logged in AND a member/owner
        $user = $request->user(); // in api.php this will be null if not logged in
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $uid = method_exists($user, 'getAuthIdentifier') ? $user->getAuthIdentifier() : ($user->id ?? null);
        if (!$uid) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $isAllowed = ((int)$club->owner_id === (int)$uid)
            || $club->members()->where('user_id', $uid)->exists();

        if (!$isAllowed) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $club->messages()
            ->with('user:id,name')
            ->orderByDesc('id')
            ->limit(30)
            ->get();
    }

    /**
     * Post a message to a club.
     * Auth required; private clubs restricted to members via policy.
     */
    public function store(Request $request, Club $club)
    {
        // public-only for now; private flow would require membership/invite
        if (!$club->is_public) {
            return response()->json(['message' => 'Private club messages require an invite.'], 403);
        }

        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();

        $message = $club->messages()->create([
            'user_id' => $user->id,
            'type'    => 'text',
            'body'    => $data['body'],
        ]);

        // Return the shape the frontend expects (include user name)
        return response()->json(
            $message->load(['user:id,name']),
            201
        );
    }
}
