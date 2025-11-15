<?php

namespace App\Http\Controllers;

use App\Models\BookSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        // We'll build the detail page UI in the next step
        $submission->load('user');

        return Inertia::render('ReviewSubmissionDetail', [
            'submission' => $submission,
        ]);
    }

}
