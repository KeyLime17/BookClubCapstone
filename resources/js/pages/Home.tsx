import AppLayout from "@/layouts/AppLayout";
import { Link, usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";

export default function Home() {
  const { auth } = usePage<PageProps>().props;

  // auth.user in your types only has name/email, so cast to any
  const rawUser = auth?.user as any | undefined;
  const isBanned = rawUser?.is_banned ?? false;

  return (
    <AppLayout>
      <h1 className="mb-2 text-2xl font-semibold">Home</h1>
      <p className="text-sm text-gray-600">
        Welcome to BookClub. We’ll add trending books here later.
      </p>

      {/* Placeholder sections: trending etc. */}
      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="text-lg font-semibold mb-2">Trending Books</h2>
          <p className="text-sm text-gray-600">
            Placeholder section for future trending or popular titles.
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <h2 className="text-lg font-semibold mb-2">New Releases</h2>
          <p className="text-sm text-gray-600">
            Placeholder section for recently added or newly released books.
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <h2 className="text-lg font-semibold mb-2">Top Rated</h2>
          <p className="text-sm text-gray-600">
            Placeholder section for books with the highest community ratings.
          </p>
        </div>
      </section>

      {/* Submit a book CTA */}
      <section className="mt-10">
        {rawUser && !isBanned ? (
          <div className="rounded-lg border bg-white p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Submit a book for review</h2>
              <p className="mt-1 text-sm text-gray-600">
                Found a book that&apos;s missing from the catalog? Submit it and an
                admin will review and add it to BookClub.
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
              <h2 className="text-lg font-semibold">Want to submit a book?</h2>
              <p className="mt-1 text-sm text-gray-600">
                Log in or create an account to suggest new books for the catalog.
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
