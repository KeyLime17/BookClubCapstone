<?php

namespace App\Http\Controllers;

use App\Models\Club;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ClubController extends Controller
{
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


    //Invite user controller
    public function inviteUser(Request $request, Club $club)
    {
        $this->authorize('invite', $club);

        $data = $request->validate([
            'user_id' => ['nullable','exists:users,id'],
            'name'    => ['nullable','string','max:120'],
        ]);

        // Resolve a user either by id or by an exact name match
        $target = null;
        if (!empty($data['user_id'])) {
            $target = User::find($data['user_id']);
        } elseif (!empty($data['name'])) {
            $target = User::where('name', $data['name'])->first();
        }

        if (!$target) {
            return back()->withErrors(['invite' => 'User not found.']);
        }

        // already a member?
        $exists = $club->members()->where('user_id', $target->id)->exists();
        if ($exists) {
            return back()->with('status', 'User is already a member.');
        }

        $club->members()->create([
            'user_id'   => $target->id,
            'role'      => 'member',
            'joined_at' => now(),
        ]);

        return response()->json(['ok' => true]);
    }
}
