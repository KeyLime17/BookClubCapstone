<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(function () {
    $fictionId = DB::table('genres')->insertGetId([
        'name' => 'Fiction',
        'slug' => 'fiction',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $horrorId = DB::table('genres')->insertGetId([
        'name' => 'Horror',
        'slug' => 'horror',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    DB::table('books')->insert([
        'title'       => 'Happy Book',
        'author'      => 'Nice Author',
        'genre_id'    => $fictionId,
        'released_at' => '2020-01-01',
        'created_at'  => now(),
        'updated_at'  => now(),
    ]);

    DB::table('books')->insert([
        'title'       => 'Scary Book',
        'author'      => 'Spooky Author',
        'genre_id'    => $horrorId,
        'released_at' => '2023-05-10',
        'created_at'  => now(),
        'updated_at'  => now(),
    ]);
});

it('filters by genre', function () {
    $response = $this->get('/catalog?genre=horror');

    $response->assertStatus(200);
    $response->assertSee('Scary Book');
    $response->assertDontSee('Happy Book');
});

it('filters by date range', function () {
    $response = $this->get('/catalog?from=2022-01-01&to=2024-01-01');

    $response->assertStatus(200);
    $response->assertSee('Scary Book');
    $response->assertDontSee('Happy Book');
});
