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
        $user = $request->user();

        $canView = Gate::forUser($user)->allows('view', $club);

        if (!$canView) {
            // Special case: guest viewing a public club
            if ($club->is_public && !$user) {
                // allowed
            } else {
                abort(403);
            }
        }

        return $club->messages()
            ->with('user:id,name')
            ->orderByDesc('id')
            ->cursorPaginate(30);
    }

    /**
     * Post a message to a club.
     * Auth required; private clubs restricted to members via policy.
     */
    public function store(Request $request, Club $club)
    {
        $this->authorize('post', $club);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        // If you allow HTML, sanitize here (e.g., mews/purifier). For now plain text is best.

        $msg = $club->messages()->create([
            'user_id' => $request->user()->id,
            'type'    => 'text',
            'body'    => $data['body'],
        ]);

        // Broadcast to listeners (real-time)
        broadcast(new \App\Events\MessageCreated(
            $msg->load('user:id,name', 'club:id,is_public')
        ))->toOthers();

        return response()->json($msg, 201);
    }
}
