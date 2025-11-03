<?php

namespace App\Http\Controllers;

use App\Models\Club;
use App\Models\Invitation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InvitationController extends Controller
{
    /**
     * Create an invitation for a PRIVATE club.
     * Either provide invitee_id (registered user) or email (external).
     */
    public function create(Request $request, Club $club)
    {
        $this->authorize('invite', $club);

        if ($club->is_public) {
            return response()->json(['message' => 'Invitations are only for private clubs.'], 422);
        }

        $data = $request->validate([
            'invitee_id' => ['nullable', 'exists:users,id'],
            'email'      => ['nullable', 'email'],
        ]);

        if (!$data['invitee_id'] && !$data['email']) {
            return response()->json(['message' => 'Provide invitee_id or email.'], 422);
        }

        $invite = $club->invitations()->create([
            'inviter_id' => $request->user()->id,
            'invitee_id' => $data['invitee_id'] ?? null,
            'email'      => $data['email'] ?? null,
            'token'      => Str::random(48),
            'expires_at' => now()->addDays(7),
        ]);

        // (Optional) Send mail notification here.

        return response()->json($invite, 201);
    }

    /**
     * Accept an invitation by token (auth required).
     */
    public function accept(Request $request, string $token)
    {
        $invite = Invitation::where('token', $token)
            ->whereNull('accepted_at')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->firstOrFail();

        $user = $request->user();
        if (!$user) {
            abort(401);
        }

        if ($invite->invitee_id && $invite->invitee_id !== $user->id) {
            abort(403);
        }

        $invite->club->members()->updateOrCreate(
            ['user_id' => $user->id],
            ['role' => 'member', 'joined_at' => now()]
        );

        $invite->update(['accepted_at' => now()]);

        return response()->noContent();
    }
}
?>