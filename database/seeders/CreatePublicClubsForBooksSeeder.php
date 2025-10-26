<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CreatePublicClubsForBooksSeeder extends Seeder
{
    public function run(): void
    {
        // Pull all books (id + title)
        $books = DB::table('books')->select('id','title')->orderBy('id')->get();

        foreach ($books as $b) {
            // Ensure exactly one public club per book
            $exists = DB::table('clubs')
                ->where('book_id', $b->id)
                ->where('is_public', 1)
                ->exists();

            if (!$exists) {
                DB::table('clubs')->insert([
                    'book_id'    => $b->id,
                    'is_public'  => 1,
                    'name'       => 'Discuss: '.$b->title,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
