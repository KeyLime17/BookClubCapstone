<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GenresTableSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $genres = ['Fantasy','Science Fiction','Mystery','Romance','Nonfiction','Horror','Historical','Young Adult'];
        foreach ($genres as $g) {
            DB::table('genres')->updateOrInsert(
                ['name' => $g],
                ['slug' => Str::slug($g), 'created_at'=>$now, 'updated_at'=>$now]
            );
        }
    }
}
