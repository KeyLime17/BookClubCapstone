import React, { useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { Link, usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";

type BookSummary = {
  id: number;
  title: string;
  cover_url?: string | null;
};

type HomeProps = PageProps & {
  newReleases: BookSummary[];
  topRated: BookSummary[];
  newlyAdded: BookSummary[];
};

function BookCarousel({
  title,
  books,
}: {
  title: string;
  books: BookSummary[];
}) {
  const [offset, setOffset] = useState(0);
  const visible = 5; // how many books to show at once
  const maxOffset = Math.max(0, books.length - visible);

  if (!books || books.length === 0) {
    return (
      <section className="rounded-lg border bg-white/60 p-4">
        <h2 className="text-lg font-semibold mb-2 text-center">{title}</h2>
        <p className="text-sm text-gray-600 text-center">No books to show yet.</p>
      </section>
    );
  }

  const canPrev = offset > 0;
  const canNext = offset < maxOffset;

  const view = books.slice(offset, offset + visible);

  const prev = () => {
    if (!canPrev) return;
    setOffset((prev) => Math.max(0, prev - 1));
  };

  const next = () => {
    if (!canNext) return;
    setOffset((prev) => Math.min(maxOffset, prev + 1));
  };

  return (
    <section className="relative rounded-lg border bg-white/60 p-6">
      {/* Title centered */}
      <h2 className="text-lg font-semibold text-center mb-4">{title}</h2>

      {/* Left arrow */}
      <button
        type="button"
        onClick={prev}
        disabled={!canPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border bg-white/80 px-2 py-1 text-sm hover:bg-white disabled:opacity-40"
      >
        ◀
      </button>

      {/* Right arrow */}
      <button
        type="button"
        onClick={next}
        disabled={!canNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border bg-white/80 px-2 py-1 text-sm hover:bg-white disabled:opacity-40"
      >
        ▶
      </button>

      {/* Books row, centered */}
      <div className="flex justify-center gap-4 overflow-hidden px-8">
        {view.map((book) => (
          <Link
            key={book.id}
            href={`/books/${book.id}`}
            className="flex flex-col items-center w-24 md:w-28 lg:w-32 group"
          >
            <div className="text-xs font-medium text-center mb-2 h-8 overflow-hidden group-hover:underline">
              {book.title}
            </div>
            <div className="aspect-[3/4] w-full overflow-hidden rounded border bg-gray-100 flex items-center justify-center">
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={`${book.title} cover`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-[10px] text-gray-500 px-1 text-center">
                  No cover
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { auth, newReleases, topRated, newlyAdded } =
    usePage<HomeProps>().props;

  // auth.user in your types only has name/email, so cast to any
  const rawUser = auth?.user as any | undefined;
  const isBanned = rawUser?.is_banned ?? false;

  return (
    <AppLayout>
      <h1 className="mb-2 text-2xl font-semibold">Home</h1>
      <p className="text-sm text-gray-600">
        Discover new books, see what&apos;s popular, and join discussions.
      </p>

      {/* Carousels */}
      <section className="mt-8 space-y-6">
        <BookCarousel title="New Releases" books={newReleases} />
        <BookCarousel title="Top Rated" books={topRated} />
        <BookCarousel title="Newly Added" books={newlyAdded} />
      </section>

      {/* Submit a book CTA */}
      <section className="mt-10">
        {rawUser && !isBanned ? (
          <div className="rounded-lg border bg-white p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                Submit a book for review
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Found a book that&apos;s missing from the catalog? Submit it and
                an admin will review and add it to BookClub.
              </p>
            </div>
            <Link
              href="/books/submit"
              className="inline-flex items-center justify-center rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Submit a book
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border bg-white p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                Want to submit a book?
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Log in or create an account to suggest new books for the
                catalog.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/login"
                className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </section>
    </AppLayout>
  );
}
