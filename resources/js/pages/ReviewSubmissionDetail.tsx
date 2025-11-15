import React, { FormEvent } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';

interface SubmissionUser {
  id: number;
  name: string;
  is_submitter?: boolean;
}

interface Submission {
  id: number;
  title: string;
  author: string;
  link?: string | null;
  image_path?: string | null;
  created_at: string;
  description?: string | null;
  release_date?: string | null;
  user: SubmissionUser;
}

export default function ReviewSubmissionDetail() {
  const page = usePage<any>();
  const submission = page.props.submission as Submission;

  const { data, setData, post, processing, errors } = useForm<{
    description: string;
    release_date: string;
    image: File | null;
  }>({
    description: submission.description ?? '',
    release_date: submission.release_date ?? '',
    image: null,
  });

  const handleApprove = (e: FormEvent) => {
    e.preventDefault();
    post(`/review/${submission.id}/approve`, {
      forceFormData: true, // needed because we may send a file
    });
  };

  const handleReject = (e: FormEvent) => {
    e.preventDefault();
    post(`/review/${submission.id}/reject`);
  };

  return (
    <AppLayout>
      <Head title={`Review: ${submission.title}`} />

      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        <Link href="/review" className="text-sm text-blue-600 hover:underline">
          ← Back to submissions
        </Link>

        <div className="flex gap-6">
          {/* Current image preview (if any) */}
          {submission.image_path && (
            <div className="w-40 flex-shrink-0">
              <img
                src={`/storage/${submission.image_path}`}
                alt={submission.title}
                className="w-full rounded shadow-sm object-cover"
              />
            </div>
          )}

          <div className="flex-1 space-y-2">
            <h1 className="text-2xl font-semibold">{submission.title}</h1>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Author:</span> {submission.author}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Submitted by:</span> {submission.user.name}{' '}
              {submission.user.is_submitter && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">
                  Submitter
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500">
              Submitted at: {new Date(submission.created_at).toLocaleString()}
            </p>
            {submission.link && (
              <p className="text-sm">
                <span className="font-medium">Reference link:</span>{' '}
                <a
                  href={submission.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all"
                >
                  {submission.link}
                </a>
              </p>
            )}
          </div>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="description">
              Description (for catalog)
            </label>
            <textarea
              id="description"
              className="w-full border rounded px-3 py-2 text-sm min-h-[120px]"
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
            />
            {errors.description && (
              <p className="text-xs text-red-600 mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="release_date">
              Release date
            </label>
            <input
              id="release_date"
              type="date"
              className="w-full border rounded px-3 py-2 text-sm"
              value={data.release_date}
              onChange={(e) => setData('release_date', e.target.value)}
            />
            {errors.release_date && (
              <p className="text-xs text-red-600 mt-1">{errors.release_date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="image">
              Cover image for catalog
              <span className="block text-xs text-gray-500">
                You can replace the submitted image or add one if none was provided.
              </span>
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              className="w-full text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setData('image', file);
              }}
            />
            {errors.image && (
              <p className="text-xs text-red-600 mt-1">{errors.image}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              onClick={handleApprove}
              disabled={processing}
              className="inline-flex items-center px-4 py-2 rounded bg-green-600 text-white text-sm font-medium disabled:opacity-60"
            >
              Approve &amp; Add to Catalog
            </button>

            <button
              type="button"
              onClick={handleReject}
              disabled={processing}
              className="inline-flex items-center px-4 py-2 rounded bg-red-600 text-white text-sm font-medium disabled:opacity-60"
            >
              Reject
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
