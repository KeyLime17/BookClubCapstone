<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('registers a new user', function () {
    $payload = [
        'name'                  => 'Test User',
        'email'                 => 'user@example.com',
        'password'              => 'Password123!',
        'password_confirmation' => 'Password123!',
    ];

    $this->post('/register', $payload)
        ->assertRedirect('/') 
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('users', [
        'email' => 'user@example.com',
    ]);
});

it('rejects duplicate email on registration', function () {
    User::factory()->create(['email' => 'user@example.com']);

    $payload = [
        'name'                  => 'Test User',
        'email'                 => 'user@example.com',
        'password'              => 'Password123!',
        'password_confirmation' => 'Password123!',
    ];

    $this->post('/register', $payload)
        ->assertSessionHasErrors('email');
});


it('logs in with valid credentials', function () {
    $user = \App\Models\User::factory()->create([
        'password' => bcrypt('Password123!'),
    ]);

    $response = $this->post('/login', [
        'email'    => $user->email,
        'password' => 'Password123!',
    ]);

    $response->assertRedirect();
    $this->assertAuthenticatedAs($user);
});


it('fails login with wrong password', function () {
    $user = User::factory()->create([
        'password' => bcrypt('Password123!'),
    ]);

    $this->post('/login', [
        'email'    => $user->email,
        'password' => 'wrong-password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest();
});
