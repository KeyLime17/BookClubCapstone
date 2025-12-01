<?php

use App\Models\User;
use App\Models\Book;
use App\Models\BookSubmission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);


it('redirects guests from submit page to login', function () {
    $this->get('/books/submit')
        ->assertRedirect('/login');
});

it('allows authenticated user to see submit page', function () {
    $user = User::factory()->create([
        'is_banned' => false,
    ]);

    $this->actingAs($user)
        ->get('/books/submit')
        ->assertStatus(200)
        ->assertSee('Submit'); 
});

it('stores a book submission with optional image and link', function () {
    Storage::fake('public');

    $user = User::factory()->create([
        'is_banned' => false,
    ]);

    $payload = [
        'title'  => 'Test Submission',
        'author' => 'Test Author',
        'link'   => 'https://example.com/book',
        'image'  => UploadedFile::fake()->create('cover.jpg', 100, 'image/jpeg'),
    ];

    $response = $this->actingAs($user)
        ->post('/books/submit', $payload);

    $response->assertRedirect(); 
    $response->assertSessionHas('success', 'Book submitted for review.');

    $submission = BookSubmission::first();
    expect($submission)->not->toBeNull();
    expect($submission->title)->toBe('Test Submission');
    expect($submission->author)->toBe('Test Author');
    expect($submission->user_id)->toBe($user->id);
    expect($submission->status)->toBe('pending');
    expect($submission->link)->toBe('https://example.com/book');

    expect($submission->image_path)->not->toBeNull();
    Storage::disk('public')->assertExists($submission->image_path);
});

it('prevents banned users from using the submit routes', function () {
    $user = User::factory()->create([
        'is_banned' => true,
    ]);


    $this->actingAs($user)
        ->get('/books/submit')
        ->assertRedirect('/banned');

    $this->actingAs($user)
        ->post('/books/submit', [
            'title'  => 'Should not work',
            'author' => 'Nope',
        ])
        ->assertRedirect('/banned');
});


it('accepts description with potential xss without breaking', function () {
    $user = User::factory()->create(['is_banned' => false]);

    $payload = [
        'title'  => 'XSS Book',
        'author' => 'Sneaky Author',
        'link'   => null,
        'image'  => null,
    ];

    $this->actingAs($user)
        ->post('/books/submit', $payload)
        ->assertRedirect();

    $submission = BookSubmission::where('title', 'XSS Book')->firstOrFail();


    if (!DB::table('genres')->exists()) {
        DB::table('genres')->insert([
            'name'       => 'Test Genre',
            'slug'       => 'test-genre',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    $genreId = DB::table('genres')->value('id');

    $admin = User::factory()->create(['is_admin' => true, 'is_banned' => false]);

    $this->actingAs($admin)
        ->post("/review/{$submission->id}/approve", [
            'description' => '<script>alert("xss")</script>',
            'genre_id'    => $genreId,
        ])
        ->assertRedirect();

    $book = Book::where('title', 'XSS Book')->firstOrFail();


    expect($book->description)->toBe('<script>alert("xss")</script>');
});
