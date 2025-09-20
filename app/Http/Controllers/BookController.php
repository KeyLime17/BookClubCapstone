<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BookController extends Controller
{
    public function show(Request $request, int $id)
    {
        $book = DB::table('books')
            ->join('genres', 'genres.id', '=', 'books.genre_id')
            ->select(
                'books.id','books.title','books.author','books.cover_url',
                'books.released_at','books.description',
                'genres.name as genre','genres.slug as genre_slug'
            )
            ->where('books.id', $id)
            ->first();

        if (!$book) {
            abort(404);
        }

        return Inertia::render('Book', ['book' => $book]);
    }
}
