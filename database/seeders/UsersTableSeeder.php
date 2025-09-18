<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;  
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;


class UsersTableSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // Idempotent admin (update if exists, insert if not)
        DB::table('users')->updateOrInsert(
            ['email' => 'admin@example.com'],
            [
                'name'           => 'Admin User',
                'password'       => Hash::make('Password123!'),
                'email_verified_at' => $now,
                'remember_token' => Str::random(60),
                'created_at'     => $now,
                'updated_at'     => $now,
            ]
        );

        // Optional test account (insert once)
        DB::table('users')->insertOrIgnore([
            'name'              => 'Test User',
            'email'             => 'test@example.com',
            'password'          => Hash::make('Password123!'),
            'email_verified_at' => $now,
            'remember_token'    => Str::random(60),
            'created_at'        => $now,
            'updated_at'        => $now,
        ]);
    }
}
