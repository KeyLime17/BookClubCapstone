<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\BookController;

Route::get('/', fn () => Inertia::render('Home'))->name('home');
Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog');

Route::middleware('auth')->group(function () {
    Route::get('/clubs/private', fn () => Inertia::render('Home', ['note' => 'Private clubs (auth only)']))
        ->name('clubs.private');
});

Route::get('/books/{id}', [BookController::class, 'show'])->name('books.show');

require __DIR__.'/auth.php';
