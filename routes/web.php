<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\BookRatingController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ClubController;
use App\Http\Controllers\BookSubmissionController;
use App\Http\Controllers\ModerationController;

// if user is banned
Route::get('/banned', fn () => Inertia::render('Banned'))
    ->name('banned');

// routes Handling submission of new books
Route::middleware('auth', 'not-banned')->group(function () {
    Route::get('/books/submit', [BookSubmissionController::class, 'create'])
        ->name('books.submit');

    Route::post('/books/submit', [BookSubmissionController::class, 'store'])
        ->name('books.submit.store');
});

// Admin-only review routes
Route::middleware(['auth', 'admin', 'not-banned'])->group(function () {
    Route::get('/review', [BookSubmissionController::class, 'index'])
        ->name('review.index');

    Route::get('/review/{submission}', [BookSubmissionController::class, 'show'])
        ->name('review.show');

    Route::post('/review/{submission}/approve', [BookSubmissionController::class, 'approve'])
        ->name('review.approve');

    Route::post('/review/{submission}/reject', [BookSubmissionController::class, 'reject'])
        ->name('review.reject');

    // New moderation dashboard
    Route::get('/moderation', [ModerationController::class, 'index'])
        ->name('moderation.index');
    // Admin moderation actions
    Route::post('/moderation/users/{user}/promote', [ModerationController::class, 'promote'])
        ->name('moderation.promote');

    Route::post('/moderation/users/{user}/demote', [ModerationController::class, 'demote'])
        ->name('moderation.demote');

    Route::post('/moderation/users/{user}/ban', [ModerationController::class, 'ban'])
        ->name('moderation.ban');

    Route::post('/moderation/users/{user}/unban', [ModerationController::class, 'unban'])
        ->name('moderation.unban');

    Route::post('/moderation/users/{user}/mute', [ModerationController::class, 'mute'])
        ->name('moderation.mute');

    Route::post('/moderation/users/{user}/clear-mute', [ModerationController::class, 'clearMute'])
        ->name('moderation.clear-mute');
});


// routes/web.php
// Home page → renders resources/js/Pages/Home.tsx

Route::get('/', function () {
    $limit = 10;

    // New Releases: most recent released_at (if set)
    $newReleases = DB::table('books')
        ->whereNotNull('released_at')
        ->orderByDesc('released_at')
        ->limit($limit)
        ->get([
            'id',
            'title',
            'author',
            'cover_url',
            'released_at',
            'created_at',
        ]);

    // Top Rated: by avg rating, then rating count
    $topRated = DB::table('books')
        ->join('ratings', 'ratings.book_id', '=', 'books.id')
        ->select(
            'books.id',
            'books.title',
            'books.author',
            'books.cover_url',
            DB::raw('AVG(ratings.rating) as avg_rating'),
            DB::raw('COUNT(ratings.id) as ratings_count')
        )
        ->groupBy('books.id', 'books.title', 'books.author', 'books.cover_url')
        ->havingRaw('COUNT(ratings.id) >= 1')
        ->orderByDesc('avg_rating')
        ->orderByDesc('ratings_count')
        ->limit($limit)
        ->get();

    // Newly Added: most recent created_at
    $newlyAdded = DB::table('books')
        ->orderByDesc('created_at')
        ->limit($limit)
        ->get([
            'id',
            'title',
            'author',
            'cover_url',
            'created_at',
            'released_at',
        ]);

    return Inertia::render('Home', [
        'newReleases' => $newReleases,
        'topRated'    => $topRated,
        'newlyAdded'  => $newlyAdded,
    ]);
})->name('home');

// Catalog list (with filters, pagination) → resources/js/Pages/Catalog.tsx
// Controller uses Query Builder (no Eloquent) to fetch books/genres.
Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog');

// Placeholder for Private Clubs page (gated)
// Renders Home for now with a note; replace with real page later.
Route::middleware('auth')->group(function () {
    Route::get('/clubs/private', [ClubController::class, 'myClubs'])->name('clubs.private');

    // leave a club
    Route::delete('/clubs/{club}/leave', [ClubController::class, 'leaveWeb'])
        ->name('clubs.leave');
    
    // Rename a club
    Route::patch('/clubs/{club}', [ClubController::class, 'updateName'])
        ->name('clubs.updateName');

    // For club deletion
    Route::delete('/clubs/{club}', [ClubController::class, 'destroy'])
        ->name('clubs.destroy');


    Route::post('/books/{id}/rate',   [BookRatingController::class, 'upsert'])->name('books.rate');
    Route::delete('/books/{id}/rate', [BookRatingController::class, 'destroy'])->name('books.rate.destroy');
});
//Read-only book page. We take a numeric {id} and fetch the record
Route::get('/books/{id}', [BookController::class, 'show'])->name('books.show');


Route::post('/clubs/{club}/messages', [MessageController::class, 'store'])->middleware('auth');

Route::middleware('auth')->group(function () {
    // Create (or reuse) a private club for a given book, then redirect to chat
    Route::post('/books/{book}/private-club', [ClubController::class, 'createPrivateForBook'])
        ->name('books.private-club.create');

    // Private club chat page (Inertia)
    Route::get('/clubs/{club}/chat', function (\App\Models\Club $club) {
        // Policy: only members/owner can view private clubs
        if (!$club->is_public) {
            // throws 403 if unauthorized via your ClubPolicy
            app(\Illuminate\Contracts\Auth\Access\Gate::class)->authorize('view', $club);
        }
        return Inertia::render('PrivateClubChat', [
            'club' => $club->only(['id','name','book_id','is_public']),
        ]);
    })->name('clubs.chat');
});

Route::middleware('auth')->group(function () {
    Route::post('/clubs/{club}/invite', [ClubController::class, 'inviteUser'])
        ->name('clubs.invite');
});

Route::middleware('auth')->group(function () {
    Route::get('/users/search', [\App\Http\Controllers\UserController::class, 'search'])
        ->name('users.search');
});

Route::get('/clubs/{club}/messages', [MessageController::class, 'index']); // web guard (session)



require __DIR__.'/auth.php';
