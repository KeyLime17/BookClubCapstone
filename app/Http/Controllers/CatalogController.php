<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function index(Request $request)
    {
        $books = DB::table('books')
            ->join('genres','genres.id','=','books.genre_id')
            ->select('books.id','books.title','books.author','books.cover_url','books.released_at','genres.name as genre')
            ->orderByDesc('released_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Catalog', [
            'books' => $books,
        ]);
    }
}
