import AppLayout from "@/Layouts/AppLayout";
import { Link } from "@inertiajs/react";

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

export default function BookPage({ book }: { book: Book }) {
  const year = book.released_at ? new Date(book.released_at).getFullYear() : null;

  return (
    <AppLayout>
      {/* breadcrumb */}
      <nav className="mb-4 text-sm">
        <Link href="/catalog" className="text-gray-600 hover:underline">
          Catalog
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-800">{book.title}</span>
      </nav>

      {/* HERO: two columns on md+, single column on mobile */}
      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        {/* LEFT (md+): title/meta + ratings + description */}
        <section className="space-y-5 md:order-1">
          <header>
            <h1 className="text-2xl font-semibold">{book.title}</h1>
            <p className="mt-1 text-gray-700">
              {book.author} · {book.genre}
              {year ? ` · ${year}` : ""}
            </p>
          </header>

          {/* Ratings panel (placeholder) */}
          <div className="rounded-lg border bg-white p-4">
            <h2 className="mb-2 font-medium">Ratings</h2>
            <p className="mb-3 text-sm text-gray-600">No ratings yet — coming soon.</p>
            <div className="flex items-center gap-1" aria-label="Rate this book (coming soon)">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  viewBox="0 0 20 20"
                  className="h-5 w-5 text-gray-300"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10 15.27l-5.18 3.05 1.4-5.99L1 7.97l6.09-.52L10 1.5l2.91 5.95 6.09.52-5.22 4.36 1.4 5.99L10 15.27z" />
                </svg>
              ))}
            </div>
          </div>

          {book.description && (
            <div className="rounded-lg border bg-white p-4">
              <h2 className="mb-2 font-medium">About this book</h2>
              <p className="text-sm text-gray-700 whitespace-pre-line">{book.description}</p>
            </div>
          )}
        </section>

        {/* RIGHT (md+): cover image (fixed aspect, no stretch) */}
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

      {/* DISCUSSION: full width below the hero row */}
      <section className="mt-6 rounded-lg border bg-white p-4">
        <h2 className="mb-3 font-medium">Discussion</h2>
        <p className="text-sm text-gray-600">
          Discussion threads and chat will appear here in a later milestone.
        </p>
      </section>
    </AppLayout>
  );
}
