<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\DB;

class BooksTableSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        // helper to get a genre id by name
        $gid = fn(string $name) => DB::table('genres')->where('name',$name)->value('id');

        $rows = [
            ['title'=>'The Fellowship of the Ring','author'=>'J.R.R. Tolkien','released_at'=>'1954-07-29','genre'=>'Fantasy','cover_url'=>null,'description'=>'Book I of The Lord of the Rings.'],
            ['title'=>'Dune','author'=>'Frank Herbert','released_at'=>'1965-08-01','genre'=>'Science Fiction','cover_url'=>null,'description'=>'Politics, ecology, and prophecy on Arrakis.'],
            ['title'=>'The Hound of the Baskervilles','author'=>'Arthur Conan Doyle','released_at'=>'1902-04-01','genre'=>'Mystery','cover_url'=>null,'description'=>'Holmes & Watson investigate a deadly legend.'],
            ['title'=>'Pride and Prejudice','author'=>'Jane Austen','released_at'=>'1813-01-28','genre'=>'Romance','cover_url'=>null,'description'=>'Wit, courtship, and social class.'],
            ['title'=>'Sapiens','author'=>'Yuval Noah Harari','released_at'=>'2011-01-01','genre'=>'Nonfiction','cover_url'=>null,'description'=>'A brief history of humankind.'],
            ['title'=>'Dracula','author'=>'Bram Stoker','released_at'=>'1897-05-26','genre'=>'Horror','cover_url'=>null,'description'=>'Letters & diaries tell of a vampire.'],
            ['title'=>'The Book Thief','author'=>'Markus Zusak','released_at'=>'2005-03-14','genre'=>'Historical','cover_url'=>null,'description'=>'A girl steals books in Nazi Germany.'],
            ['title'=>'The Hunger Games','author'=>'Suzanne Collins','released_at'=>'2008-09-14','genre'=>'Young Adult','cover_url'=>null,'description'=>'A deadly televised lottery.'],
        ];

        foreach ($rows as $r) {
            DB::table('books')->updateOrInsert(
                ['title' => $r['title'], 'author' => $r['author']],
                [
                    'released_at' => $r['released_at'],
                    'genre_id'    => $gid($r['genre']),
                    'cover_url'   => $r['cover_url'],
                    'description' => $r['description'],
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ]
            );
        }
    }
}
