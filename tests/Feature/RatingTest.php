<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(function () {
    $genreId = DB::table('genres')->insertGetId([
        'name' => 'Test',
        'slug' => 'test',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->bookId = DB::table('books')->insertGetId([
        'title'       => 'Rate Me',
        'author'      => 'Author',
        'genre_id'    => $genreId,
        'created_at'  => now(),
        'updated_at'  => now(),
    ]);
});

it('allows logged in user to rate a book', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post("/books/{$this->bookId}/rate", ['rating' => 4])
        ->assertRedirect();

    $this->assertDatabaseHas('ratings', [
        'book_id' => $this->bookId,
        'user_id' => $user->id,
        'rating'  => 4,
    ]);
});

it('prevents guests from rating', function () {
    $this->post("/books/{$this->bookId}/rate", ['rating' => 5])
        ->assertRedirect('/login');
});
