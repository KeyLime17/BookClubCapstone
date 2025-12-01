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
  const [offset, setOffset] = useState(0);        // desktop/tablet index
  const [current, setCurrent] = useState(0);      // mobile index
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [isMobile, setIsMobile] = useState(false);

  // Decide how many books to show & whether we are in "mobile" mode
  React.useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setIsMobile(true);
        setItemsPerPage(1);
      } else if (w < 1024) {
        setIsMobile(false);
        setItemsPerPage(4);
      } else {
        setIsMobile(false);
        setItemsPerPage(6);
      }
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  if (!books || books.length === 0) {
    return (
      <section className="py-4">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-sm text-foreground/70">No books to show yet.</p>
      </section>
    );
  }

  // Desktop/tablet logic
  const visible = itemsPerPage;
  const maxOffset = Math.max(0, books.length - visible);
  const canPrevDesktop = offset > 0;
  const canNextDesktop = offset < maxOffset;

  const prevDesktop = () => {
    if (!canPrevDesktop) return;
    setOffset((prev) => Math.max(0, prev - 1));
  };

  const nextDesktop = () => {
    if (!canNextDesktop) return;
    setOffset((prev) => Math.min(maxOffset, prev + 1));
  };

  // Mobile logic: one book at a time with sliding animation
  const maxIndexMobile = books.length - 1;
  const canPrevMobile = current > 0;
  const canNextMobile = current < maxIndexMobile;

  const prevMobile = () => {
    if (!canPrevMobile) return;
    setCurrent((c) => Math.max(0, c - 1));
  };

  const nextMobile = () => {
    if (!canNextMobile) return;
    setCurrent((c) => Math.min(maxIndexMobile, c + 1));
  };

  return (
    <section className="relative py-4">
      {/* Title row */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      {/* MOBILE: single-slide animated carousel */}
      {isMobile ? (
        <div className="relative">
          {/* Arrows */}
          <button
            type="button"
            onClick={prevMobile}
            disabled={!canPrevMobile}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/90 text-sm font-semibold text-foreground hover:bg-card disabled:opacity-40"
          >
            {"<"}
          </button>
          <button
            type="button"
            onClick={nextMobile}
            disabled={!canNextMobile}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/90 text-sm font-semibold text-foreground hover:bg-card disabled:opacity-40"
          >
            {">"}
          </button>

          <div className="overflow-hidden">
            {/* Whole strip sliding left/right */}
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {books.map((book) => (
                <div key={book.id} className="min-w-full flex justify-center px-8">
                  <Link
                    href={`/books/${book.id}`}
                    className="flex flex-col items-center w-40 group"
                  >
                    <div className="text-sm font-medium text-center mb-2 h-10 overflow-hidden group-hover:underline">
                      {book.title}
                    </div>
                    <div className="w-full h-40 overflow-hidden rounded border border-border bg-card flex items-center justify-center">
                      {book.cover_url ? (
                        <img
                          src={book.cover_url}
                          alt={`${book.title} cover`}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-[11px] text-foreground/60 px-1 text-center">
                          No cover
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Fades on edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent z-10" />
        </div>
      ) : (
        // DESKTOP/TABLET: multi-item sliding strip
        <div className="relative">
          {/* Arrows */}
          <button
            type="button"
            onClick={prevDesktop}
            disabled={!canPrevDesktop}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/90 text-sm font-semibold text-foreground hover:bg-card disabled:opacity-40"
          >
            {"<"}
          </button>
          <button
            type="button"
            onClick={nextDesktop}
            disabled={!canNextDesktop}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/90 text-sm font-semibold text-foreground hover:bg-card disabled:opacity-40"
          >
            {">"}
          </button>

          <div className="overflow-hidden">
            <div
              className="flex gap-3 sm:gap-4 px-8 sm:px-10 transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(-${(offset * 100) / visible}%)`,
              }}
            >
              {books.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="group flex flex-col items-center"
                  style={{
                    // each item takes 1/visible of the viewport width
                    width: `${100 / visible}%`,
                    flexShrink: 0,
                  }}
                >
                  <div className="text-[11px] sm:text-xs font-medium text-center mb-2 h-8 overflow-hidden group-hover:underline px-1">
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
      )}
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
