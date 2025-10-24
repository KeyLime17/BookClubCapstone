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
    public function index(Request $request, Club $club)
    {
        if (!$club->is_public) {
            $this->authorize('view', $club);
        }

        $messages = $club->messages()
            ->with(['user:id,name'])
            ->orderBy('id', 'desc')
            ->limit(30)
            ->get();

        return response()->json($messages, 200);
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
