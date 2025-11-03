<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    ClubController,
    MessageController,
    InvitationController
};

// Public/global clubs listing & details
Route::get('/clubs', [ClubController::class, 'index']);
Route::get('/clubs/{club}', [ClubController::class, 'show']);

// Guests can read messages for PUBLIC clubs
Route::get('/clubs/{club}/messages', [MessageController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    // Create PRIVATE club
    Route::post('/clubs', [ClubController::class, 'store']);

    // Join/leave PUBLIC club
    Route::post('/clubs/{club}/join', [ClubController::class, 'join']);
    Route::post('/clubs/{club}/leave', [ClubController::class, 'leave']);

    // Post messages
    Route::post('/clubs/{club}/messages', [MessageController::class, 'store'])
        ->middleware('throttle:30,1'); // optional spam control

    // Private club invitations
    Route::post('/clubs/{club}/invites', [InvitationController::class, 'create']);
    Route::post('/invites/{token}/accept', [InvitationController::class, 'accept']);
});

Route::middleware('auth:sanctum')->get('/users/search', function (Request $request) {
    $q = trim((string)$request->query('q', ''));
    if ($q === '') return [];
    return User::query()
        ->select('id','name')
        ->where('name', 'like', "%{$q}%")
        ->orderBy('name')
        ->limit(10)
        ->get();
});
