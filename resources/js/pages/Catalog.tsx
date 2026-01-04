import AppLayout from "@/layouts/AppLayout";
import { router, Link as InertiaLink } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";

type Book = {
  id: number;
  title: string;
  author: string;
  released_at: string | null;
  cover_url?: string | null;
  genre: string;
  genre_slug: string;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  links: PaginationLink[];
};

type Genre = { id: number; name: string; slug: string };

type Props = {
  books: Paginated<Book>;
  genres: Genre[];
  filters: {
    q?: string | null;
    genres?: string[] | null;
    from?: string | null;
    to?: string | null;
    // (optional legacy support if your controller still sends it sometimes)
    genre?: string | null;
  };
  favorited_ids?: number[];
};

type ViewMode = "comfortable" | "compact" | "dense";

export default function Catalog({ books, genres, filters, favorited_ids }: Props) {
  // local form state (initialized from server-provided filters)
  const [q, setQ] = useState(filters.q ?? "");

  const initialGenres =
    (Array.isArray(filters.genres) && filters.genres) ||
    (filters.genre ? [filters.genre] : []);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialGenres);

  const [from, setFrom] = useState(filters.from ?? "");
  const [to, setTo] = useState(filters.to ?? "");

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [genresOpen, setGenresOpen] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>("comfortable");

  const genreMenuRef = useRef<HTMLDivElement | null>(null);

  const [favIds, setFavIds] = useState<number[]>(favorited_ids ?? []);

  useEffect(() => {
    setFavIds(favorited_ids ?? []);
  }, [favorited_ids]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!genresOpen) return;
      const el = genreMenuRef.current;
      if (el && !el.contains(e.target as Node)) setGenresOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [genresOpen]);

  // submit filters with GET (Inertia)
  const apply = (e?: React.FormEvent) => {
    e?.preventDefault();

    const params: Record<string, any> = {};
    if (q.trim()) params.q = q.trim();
    if (selectedGenres.length > 0) params.genres = selectedGenres;
    if (from) params.from = from;
    if (to) params.to = to;

    router.get("/catalog", params, {
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
  };

  const toggleGenre = (slug: string) => {
    setSelectedGenres((prev) => {
      const next = prev.includes(slug) ? prev.filter((g) => g !== slug) : [...prev, slug];
      return next;
    });
  };

  const clearFilter = (key: "q" | "genres" | "from" | "to") => {
    if (key === "q") setQ("");
    if (key === "genres") setSelectedGenres([]);
    if (key === "from") setFrom("");
    if (key === "to") setTo("");
    apply(); // re-run with updated state
  };

  const removeOneGenre = (slug: string) => {
    setSelectedGenres((prev) => prev.filter((g) => g !== slug));
    setTimeout(() => apply(), 0);
  };

  const cycleViewMode = () => {
    setViewMode((prev) =>
      prev === "comfortable" ? "compact" : prev === "compact" ? "dense" : "comfortable"
    );
  };

  const toggleFavorite = (bookId: number) => {
    const wasFav = favIds.includes(bookId);

    // optimistic UI
    setFavIds((prev) => (wasFav ? prev.filter((id) => id !== bookId) : [...prev, bookId]));

    router.post(`/books/${bookId}/favorite`, {}, {
      preserveScroll: true,
      onError: () => {
        // revert if server errors
        setFavIds((prev) => (wasFav ? [...prev, bookId] : prev.filter((id) => id !== bookId)));
      },
    });
  };

  // grid + card classes based on view mode
  let gridClasses = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
  let cardPadding = "p-4";
  let imgHeight = "h-48";
  let titleClass = "font-semibold text-sm sm:text-base";
  let metaClass = "text-sm";

  if (viewMode === "compact") {
    gridClasses = "grid gap-3 sm:grid-cols-3 lg:grid-cols-4";
    cardPadding = "p-3";
    imgHeight = "h-40";
    titleClass = "font-semibold text-sm";
    metaClass = "text-xs";
  } else if (viewMode === "dense") {
    gridClasses = "grid gap-3 sm:grid-cols-3 lg:grid-cols-5";
    cardPadding = "p-2";
    imgHeight = "h-32";
    titleClass = "font-semibold text-xs";
    metaClass = "text-[11px]";
  }

  const selectedLabel =
    selectedGenres.length === 0
      ? "All genres"
      : selectedGenres.length === 1
      ? genres.find((g) => g.slug === selectedGenres[0])?.name ?? "1 selected"
      : `${selectedGenres.length} selected`;

  return (
    <AppLayout>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Catalog</h1>

        {/* View mode toggle */}
        <button
          type="button"
          onClick={cycleViewMode}
          className="inline-flex items-center gap-1 rounded border border-border bg-card px-3 py-1.5 text-xs sm:text-sm hover:bg-card/80"
          title="Change card size"
        >
          <span className="grid grid-cols-2 gap-[2px]">
            <span className="h-2 w-2 rounded-sm border border-border" />
            <span className="h-2 w-2 rounded-sm border border-border" />
            <span className="h-2 w-2 rounded-sm border border-border" />
            <span className="h-2 w-2 rounded-sm border border-border" />
          </span>
          <span className="hidden sm:inline">
            {viewMode === "comfortable"
              ? "Comfortable"
              : viewMode === "compact"
              ? "Compact"
              : "Dense"}
          </span>
        </button>
      </div>

      {/* Search + filter controls */}
      <form onSubmit={apply} className="mb-3 space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search title or author"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 rounded border border-border px-3 py-2 text-sm"
          />

          <div className="flex items-center gap-2">
            {/* Filter toggle button */}
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              className="inline-flex items-center gap-1 rounded border border-border bg-card px-3 py-2 text-sm hover:bg-card/80"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M4 5h16l-5.5 7v5l-5 2v-7L4 5z"
                  fill="currentColor"
                />
              </svg>
              <span>Filters</span>
            </button>

            {/* Apply button */}
            <button
              type="submit"
              className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Filter panel (collapsible) */}
        {filtersOpen && (
          <div className="rounded border border-border bg-card px-3 py-3 text-sm space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1 sm:col-span-1">
                <label className="text-xs font-medium text-foreground/70">
                  Genre
                </label>

                <div className="relative" ref={genreMenuRef}>
                  <button
                    type="button"
                    onClick={() => setGenresOpen((o) => !o)}
                    className="w-full rounded border border-border bg-background px-3 py-2 text-sm flex items-center justify-between hover:bg-muted/40"
                    aria-expanded={genresOpen}
                  >
                    <span className="truncate">{selectedLabel}</span>
                    <span className="ml-2 text-foreground/60">▾</span>
                  </button>

                  {genresOpen && (
                    <div className="absolute z-20 mt-2 w-full rounded border border-border bg-background shadow-lg">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                        <span className="text-xs text-foreground/60">
                          {selectedGenres.length ? `${selectedGenres.length} selected` : "All genres"}
                        </span>
                        {selectedGenres.length > 0 && (
                          <button
                            type="button"
                            className="text-xs underline text-foreground/70 hover:text-foreground"
                            onClick={() => setSelectedGenres([])}
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="max-h-56 overflow-auto p-2 space-y-1">
                        {genres.map((g) => (
                          <label key={g.id} className="flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-muted/40">
                            <input
                              type="checkbox"
                              checked={selectedGenres.includes(g.slug)}
                              onChange={() => toggleGenre(g.slug)}
                            />
                            <span>{g.name}</span>
                          </label>
                        ))}
                      </div>

                      <div className="px-3 py-2 border-t border-border flex justify-end">
                        <button
                          type="button"
                          className="text-xs rounded border border-border px-3 py-1 hover:bg-muted/40"
                          onClick={() => setGenresOpen(false)}
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-foreground/70">
                  From (release date)
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="rounded border border-border px-2 py-2 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-foreground/70">
                  To (release date)
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="rounded border border-border px-2 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active filter chips */}
        <div className="flex flex-wrap gap-2 text-xs mt-1">
          {q.trim() && (
            <button
              type="button"
              onClick={() => clearFilter("q")}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 hover:bg-muted/80"
            >
              <span>Search: “{q.trim()}”</span>
              <span className="text-foreground/60">✕</span>
            </button>
          )}

          {selectedGenres.map((slug) => (
            <button
              key={slug}
              type="button"
              onClick={() => removeOneGenre(slug)}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 hover:bg-muted/80"
              title="Remove genre"
            >
              <span>
                Genre: {genres.find((g) => g.slug === slug)?.name ?? slug}
              </span>
              <span className="text-foreground/60">✕</span>
            </button>
          ))}

          {selectedGenres.length > 0 && (
            <button
              type="button"
              onClick={() => clearFilter("genres")}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 hover:bg-muted/80"
              title="Clear all genres"
            >
              <span>Clear genres</span>
              <span className="text-foreground/60">✕</span>
            </button>
          )}

          {from && (
            <button
              type="button"
              onClick={() => clearFilter("from")}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 hover:bg-muted/80"
            >
              <span>From: {from}</span>
              <span className="text-foreground/60">✕</span>
            </button>
          )}
          {to && (
            <button
              type="button"
              onClick={() => clearFilter("to")}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 hover:bg-muted/80"
            >
              <span>To: {to}</span>
              <span className="text-foreground/60">✕</span>
            </button>
          )}
        </div>
      </form>

      {/* Results */}
      <div className={gridClasses}>
        {books.data.map((b) => {
          const isFav = favIds.includes(b.id);

          return (
            <InertiaLink
              key={b.id}
              href={`/books/${b.id}`}
              className={`group relative rounded-lg border border-border bg-card ${cardPadding} block hover:shadow-sm hover:bg-card/80 transition-colors`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(b.id);
                }}
                className={`absolute right-2 top-2 z-10 rounded-full border border-border bg-card/90 px-2 py-1 text-xs hover:bg-card
                  ${isFav ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                `}
                title={isFav ? "Unfavorite" : "Favorite"}
                aria-label={isFav ? "Unfavorite" : "Favorite"}
              >
                {isFav ? "★" : "☆"}
              </button>

              <div className="mb-2 flex items-center justify-center">
                <div
                  className={`w-full overflow-hidden rounded bg-muted flex items-center justify-center ${imgHeight}`}
                >
                  {b.cover_url ? (
                    <img
                      src={b.cover_url}
                      alt={`${b.title} cover`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-[11px] text-foreground/60 px-2 text-center">
                      No cover
                    </span>
                  )}
                </div>
              </div>

              <h3 className={titleClass}>{b.title}</h3>
              <p className={`${metaClass} text-foreground/70`}>
                {b.author} · {b.genre}
              </p>
              <p className={`${metaClass} text-foreground/50 mt-1`}>
                {b.released_at ? new Date(b.released_at).getFullYear() : "—"}
              </p>
            </InertiaLink>
          );
        })}
      </div>

      {/* Pagination */}
      <nav className="mt-6 flex flex-wrap gap-2">
        {books.links.map((l, i) => (
          <a
            key={i}
            href={l.url ?? "#"}
            className={`rounded px-3 py-1 text-sm ring-1 ring-border ${
              l.active ? "bg-muted" : "hover:bg-muted/80"
            }`}
            dangerouslySetInnerHTML={{ __html: l.label }}
            aria-disabled={!l.url}
            onClick={(e) => {
              if (!l.url) e.preventDefault();
            }}
          />
        ))}
      </nav>
    </AppLayout>
  );
}
