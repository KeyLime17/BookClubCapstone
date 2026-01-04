<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Club;

class BookController extends Controller
{
    public function show(Request $request, int $id)
    {
        $book = DB::selectOne(
            "SELECT
                b.id, b.title, b.author, b.cover_url,
                b.released_at, b.description,
                g.name AS genre, g.slug AS genre_slug
             FROM books b
             JOIN genres g ON g.id = b.genre_id
             WHERE b.id = ?
             LIMIT 1",
            [$id]
        );

        if (!$book) abort(404);

        $agg = DB::selectOne(
            "SELECT
                AVG(rating) AS avg_rating,
                COUNT(*) AS ratings_count
             FROM ratings
             WHERE book_id = ?",
            [$id]
        );

        $mine = null;
        if (Auth::check()) {
            $mine = DB::selectOne(
                "SELECT id, rating, review
                 FROM ratings
                 WHERE book_id = ? AND user_id = ?
                 LIMIT 1",
                [$id, Auth::id()]
            );
        }

        $myPrivateClubId = null;
        if ($request->user()) {
            $uid = $request->user()->getAuthIdentifier();
            $myPrivateClubId = Club::query()
                ->where('book_id', $book->id)
                ->where('is_public', false)
                ->where(function ($q) use ($uid) {
                    $q->where('owner_id', $uid)
                      ->orWhereHas('members', fn($m) => $m->where('user_id', $uid));
                })
                ->value('id');
        }

        return Inertia::render('Book', [
            'book'               => $book,
            'avg_rating'         => ($agg && $agg->avg_rating !== null) ? (float) $agg->avg_rating : null,
            'ratings_count'      => ($agg && $agg->ratings_count !== null) ? (int) $agg->ratings_count : 0,
            'my_rating'          => $mine,
            'my_private_club_id' => $myPrivateClubId,
        ]);
    }
}
