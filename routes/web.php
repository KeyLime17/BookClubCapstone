<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Home
Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

// Catalog
Route::get('/catalog', function () {
    return Inertia::render('Catalog');
})->name('catalog');

// Private clubs placeholder (we’ll gate later)
Route::get('/clubs/private', function () {
    return Inertia::render('Home', ['note' => 'Private clubs placeholder']);
})->name('clubs.private');
