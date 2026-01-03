<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BookRatingController extends Controller
{
    // POST /books/{id}/rate  (create or update current user's rating)
    public function upsert(Request $request, int $id): RedirectResponse
    {
        $data = $request->validate([
            'rating' => ['required','integer','between:1,5'],
            'review' => ['nullable','string','max:2000'],
        ]);

        $userId = Auth::id();
        if (!$userId) abort(403);

        $exists = DB::table('books')->where('id', $id)->exists();
        if (!$exists) abort(404);

        DB::transaction(function () use ($userId, $id, $data) {
            // so it doesnt spam rate and do 500 server error
            $row = DB::table('ratings')
                ->where('user_id', $userId)
                ->where('book_id', $id)
                ->lockForUpdate()
                ->first();

            if ($row) {
                DB::table('ratings')
                    ->where('user_id', $userId)
                    ->where('book_id', $id)
                    ->update([
                        'rating'     => $data['rating'],
                        'review'     => $data['review'] ?? null,
                        'updated_at' => now(),
                    ]);
            } else {
                DB::table('ratings')->insert([
                    'user_id'    => $userId,
                    'book_id'    => $id,
                    'rating'     => $data['rating'],
                    'review'     => $data['review'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });

        return back();
    }


    // DELETE /books/{id}/rate  (remove current user's rating for this book)
    public function destroy(Request $request, int $id): RedirectResponse
    {
        $userId = Auth::id();
        if (!$userId) abort(403);

        DB::table('ratings')
            ->where('user_id', $userId)
            ->where('book_id', $id)
            ->delete();

        return back();
    }
}
