<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DirectMessageRequestController extends Controller
{
    public function accept(Request $request, int $conversation)
    {
        $me = $request->user();
        abort_unless($me, 401);

        $uid = (int) $me->id;

        $p = DB::selectOne(
            "SELECT user_id, approved_at
             FROM conversation_participants
             WHERE conversation_id = ? AND user_id = ?
             LIMIT 1",
            [$conversation, $uid]
        );

        abort_unless($p?->user_id, 403);

        DB::table('conversation_participants')
            ->where('conversation_id', $conversation)
            ->where('user_id', $uid)
            ->update([
                'approved_at' => now(),
                'updated_at' => now(),
            ]);

        $notificationId = (string) $request->input('notification_id', '');
        if ($notificationId !== '') {
            $me->notifications()->where('id', $notificationId)->update(['read_at' => now()]);
        }

        return redirect()->to("/messages/" . $conversation);
    }

    public function deny(Request $request, int $conversation)
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

        DB::table('conversation_participants')
            ->where('conversation_id', $conversation)
            ->where('user_id', $uid)
            ->delete();

        $left = DB::selectOne(
            "SELECT COUNT(*) AS c
             FROM conversation_participants
             WHERE conversation_id = ?",
            [$conversation]
        );

        if ((int)($left->c ?? 0) <= 1) {
            DB::table('conversations')->where('id', $conversation)->delete();
        }

        $notificationId = (string) $request->input('notification_id', '');
        if ($notificationId !== '') {
            $me->notifications()->where('id', $notificationId)->update(['read_at' => now()]);
        }

        return back();
    }
}
