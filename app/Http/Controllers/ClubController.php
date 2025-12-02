<?php

namespace App\Http\Controllers;

use App\Models\Club;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ClubController extends Controller
{
    use AuthorizesRequests;
    /**
     * List clubs.
     * By default returns only public (global) clubs.
     * Filters:
     *  - only_public (bool)
     *  - book_id (int)
     *  - q (string, name search)
     */
    public function index(Request $request)
    {
        $q = Club::query()
            ->withCount('members')
            ->with(['book:id,title']);

        if ($request->boolean('only_public', true)) {
            $q->where('is_public', true);
        }

        if ($request->filled('book_id')) {
            $q->where('book_id', $request->integer('book_id'));
        }

        if ($request->filled('q')) {
            $q->where('name', 'like', '%' . trim($request->get('q')) . '%');
        }

        return $q->orderByDesc('members_count')->paginate(20);
    }

    public function myClubs(Request $request)
    {
        $uid = $request->user()->getAuthIdentifier();

        $clubs = Club::query()
            ->where(function ($q) use ($uid) {
                $q->where('owner_id', $uid)
                  ->orWhereHas('members', fn($m) => $m->where('user_id', $uid));
            })
            ->withCount('members')
            ->with(['owner:id,name'])
            ->orderByDesc('is_public')   // show private first
            ->orderBy('name')
            ->get(['id','name','book_id','is_public','owner_id']);

        return Inertia::render('PrivateClubs', [
            'clubs' => $clubs,
        ]);
    }

    public function leaveWeb(Request $request, Club $club)
    {
        $uid = $request->user()->getAuthIdentifier();

        // owner cannot leave without reassigning (simplest rule)
        if ((int)$club->owner_id === (int)$uid) {
            return back()->with('error', 'Owners cannot leave their own club.');
        }

        $club->members()->where('user_id', $uid)->delete();

        return back()->with('success', 'You left the club.');
    }

    /**
     * Show a club (policy restricts private visibility).
     */
    public function show(Request $request, Club $club)
    {
        $this->authorize('view', $club);

        return $club->load([
            'book:id,title',
            'owner:id,name',
        ]);
    }

    /**
     * Create a PRIVATE club.
     * Public/global clubs should be seeded/admin-created.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name'      => ['required', 'string', 'max:120'],
            'book_id'   => ['nullable', 'exists:books,id'],
            'is_public' => ['required', 'boolean'],
        ]);

        if ($data['is_public'] === true) {
            return response()->json(['message' => 'Use admin flow to create public/global clubs.'], 422);
        }

        $club = Club::create([
            'name'       => $data['name'],
            'book_id'    => $data['book_id'] ?? null,
            'is_public'  => false,
            'owner_id'   => $user->id,
        ]);

        // owner becomes member with owner role
        $club->members()->create([
            'user_id'   => $user->id,
            'role'      => 'owner',
            'joined_at' => now(),
        ]);

        return response()->json($club->fresh(), 201);
    }

    /**
     * Join a PUBLIC club (private clubs use invite flow).
     */
    public function join(Request $request, Club $club)
    {
        if (!$club->is_public) {
            return response()->json(['message' => 'Private clubs require an invitation.'], 403);
        }

        $request->user()
            ->clubs()
            ->syncWithoutDetaching([$club->id => ['role' => 'member']]);

        return response()->noContent();
    }


    /**
     * delete a club
     */
    public function destroy(Club $club)
    {
        // 1) Policy: only owner can delete
        $this->authorize('delete', $club);

        // 2) Never delete public/global clubs this way
        if ($club->is_public) {
            abort(403, 'You cannot delete public/global clubs.');
        }

        // 3) Remove all membership rows from pivot table
        $club->members()->detach();

        // 4) Delete all messages for this club
        // via relation (preferred):
        $club->messages()->delete();

        // If you didn’t add the relation, equivalently:
        // \App\Models\Message::where('club_id', $club->id)->delete();

        // 5) Delete the club itself
        $club->delete();

        return redirect()
            ->route('clubs.private')
            ->with('success', 'Club and its messages were deleted.');
    }

    /**
     * Rename a club
     */
    public function updateName(Club $club, Request $request)
    {
        // Only owner can rename; reuse your policy:
        $this->authorize('delete', $club); // or create a dedicated 'update' policy

        if ($club->is_public) {
            abort(403, 'You cannot rename public/global clubs here.');
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $club->name = $data['name'];
        $club->save();

        if ($request->wantsJson()) {
            return response()->json(['status' => 'ok']);
        }

        return redirect()
            ->route('clubs.private')
            ->with('success', 'Club renamed.');
    }


    /**
     * Leave any club.
     */
    public function leave(Request $request, Club $club)
    {
        $club->members()
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->noContent();
    }
    public function createPrivateForBook(\Illuminate\Http\Request $request, \App\Models\Book $book)
    {
        $user = $request->user();

        // Either reuse existing private club for this owner+book or create a new one
        $club = \App\Models\Club::firstOrCreate(
            [
                'book_id'   => $book->id,
                'owner_id'  => $user->id,
                'is_public' => false,
            ],
            [
                'name'      => 'Private: '.$book->title,
            ]
        );

        // Ensure owner is a member with role=owner
        $club->members()->firstOrCreate(
            ['user_id' => $user->id],
            ['role' => 'owner', 'joined_at' => now()]
        );

        return redirect()->route('clubs.chat', ['club' => $club->id]);
    }

    public function inviteUser(Request $request, \App\Models\Club $club)
    {
        $user = $request->user();

        // Only owner or moderators can invite (same rule as manage())
        $canManage = ((int)$club->owner_id === (int)$user->id)
            || $club->members()->where('user_id',$user->id)->where('role','moderator')->exists();

        if (!$canManage) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        // Attach as member if not already in
        $club->members()->firstOrCreate(
            ['user_id' => $data['user_id']],
            ['role' => 'member', 'joined_at' => now()]
        );

        return response()->json(['ok' => true], 201);
    }

}
