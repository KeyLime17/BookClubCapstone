// resources/js/Pages/BookSubmit.tsx
import React, { FormEvent } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';


export default function BookSubmit() {
    const { flash } = usePage().props as {
        flash?: {
            success?: string;
        };
    };

  const { data, setData, post, processing, errors, reset } = useForm<{
    title: string;
    author: string;
    link: string;
    image: File | null;
  }>({
    title: '',
    author: '',
    link: '',
    image: null,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    post('/books/submit', {
      forceFormData: true, // needed for file upload
      onSuccess: () => {
        reset('title', 'author', 'link', 'image');
      },
    });
  };

  return (
    <AppLayout>
      <Head title="Submit a Book" />

      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-semibold mb-4">Submit a Book</h1>
        <p className="text-sm text-gray-600 mb-6">
          Submit a book that&apos;s missing from the catalog. An admin will review it and
          add details like description and release date before it goes live.
        </p>

        {flash?.success && (
          <div className="mb-4 rounded-md bg-green-100 border border-green-300 px-4 py-2 text-sm text-green-800">
            {flash.success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="title">
              Book Title<span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              value={data.title}
              onChange={e => setData('title', e.target.value)}
              required
            />
            {errors.title && (
              <p className="text-xs text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="author">
              Author<span className="text-red-500">*</span>
            </label>
            <input
              id="author"
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              value={data.author}
              onChange={e => setData('author', e.target.value)}
              required
            />
            {errors.author && (
              <p className="text-xs text-red-600 mt-1">{errors.author}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="link">
              Reference Link (optional)
            </label>
            <input
              id="link"
              type="url"
              placeholder="https://example.com/book-page"
              className="w-full border rounded px-3 py-2 text-sm"
              value={data.link}
              onChange={e => setData('link', e.target.value)}
            />
            {errors.link && (
              <p className="text-xs text-red-600 mt-1">{errors.link}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="image">
              Book Cover (optional)
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              className="w-full text-sm"
              onChange={e => {
                const file = e.target.files?.[0] ?? null;
                setData('image', file);
              }}
            />
            {errors.image && (
              <p className="text-xs text-red-600 mt-1">{errors.image}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={processing}
            className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium disabled:opacity-60"
          >
            {processing ? 'Submitting…' : 'Submit Book'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
