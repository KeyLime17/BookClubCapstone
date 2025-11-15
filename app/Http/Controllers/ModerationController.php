<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Carbon;

class ModerationController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Moderation');
    }

    public function promote(User $user)
    {
        $user->is_submitter = true;
        $user->save();

        return back()->with('success', "{$user->name} promoted to submitter.");
    }

    public function demote(User $user)
    {
        $user->is_submitter = false;
        $user->save();

        return back()->with('success', "{$user->name} removed from submitter role.");
    }

    public function ban(User $user)
    {
        $user->is_banned = true;
        // optional: clear mute when fully banned
        $user->muted_until = null;
        $user->save();

        return back()->with('success', "{$user->name} has been banned.");
    }

    public function unban(User $user)
    {
        $user->is_banned = false;
        $user->save();

        return back()->with('success', "{$user->name} has been unbanned.");
    }

    public function mute(Request $request, User $user)
    {
        $data = $request->validate([
            'duration' => 'required|integer|min:1', // minutes
        ]);

        $until = Carbon::now()->addMinutes($data['duration']);

        $user->muted_until = $until;
        $user->save();

        return back()->with('success', "{$user->name} muted until {$until->toDateTimeString()}.");
    }

    public function clearMute(User $user)
    {
        $user->muted_until = null;
        $user->save();

        return back()->with('success', "Mute cleared for {$user->name}.");
    }
}
