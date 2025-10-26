<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\BookRatingController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ClubController;

// routes/web.php
Route::get('/test-chat', fn () => Inertia::render('PublicChat'));

// Home page → renders resources/js/Pages/Home.tsx
Route::get('/', fn () => Inertia::render('Home'))->name('home');

// Catalog list (with filters, pagination) → resources/js/Pages/Catalog.tsx
// Controller uses Query Builder (no Eloquent) to fetch books/genres.
Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog');

// Placeholder for Private Clubs page (gated)
// Renders Home for now with a note; replace with real page later.
Route::middleware('auth')->group(function () {
    Route::get('/clubs/private', fn () => Inertia::render('Home', ['note' => 'Private clubs (auth only)']))
        ->name('clubs.private');

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


require __DIR__.'/auth.php';
