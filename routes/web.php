<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Home'))->name('home');
Route::get('/catalog', fn () => Inertia::render('Catalog'))->name('catalog');

Route::middleware('auth')->group(function () {
    Route::get('/clubs/private', fn () => Inertia::render('Home', ['note' => 'Private clubs (auth only)']))
        ->name('clubs.private');
});

require __DIR__.'/auth.php'; 


