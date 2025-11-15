<?php

namespace App\Http\Controllers;

use App\Models\BookSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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
}
