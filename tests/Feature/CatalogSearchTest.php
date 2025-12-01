<?php

namespace Tests\Feature;

use App\Models\Book;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CatalogSearchTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Make some genres
        $fantasyId = DB::table('genres')->insertGetId([
            'name' => 'Fantasy',
            'slug' => 'fantasy',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $horrorId = DB::table('genres')->insertGetId([
            'name' => 'Horror',
            'slug' => 'horror',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Books
        Book::create([
            'title'       => 'The Fellowship of the Ring',
            'author'      => 'J.R.R. Tolkien',
            'genre_id'    => $fantasyId,
            'released_at' => '1954-07-29',
        ]);

        Book::create([
            'title'       => 'The Two Towers',
            'author'      => 'J.R.R. Tolkien',
            'genre_id'    => $fantasyId,
            'released_at' => '1954-11-11',
        ]);

        Book::create([
            'title'       => 'Dracula',
            'author'      => 'Bram Stoker',
            'genre_id'    => $horrorId,
            'released_at' => '1897-05-26',
        ]);
    }

    /** @test */
    public function it_filters_by_search_term()
    {
        $response = $this->get('/catalog?q=Dracula');

        $response->assertStatus(200);
        $response->assertSee('Dracula');
        $response->assertDontSee('Fellowship of the Ring');
    }

    /** @test */
    public function it_filters_by_genre_slug()
    {
        $response = $this->get('/catalog?genre=fantasy');

        $response->assertStatus(200);
        $response->assertSee('Fellowship of the Ring');
        $response->assertSee('The Two Towers');
        $response->assertDontSee('Dracula');
    }

    /** @test */
    public function it_filters_by_date_range()
    {
        // Only LOTR books (1954); exclude Dracula (1897)
        $response = $this->get('/catalog?from=1954-01-01&to=1954-12-31');

        $response->assertStatus(200);
        $response->assertSee('Fellowship of the Ring');
        $response->assertSee('The Two Towers');
        $response->assertDontSee('Dracula');
    }

    /** @test */
    public function it_handles_sql_injection_like_input_safely()
    {
        // This is just a nasty-looking string; query builder should bind it safely.
        $response = $this->get('/catalog?q=\' OR 1=1 --');

        // Main thing: no 500 error / SQL exception
        $response->assertStatus(200);
    }
}
