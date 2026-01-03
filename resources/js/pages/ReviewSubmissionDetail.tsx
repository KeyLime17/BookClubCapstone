import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';

interface SubmissionUser {
  id: number;
  name: string;
  email?: string;
}

interface Submission {
  id: number;
  title: string;
  author: string;
  link?: string | null;
  image_path?: string | null;
  created_at: string;
  user: SubmissionUser;
}

interface Genre {
  id: number;
  name: string;
  slug: string;
}

interface PageProps {
  submission: Submission;
  genres: Genre[];
  imageUrl?: string | null;
}

export default function ReviewSubmissionDetail(props: PageProps) {
  const { submission, genres, imageUrl } = props

  const [description, setDescription] = React.useState<string>('');
  const [releasedAt, setReleasedAt] = React.useState<string>('');
  const [genreId, setGenreId] = React.useState<number | ''>(
    genres[0]?.id ?? ''
  );
  const [busy, setBusy] = React.useState(false);

  const approve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genreId) {
      alert('Please select a genre before approving.');
      return;
    }

    setBusy(true);
    router.post(
      `/review/${submission.id}/approve`,
      {
        description,
        released_at: releasedAt || null,
        genre_id: genreId,
      },
      {
        onFinish: () => setBusy(false),
      }
    );
  };

  const reject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('Reject this submission?')) return;

    setBusy(true);
    router.post(
      `/review/${submission.id}/reject`,
      {},
      { onFinish: () => setBusy(false) }
    );
  };

  return (
    <AppLayout>
      <Head title={`Review: ${submission.title}`} />

      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        <h1 className="text-2xl font-semibold">
          Review Submission: {submission.title}
        </h1>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Title:</span> {submission.title}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Author:</span> {submission.author}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Submitted by:</span>{' '}
              {submission.user.name}
            </p>
            {submission.link && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Link:</span>{' '}
                <a
                  href={submission.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Open store / info page
                </a>
              </p>
            )}
            <p className="text-xs text-gray-500">
              Submitted at {new Date(submission.created_at).toLocaleString()}
            </p>
          </div>

          <div className="flex justify-center">
            <div className="aspect-[3/4] w-full max-w-[260px] overflow-hidden rounded border bg-gray-100">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${submission.title} cover`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-gray-500">
                  No cover uploaded
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={approve} className="space-y-4 rounded border bg-white p-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Genre
            </label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={genreId}
              onChange={(e) =>
                setGenreId(e.target.value ? Number(e.target.value) : '')
              }
            >
              {genres.length === 0 && (
                <option value="">No genres defined</option>
              )}
              {genres.length > 0 && (
                <>
                  {/* optional "choose" prompt */}
                  {/* <option value="">Select a genre…</option> */}
                  {genres.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm min-h-[120px]"
              placeholder="Add a catalog description for this book…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Release date
            </label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2 text-sm"
              value={releasedAt}
              onChange={(e) => setReleasedAt(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              Approve &amp; Add to Catalog
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={reject}
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              Reject
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
