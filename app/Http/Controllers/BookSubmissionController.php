<?php

namespace App\Http\Controllers;

use App\Models\BookSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Book;
use Illuminate\Support\Facades\DB;

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
                ->store('book_covers', 'public'); // storage/app/public/book_covers
        }

        BookSubmission::create([
            'user_id'    => Auth::id(),
            'title'      => $data['title'],
            'author'     => $data['author'],
            'image_path' => $imagePath,
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

        return Inertia::render('ReviewSubmissionDetail', [
            'submission' => $submission,
        ]);
    }

    public function approve(Request $request, BookSubmission $submission)
    {
        $data = $request->validate([
            'description'  => 'required|string',
            'release_date' => 'required|date',
            'image'        => 'nullable|image|max:2048',
        ]);

        DB::transaction(function () use ($submission, $data, $request) {
            $imagePath = $submission->image_path;

            // If admin uploaded a new image, store it and override
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')
                    ->store('book_covers', 'public');
            }

            $submission->update([
                'description'  => $data['description'],
                'release_date' => $data['release_date'],
                'image_path'   => $imagePath,
                'status'       => 'approved',
                'reviewer_id'  => Auth::id(),
                'reviewed_at'  => now(),
            ]);

            $defaultGenreId = 5; // Nonfiction fallback

            Book::create([
                'title'       => $submission->title,
                'author'      => $submission->author,
                'cover_url'   => $imagePath ? '/storage/' . $imagePath : null,
                'description' => $data['description'],
                'released_at' => $data['release_date'],
                'genre_id'    => $defaultGenreId,
            ]);
        });

        return redirect()->route('review.index')
            ->with('success', 'Book approved and added to catalog.');
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
