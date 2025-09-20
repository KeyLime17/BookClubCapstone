<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'q'     => ['nullable','string','max:200'],
            'genre' => ['nullable','string','max:100'], // we’ll pass slug
            'from'  => ['nullable','date'],
            'to'    => ['nullable','date'],
            'page'  => ['nullable','integer','min:1'],
        ]);

        $filters = [
            'q'     => $validated['q']    ?? null,
            'genre' => $validated['genre']?? null,
            'from'  => $validated['from'] ?? null,
            'to'    => $validated['to']   ?? null,
        ];

        $genres = DB::table('genres')
            ->select('id','name','slug')
            ->orderBy('name')
            ->get();

        $query = DB::table('books')
            ->join('genres','genres.id','=','books.genre_id')
            ->select(
                'books.id','books.title','books.author','books.cover_url',
                'books.released_at','genres.name as genre','genres.slug as genre_slug'
            );

        if ($filters['q']) {
            $q = $filters['q'];
            $query->where(function($qq) use ($q) {
                $like = '%'.$q.'%';
                $qq->where('books.title','like',$like)
                   ->orWhere('books.author','like',$like);
            });
        }

        if ($filters['genre']) {
            $query->where('genres.slug', $filters['genre']);
        }

        $from = $filters['from'] ?? null;
        $to   = $filters['to']   ?? null;
        if ($from && $to) {
            if ($from > $to) { [$from, $to] = [$to, $from]; } 
            $query->whereBetween('books.released_at', [$from, $to]);
        } elseif ($from) {
            $query->whereDate('books.released_at', '>=', $from);
        } elseif ($to) {
            $query->whereDate('books.released_at', '<=', $to);
        }

        // 5) sort newest first, paginate, keep query string
        $books = $query->orderByDesc('books.released_at')
            ->paginate(12)
            ->appends(Arr::where($filters, fn($v) => filled($v))) // keep active filters in links
            ->withQueryString();

        return Inertia::render('Catalog', [
            'books'   => $books,
            'genres'  => $genres,
            'filters' => $filters,
        ]);
    }
}
