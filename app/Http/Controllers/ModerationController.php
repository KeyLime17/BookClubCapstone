<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ModerationController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Moderation');
    }

    public function promote(User $user)
    {
        DB::update("UPDATE users SET is_submitter = 1 WHERE id = ?", [$user->id]);

        return back()->with('success', "{$user->name} promoted to submitter.");
    }

    public function demote(User $user)
    {
        DB::update("UPDATE users SET is_submitter = 0 WHERE id = ?", [$user->id]);

        return back()->with('success', "{$user->name} removed from submitter role.");
    }

    public function ban(User $user)
    {
        DB::update("UPDATE users SET is_banned = 1, muted_until = NULL WHERE id = ?", [$user->id]);

        return back()->with('success', "{$user->name} has been banned.");
    }

    public function unban(User $user)
    {
        DB::update("UPDATE users SET is_banned = 0 WHERE id = ?", [$user->id]);

        return back()->with('success', "{$user->name} has been unbanned.");
    }

    public function mute(Request $request, User $user)
    {
        $data = $request->validate([
            'duration' => 'required|integer|min:1',
        ]);

        $until = Carbon::now()->addMinutes($data['duration']);

        DB::update("UPDATE users SET muted_until = ? WHERE id = ?", [$until, $user->id]);

        return back()->with('success', "{$user->name} muted until {$until->toDateTimeString()}.");
    }

    public function clearMute(User $user)
    {
        DB::update("UPDATE users SET muted_until = NULL WHERE id = ?", [$user->id]);

        return back()->with('success', "Mute cleared for {$user->name}.");
    }
}
