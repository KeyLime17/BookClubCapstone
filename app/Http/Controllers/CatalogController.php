<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;

class CatalogController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'q'     => ['nullable','string','max:200'],
            'genre' => ['nullable','string','max:100'],
            'genres'=> ['nullable','array'],
            'genres.*' => ['string','max:100'],
            'from'  => ['nullable','date'],
            'to'    => ['nullable','date'],
            'page'  => ['nullable','integer','min:1'],
        ]);

        $genresSelected = $validated['genres'] ?? null;
        if (!is_array($genresSelected) || count($genresSelected) === 0) {
            $genresSelected = !empty($validated['genre']) ? [$validated['genre']] : [];
        }

        $filters = [
            'q'      => $validated['q'] ?? null,
            'genres' => $genresSelected,
            'from'   => $validated['from'] ?? null,
            'to'     => $validated['to'] ?? null,
        ];

        $genres = DB::table('genres')
            ->select('id','name','slug')
            ->orderBy('name')
            ->get();

        // EVIDENCE OF SQL QUERY USAGE, added it for the most common used spot probably
        $where = [];
        $bind  = [];

        if (!empty($filters['q'])) {
            $where[] = "(b.title LIKE ? OR b.author LIKE ?)";
            $like = '%'.$filters['q'].'%';
            $bind[] = $like;
            $bind[] = $like;
        }

        if (!empty($filters['genres'])) {
            $placeholders = implode(',', array_fill(0, count($filters['genres']), '?'));
            $where[] = "g.slug IN ($placeholders)";
            foreach ($filters['genres'] as $slug) {
                $bind[] = $slug;
            }
        }

        $from = $filters['from'] ?? null;
        $to   = $filters['to'] ?? null;

        if ($from && $to) {
            if ($from > $to) { [$from, $to] = [$to, $from]; }
            $where[] = "DATE(b.released_at) BETWEEN ? AND ?";
            $bind[]  = $from;
            $bind[]  = $to;
        } elseif ($from) {
            $where[] = "DATE(b.released_at) >= ?";
            $bind[]  = $from;
        } elseif ($to) {
            $where[] = "DATE(b.released_at) <= ?";
            $bind[]  = $to;
        }

        $whereSql = $where ? ("WHERE " . implode(" AND ", $where)) : "";
        $perPage = 12;
        $page    = (int) ($validated['page'] ?? Paginator::resolveCurrentPage() ?? 1);
        if ($page < 1) $page = 1;

        $countRow = DB::selectOne(
            "SELECT COUNT(*) AS total
            FROM books b
            JOIN genres g ON g.id = b.genre_id
            $whereSql",
            $bind
        );
        $total = (int) ($countRow->total ?? 0);

        $offset = ($page - 1) * $perPage;

        $rows = DB::select(
            "SELECT
                b.id, b.title, b.author, b.cover_url, b.released_at,
                g.name AS genre, g.slug AS genre_slug
            FROM books b
            JOIN genres g ON g.id = b.genre_id
            $whereSql
            ORDER BY b.released_at DESC
            LIMIT $perPage OFFSET $offset",
            $bind
        );

        $books = new LengthAwarePaginator(
            $rows,
            $total,
            $perPage,
            $page,
            [
                'path'  => $request->url(),
                'query' => array_filter($filters, fn($v) => filled($v) || (is_array($v) && count($v) > 0)),
            ]
        );

        $favoritedIds = [];
        $auth = $request->user();
        if ($auth && !empty($auth->id)) {
            $favRows = DB::select("SELECT book_id FROM favorites WHERE user_id = ?", [$auth->id]);
            $favoritedIds = array_map(fn($r) => (int) $r->book_id, $favRows);
        }

        return Inertia::render('Catalog', [
            'books'   => $books,
            'genres'  => $genres,
            'filters' => $filters,
            'favorited_ids' => $favoritedIds,
        ]);
    }
}
