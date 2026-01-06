<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DirectMessageController extends Controller
{
    public function start(Request $request, User $user)
    {
        $me = $request->user();
        abort_unless($me, 401);

        if ((int)$me->id === (int)$user->id) {
            return back()->with('error', 'You cannot message yourself.');
        }

        $myId = (int) $me->id;
        $otherId = (int) $user->id;

        // Find existing  conversation
        // A convo that has exactly these 2 participants and is_group = 0.
        $existing = DB::selectOne(
            "SELECT c.id
             FROM conversations c
             JOIN conversation_participants p1 ON p1.conversation_id = c.id AND p1.user_id = ?
             JOIN conversation_participants p2 ON p2.conversation_id = c.id AND p2.user_id = ?
             WHERE c.is_group = 0
             LIMIT 1",
            [$myId, $otherId]
        );

        if ($existing?->id) {
            return redirect()->to("/messages/" . $existing->id);
        }

        // Create new conversation + participants
        return DB::transaction(function () use ($myId, $otherId) {
            $conversationId = DB::table('conversations')->insertGetId([
                'is_group' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

        DB::table('conversation_participants')->insert([
            [
                'conversation_id' => $conversationId,
                'user_id' => $myId,
                'status' => 'accepted',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'conversation_id' => $conversationId,
                'user_id' => $otherId,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);


            return redirect()->to("/messages/" . $conversationId);
        });
    }
}
