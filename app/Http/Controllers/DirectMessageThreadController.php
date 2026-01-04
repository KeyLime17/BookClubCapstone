<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Carbon;

class DirectMessageThreadController extends Controller
{
    public function inbox(Request $request)
    {
        $me = $request->user();
        abort_unless($me, 401);

        $uid = (int) $me->id;

        // list conversations I’m in, with last message + “other user”
        $rows = DB::select(
            "SELECT
                c.id AS conversation_id,
                u.id AS other_user_id,
                u.name AS other_user_name,
                u.avatar AS other_user_avatar,
                dm.body AS last_body,
                dm.created_at AS last_at
            FROM conversation_participants mep
            JOIN conversations c ON c.id = mep.conversation_id AND c.is_group = 0
            JOIN conversation_participants op
                ON op.conversation_id = c.id AND op.user_id <> mep.user_id
            JOIN users u ON u.id = op.user_id
            LEFT JOIN direct_messages dm
                ON dm.id = (
                    SELECT id FROM direct_messages
                    WHERE conversation_id = c.id
                    ORDER BY id DESC
                    LIMIT 1
                )
            WHERE mep.user_id = ?
            ORDER BY COALESCE(dm.created_at, c.created_at) DESC",
            [$uid]
        );

        return Inertia::render('MessagesInbox', [
            'threads' => $rows,
        ]);
    }

    public function show(Request $request, int $conversationId)
    {
        $me = $request->user();
        abort_unless($me, 401);

        $uid = (int) $me->id;

        $isIn = DB::selectOne(
            "SELECT 1 AS ok
             FROM conversation_participants
             WHERE conversation_id = ? AND user_id = ?
             LIMIT 1",
            [$conversationId, $uid]
        );

        abort_unless($isIn?->ok, 403);

        // other participant
        $other = DB::selectOne(
            "SELECT u.id, u.name, u.avatar
             FROM conversation_participants p
             JOIN users u ON u.id = p.user_id
             WHERE p.conversation_id = ? AND p.user_id <> ?
             LIMIT 1",
            [$conversationId, $uid]
        );

        $messages = DB::select(
            "SELECT dm.id, dm.sender_id, dm.body, dm.created_at,
                    u.name AS sender_name
             FROM direct_messages dm
             JOIN users u ON u.id = dm.sender_id
             WHERE dm.conversation_id = ?
             ORDER BY dm.id DESC
             LIMIT 50",
            [$conversationId]
        );

        //  mark “read” timestamp for this thread
        DB::table('conversation_participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $uid)
            ->update(['last_read_at' => Carbon::now(), 'updated_at' => Carbon::now()]);

        return Inertia::render('DirectMessages', [
            'conversationId' => $conversationId,
            'otherUser' => $other,
            'messages' => array_reverse($messages), // oldest -> newest for UI
        ]);
    }

    public function store(Request $request, int $conversationId)
    {
        $me = $request->user();
        abort_unless($me, 401);

        $uid = (int) $me->id;

        // muted check
        if ($me->muted_until && Carbon::now()->lessThan($me->muted_until)) {
            return back()->withErrors([
                'message' => 'You are muted until ' . $me->muted_until->toDateTimeString() . '.',
            ]);
        }

        $isIn = DB::selectOne(
            "SELECT 1 AS ok
             FROM conversation_participants
             WHERE conversation_id = ? AND user_id = ?
             LIMIT 1",
            [$conversationId, $uid]
        );
        abort_unless($isIn?->ok, 403);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        DB::table('direct_messages')->insert([
            'conversation_id' => $conversationId,
            'sender_id' => $uid,
            'body' => $data['body'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back();
    }
}
