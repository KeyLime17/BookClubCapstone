<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BookController extends Controller
{
    public function show(\Illuminate\Http\Request $request, int $id)
    {
        $book = DB::table('books')
            ->join('genres','genres.id','=','books.genre_id')
            ->select(
                'books.id','books.title','books.author','books.cover_url',
                'books.released_at','books.description',
                'genres.name as genre','genres.slug as genre_slug'
            )
            ->where('books.id', $id)
            ->first();

        if (!$book) abort(404);

        // Aggregates
        $agg = DB::table('ratings')
            ->where('book_id', $id)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as ratings_count')
            ->first();

        // Current user's rating (if logged in)
        $mine = null;
        if (Auth::check()) {
            $mine = DB::table('ratings')
                ->where('book_id', $id)
                ->where('user_id', Auth::id())
                ->select('id','rating','review')
                ->first();
        }

        return Inertia::render('Book', [
            'book' => $book,
            'avg_rating'    => $agg?->avg_rating ? (float) $agg->avg_rating : null,
            'ratings_count' => $agg?->ratings_count ? (int) $agg->ratings_count : 0,
            'my_rating'     => $mine,
        ]);
    }
}
