<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class DirectMessageApiController extends Controller
{
    public function index(Request $request, int $conversation)
    {
        $me = $request->user();
        abort_unless($me, 401);

        $uid = (int) $me->id;

        $isIn = DB::selectOne(
            "SELECT 1 AS ok
             FROM conversation_participants
             WHERE conversation_id = ? AND user_id = ?
             LIMIT 1",
            [$conversation, $uid]
        );
        abort_unless($isIn?->ok, 403);

        $messages = DB::select(
            "SELECT dm.id, dm.sender_id, dm.body, dm.created_at,
                    u.name AS sender_name
             FROM direct_messages dm
             JOIN users u ON u.id = dm.sender_id
             WHERE dm.conversation_id = ?
             ORDER BY dm.id DESC
             LIMIT 50",
            [$conversation]
        );

        return response()->json(array_reverse($messages));
    }

    public function store(Request $request, int $conversation)
    {
        $me = $request->user();
        abort_unless($me, 401);

        $uid = (int) $me->id;

        if ($me->muted_until && Carbon::now()->lessThan($me->muted_until)) {
            return response()->json(['message' => 'Muted'], 403);
        }

        $isIn = DB::selectOne(
            "SELECT 1 AS ok
             FROM conversation_participants
             WHERE conversation_id = ? AND user_id = ?
             LIMIT 1",
            [$conversation, $uid]
        );
        abort_unless($isIn?->ok, 403);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $id = DB::table('direct_messages')->insertGetId([
            'conversation_id' => $conversation,
            'sender_id' => $uid,
            'body' => $data['body'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $msg = DB::selectOne(
            "SELECT dm.id, dm.sender_id, dm.body, dm.created_at,
                    u.name AS sender_name
             FROM direct_messages dm
             JOIN users u ON u.id = dm.sender_id
             WHERE dm.id = ?
             LIMIT 1",
            [$id]
        );

        return response()->json($msg, 201);
    }
}
