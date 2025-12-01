<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminRoutesTest extends TestCase
{
    use RefreshDatabase;

    public function non_admin_cannot_access_review_page()
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)
            ->get('/review')
            ->assertStatus(403);
    }

    public function guest_is_redirected_from_review_page()
    {
        $this->get('/review')
            ->assertRedirect('/login');
    }
}
