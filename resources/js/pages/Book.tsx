import AppLayout from "@/layouts/AppLayout";
import { Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import type { PageProps } from "@/types";
import ChatBox from "@/components/ChatBox";

type Book = {
  id: number;
  title: string;
  author: string;
  genre: string;
  genre_slug: string;
  released_at: string | null;
  cover_url?: string | null;
  description?: string | null;
};

type MyRating = { id?: number; rating: number; review?: string | null } | null;

type Props = {
  book: Book;
  avg_rating: number | null;
  ratings_count: number;
  my_rating: MyRating;
  my_private_club_id?: number | null;
};

export default function BookPage({ book, avg_rating, ratings_count, my_rating, my_private_club_id }: Props) {
  const year = book.released_at ? new Date(book.released_at).getFullYear() : null;
  const { auth } = usePage<PageProps>().props;

  // local state for user's rating
  const [mine, setMine] = useState<number | null>(my_rating?.rating ?? null);

  const submitRating = (value: number) => {
    setMine(value); // optimistic
    router.post(
      `/books/${book.id}/rate`,
      { rating: value }, 
      { preserveScroll: true, replace: true }
    );
  };

  const removeRating = () => {
    setMine(null); // optimistic
    router.delete(`/books/${book.id}/rate`, { preserveScroll: true, replace: true });
  };

  // simple star
  const Star = ({ filled, onClick, label }: { filled: boolean; onClick?: () => void; label: string }) => (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="h-6 w-6 text-yellow-500/80"
      title={label}
    >
      <svg viewBox="0 0 20 20" className={`h-full w-full ${filled ? "" : "text-gray-300"}`} fill="currentColor">
        <path d="M10 15.27l-5.18 3.05 1.4-5.99L1 7.97l6.09-.52L10 1.5l2.91 5.95 6.09.52-5.22 4.36 1.4 5.99L10 15.27z" />
      </svg>
    </button>
  );

  const avgRounded = avg_rating ? Math.round(avg_rating) : 0;

  return (
    <AppLayout>
      {/* breadcrumb */}
      <nav className="mb-4 text-sm hidden sm:block">
        <Link href="/catalog" className="text-foreground/70 hover:underline">
          Catalog
        </Link>
        <span className="mx-2 text-foreground/40">/</span>
        <span className="text-foreground">{book.title}</span>
      </nav>

      {/* HERO: details/ratings LEFT, cover RIGHT */}
      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        {/* LEFT: title/meta + ratings + description */}
        <section className="space-y-5 md:order-1">
          <header>
            <h1 className="text-2xl font-semibold">{book.title}</h1>
            <p className="mt-1 text-gray-700">
              {book.author} · {book.genre}
              {year ? ` · ${year}` : ""}
            </p>
          </header>

          {/* Ratings – merged average + your rating */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-2 font-medium">Ratings</h2>

            {/* Top row: average summary + login prompt */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-foreground/80">
                Average: {avg_rating ? avg_rating.toFixed(1) : "—"} ({ratings_count})
              </span>

              {!auth?.user && (
                <p className="text-xs text-foreground/70">
                  <Link href="/login" className="underline">
                    Log in
                  </Link>{" "}
                  to rate this book.
                </p>
              )}
            </div>

            {/* Stars */}
            <div className="mt-3 flex items-center gap-3">
              {auth?.user ? (
                // Logged-in: interactive merged stars (yellow avg + blue overlay for mine)
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const val = i + 1;
                    const avgFilled = val <= avgRounded;
                    const mineFilled = mine != null && val <= mine;

                    return (
                      <button
                        key={val}
                        type="button"
                        aria-label={`Set my rating to ${val}`}
                        onClick={() => submitRating(val)}
                        className="h-6 w-6"
                      >
                        <div className="relative h-full w-full">
                          {/* Base: average rating (yellow) */}
                          <svg
                            viewBox="0 0 20 20"
                            className={`absolute inset-0 h-full w-full ${
                              avgFilled
                                ? "text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                            fill="currentColor"
                          >
                            <path d="M10 15.27l-5.18 3.05 1.4-5.99L1 7.97l6.09-.52L10 1.5l2.91 5.95 6.09.52-5.22 4.36 1.4 5.99L10 15.27z" />
                          </svg>

                          {/* Overlay: my rating (blue, semi-transparent) */}
                          {mineFilled && (
                            <svg
                              viewBox="0 0 20 20"
                              className="absolute inset-0 h-full w-full text-blue-500/30"
                              fill="currentColor"
                            >
                              <path d="M10 15.27l-5.18 3.05 1.4-5.99L1 7.97l6.09-.52L10 1.5l2.91 5.95 6.09.52-5.22 4.36 1.4 5.99L10 15.27z" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                // Logged-out: read-only average stars
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const val = i + 1;
                    const avgFilled = val <= avgRounded;
                    return (
                      <div key={val} className="h-6 w-6" aria-hidden="true">
                        <svg
                          viewBox="0 0 20 20"
                          className={`h-full w-full ${
                            avgFilled
                              ? "text-yellow-400"
                              : "text-muted-foreground/30"
                          }`}
                          fill="currentColor"
                        >
                          <path d="M10 15.27l-5.18 3.05 1.4-5.99L1 7.97l6.09-.52L10 1.5l2.91 5.95 6.09.52-5.22 4.36 1.4 5.99L10 15.27z" />
                        </svg>
                      </div>
                    );
                  })}
                </div>
              )}

              {auth?.user &&
                (mine ? (
                  <button
                    type="button"
                    onClick={removeRating}
                    className="text-xs text-foreground/70 underline"
                  >
                    Remove my rating
                  </button>
                ) : (
                  <span className="text-xs text-foreground/60">
                    Click a star to rate.
                  </span>
                ))}
            </div>
          </div>

          {book.description && (
            <div className="rounded-lg border bg-white p-4">
              <h2 className="mb-2 font-medium">About this book</h2>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {book.description}
              </p>
            </div>
          )}
        </section>

        {/* RIGHT: cover image */}
        <section className="rounded-lg border bg-white p-3 flex justify-center md:order-2">
          <div className="aspect-[3/4] w-full max-w-[360px] overflow-hidden rounded bg-gray-100">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={`${book.title} cover`}
                className="h-full w-full object-contain"
              />
            ) : null}
          </div>
        </section>
      </div>

      {/* DISCUSSION: public club chat for this book */}
      <section className="mt-6 space-y-4">
        <ChatBox bookId={book.id} canPost={!!auth?.user} />

        {auth?.user &&
          (my_private_club_id ? (
            <a
              href={`/clubs/${my_private_club_id}/chat`}
              className="inline-flex items-center text-sm px-3 py-2 rounded border hover:bg-gray-50"
            >
              Go to your private chat
            </a>
          ) : (
            <form method="post" action={`/books/${book.id}/private-club`}>
              <input
                type="hidden"
                name="_token"
                value={
                  (document.querySelector(
                    'meta[name="csrf-token"]'
                  ) as HTMLMetaElement)?.content || ""
                }
              />
              <button
                type="submit"
                className="text-sm px-3 py-2 rounded border hover:bg-gray-50"
              >
                Create a private chat for this book
              </button>
            </form>
          ))}
      </section>
    </AppLayout>
  );

}
