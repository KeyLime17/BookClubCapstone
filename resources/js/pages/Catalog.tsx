import AppLayout from "@/layouts/AppLayout";

type Book = {
  id: number;
  title: string;
  author: string;
  released_at: string | null;
  cover_url?: string | null;
  genre: string;
};

type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  links: { url: string | null; label: string; active: boolean }[];
};

export default function Catalog({ books }: { books: Paginated<Book> }) {
  return (
    <AppLayout>
      <h1 className="mb-4 text-2xl font-semibold">Catalog</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.data.map((b) => (
          <article key={b.id} className="rounded-lg border bg-white p-4">
            <div className="aspect-[3/4] w-full overflow-hidden rounded bg-gray-100 mb-3" />
            <h3 className="font-semibold">{b.title}</h3>
            <p className="text-sm text-gray-600">{b.author} · {b.genre}</p>
            <p className="text-xs text-gray-500">
              {b.released_at ? new Date(b.released_at).getFullYear() : "—"}
            </p>
            {/* later: <Link href={`/books/${b.id}`}>View</Link> */}
          </article>
        ))}
      </div>

      {/* Simple pagination */}
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
