import AppLayout from "@/layouts/AppLayout";
import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";

type Book = {
  id: number;
  title: string;
  author: string;
  released_at: string | null;
  cover_url?: string | null;
  genre: string;
  genre_slug: string;
};

type Link = { url: string | null; label: string; active: boolean };

type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  links: Link[];
};

type Genre = { id: number; name: string; slug: string };

type Props = {
  books: Paginated<Book>;
  genres: Genre[];
  filters: { q?: string | null; genre?: string | null; from?: string | null; to?: string | null };
};

export default function Catalog({ books, genres, filters }: Props) {
  // local form state (initialized from server-provided filters)
  const [q, setQ] = useState(filters.q ?? "");
  const [genre, setGenre] = useState(filters.genre ?? "");
  const [from, setFrom] = useState(filters.from ?? "");
  const [to, setTo] = useState(filters.to ?? "");

  // submit filters with GET (Inertia)
  const apply = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params: Record<string, string> = {};
    if (q.trim()) params.q = q.trim();
    if (genre) params.genre = genre;
    if (from) params.from = from;
    if (to) params.to = to;

    router.get("/catalog", params, {
      preserveState: true,
      replace: true, // cleaner history
      preserveScroll: true,
    });
  };

  const reset = () => {
    setQ("");
    setGenre("");
    setFrom("");
    setTo("");
    router.get("/catalog", {}, { preserveState: false, replace: true, preserveScroll: true });
  };

  return (
    <AppLayout>
      <h1 className="mb-4 text-2xl font-semibold">Catalog</h1>

      {/* Filters */}
      <form onSubmit={apply} className="mb-6 grid gap-3 md:grid-cols-5">
        <input
          type="text"
          placeholder="Search title or author"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="rounded border px-3 py-2 md:col-span-2"
        />

        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.slug}>{g.name}</option>
          ))}
        </select>

        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded border px-3 py-2"
          aria-label="From date"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded border px-3 py-2"
          aria-label="To date"
        />

        <div className="flex gap-2 md:col-span-5">
          <button type="submit" className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800">
            Apply
          </button>
          <button type="button" onClick={reset} className="rounded px-4 py-2 text-sm ring-1 ring-gray-300 hover:bg-gray-100">
            Reset
          </button>
        </div>
      </form>

      {/* Results */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.data.map((b) => (
          <Link key={b.id} href={`/books/${b.id}`} className="rounded-lg border bg-white p-4 block hover:shadow">
            <div className="mb-3 aspect-[3/4] w-full overflow-hidden rounded bg-gray-100" />
            <h3 className="font-semibold">{b.title}</h3>
            <p className="text-sm text-gray-600">{b.author} · {b.genre}</p>
            <p className="text-xs text-gray-500">
              {b.released_at ? new Date(b.released_at).getFullYear() : "—"}
            </p>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <nav className="mt-6 flex flex-wrap gap-2">
        {books.links.map((l, i) => (
          <a
            key={i}
            href={l.url ?? "#"}
            className={`rounded px-3 py-1 text-sm ring-1 ring-gray-300 ${l.active ? "bg-gray-200" : "hover:bg-gray-100"}`}
            dangerouslySetInnerHTML={{ __html: l.label }}
            aria-disabled={!l.url}
            onClick={(e) => { if (!l.url) e.preventDefault(); }}
          />
        ))}
      </nav>
    </AppLayout>
  );
}
