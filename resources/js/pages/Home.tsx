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
  const visible = 6; // how many books to show at once
  const maxOffset = Math.max(0, books.length - visible);

  if (!books || books.length === 0) {
    return (
      <section className="py-4">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-sm text-foreground/70">No books to show yet.</p>
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
    <section className="relative py-4">
      {/* Title row */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      <div className="relative">
        {/* Arrows */}
        <button
          type="button"
          onClick={prev}
          disabled={!canPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/90 text-sm font-semibold text-foreground hover:bg-card disabled:opacity-40"
        >
          {"<"}
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!canNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/90 text-sm font-semibold text-foreground hover:bg-card disabled:opacity-40"
        >
          {">"}
        </button>

        {/* Books row */}
        <div className="overflow-hidden">
          <div className="overflow-hidden">
            <div className="flex justify-center gap-3 sm:gap-4 px-8 sm:px-10">
              {view.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="flex flex-col items-center w-24 sm:w-28 md:w-32 group"
                >
                  <div className="text-[11px] sm:text-xs font-medium text-center mb-2 h-8 overflow-hidden group-hover:underline">
                    {book.title}
                  </div>
                  <div className="w-full h-28 sm:h-32 md:h-36 overflow-hidden rounded border border-border bg-card flex items-center justify-center">
                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={`${book.title} cover`}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-foreground/60 px-1 text-center">
                        No cover
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Fade-out gradients at edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { auth, newReleases, topRated, newlyAdded } =
    usePage<HomeProps>().props;

  const rawUser = auth?.user as any | undefined;
  const isBanned = rawUser?.is_banned ?? false;

  return (
    <AppLayout>
      <h1 className="mb-2 text-2xl font-semibold">Home</h1>
      <p className="text-sm text-foreground/70">
        Discover new books, see what&apos;s popular, and join discussions.
      </p>

      {/* Carousels integrated into the page */}
      <section className="mt-6 space-y-4">
        <BookCarousel title="New Releases" books={newReleases} />
        <BookCarousel title="Top Rated" books={topRated} />
        <BookCarousel title="Newly Added" books={newlyAdded} />
      </section>

      {/* Submit a book CTA */}
      <section className="mt-10">
        {rawUser && !isBanned ? (
          <div className="rounded-lg border border-border bg-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                Submit a book for review
              </h2>
              <p className="mt-1 text-sm text-foreground/70">
                Found a book that&apos;s missing from the catalog? Submit it and
                an admin will review and add it to BookClub.
              </p>
            </div>
            <Link
              href="/books/submit"
              className="inline-flex items-center justify-center rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Submit a book
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                Want to submit a book?
              </h2>
              <p className="mt-1 text-sm text-foreground/70">
                Log in or create an account to suggest new books for the
                catalog.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/login"
                className="rounded border border-border px-4 py-2 text-sm hover:bg-card/80"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
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
