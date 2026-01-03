<?php

namespace App\Http\Controllers;

use App\Models\BookSubmission;
use App\Models\Book;
use App\Models\Club;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BookSubmissionController extends Controller
{
    // Show the submit-book page (we'll build the React page next)
    public function create()
    {
        return Inertia::render('BookSubmit'); // BookSubmit.jsx/tsx coming later
    }

    // Handle form POST
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'  => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'image'  => 'nullable|image|max:2048',  // ~2MB
            'link'   => 'nullable|url|max:2048',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')
                ->storePublicly('book_covers', 's3'); // storage/app/public/book_covers
        }
        

        BookSubmission::create([
            'user_id'    => Auth::id(),
            'title'      => $data['title'],
            'author'     => $data['author'],
            'image_path' => $imagePath ?: null,
            'link'       => $data['link'] ?? null,
            'status'     => 'pending',
        ]);

        return redirect()
            ->back()
            ->with('success', 'Book submitted for review.');
    }

    public function index(): Response
    {
        // Pending only, submitters first, then by oldest
        $submissions = BookSubmission::with('user')
            ->where('status', 'pending')
            ->join('users', 'users.id', '=', 'book_submissions.user_id')
            ->orderByDesc('users.is_submitter')
            ->orderBy('book_submissions.created_at')
            ->select('book_submissions.*')
            ->get();

        return Inertia::render('ReviewSubmissions', [
            'submissions' => $submissions,
        ]);
    }


    public function show(BookSubmission $submission): Response
    {
        $submission->load('user');

        $genres = DB::table('genres')
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        $imageUrl = $submission->image_path
            ? Storage::disk('s3')->url($submission->image_path)
            : null;

        return Inertia::render('ReviewSubmissionDetail', [
            'submission' => $submission,
            'genres'     => $genres,
            'imageUrl'   => $imageUrl,
        ]);
    }



    public function approve(Request $request, BookSubmission $submission)
{
    $data = $request->validate([
        'description' => 'nullable|string',
        'released_at' => 'nullable|date',
        'genre_id'    => 'required|exists:genres,id',
    ]);

    DB::transaction(function () use ($submission, $data) {
        $book = Book::create([
            'title'       => $submission->title,
            'author'      => $submission->author,
            'genre_id'    => $data['genre_id'],
            'description' => $data['description'] ?? null,
            'released_at' => $data['released_at'] ?? null,
            'cover_url' => $submission->image_path 
            ? Storage::disk('s3')->url($submission->image_path)
            : null,
        ]);

        $submission->status      = 'approved';
        $submission->reviewer_id = Auth::id();
        $submission->reviewed_at = now();
        $submission->save();

        $exists = Club::where('book_id', $book->id)
            ->where('is_public', true)
            ->exists();

        if (!$exists) {
            Club::create([
                'name'      => $book->title . ' - Global Discussion',
                'book_id'   => $book->id,
                'is_public' => true,
                'owner_id'  => null,
            ]);
        }
    });

    return redirect()
        ->route('review.index')
        ->with('success', 'Submission approved, book added to catalog, and global discussion created.');
}




    public function reject(Request $request, BookSubmission $submission)
    {
        // description optional on reject – change to 'required' if you want a reason
        $data = $request->validate([
            'description'  => 'nullable|string',
            'release_date' => 'nullable|date',
        ]);

        $submission->update([
            'description'  => $data['description'] ?? $submission->description,
            'release_date' => $data['release_date'] ?? $submission->release_date,
            'status'       => 'rejected',
            'reviewer_id'  => Auth::id(),
            'reviewed_at'  => now(),
        ]);

        return redirect()->route('review.index')
            ->with('success', 'Submission rejected.');
    }

}
