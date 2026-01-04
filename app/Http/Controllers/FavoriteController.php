<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FavoriteController extends Controller
{
    public function toggle(Request $request, int $id)
    {
        $uid = $request->user()->getAuthIdentifier();

        $exists = DB::selectOne(
            "SELECT 1 AS ok FROM favorites WHERE user_id = ? AND book_id = ? LIMIT 1",
            [$uid, $id]
        );

        if ($exists) {
            DB::delete(
                "DELETE FROM favorites WHERE user_id = ? AND book_id = ?",
                [$uid, $id]
            );
        } else {
            DB::insert(
                "INSERT INTO favorites (user_id, book_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
                [$uid, $id]
            );
        }

        return back();
    }
}
