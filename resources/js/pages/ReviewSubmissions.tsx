import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
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
  created_at: string;
  user: SubmissionUser;
}

export default function ReviewSubmissions() {
  // Use `any` for the page, then cast only the piece we care about.
  const page = usePage<any>();
  const submissions = (page.props.submissions ?? []) as Submission[];

  return (
    <AppLayout>
      <Head title="Review Book Submissions" />

      <div className="max-w-4xl mx-auto py-8 px-4 space-y-4">
        <h1 className="text-2xl font-semibold">Review Book Submissions</h1>
        <p className="text-sm text-gray-600">
          Submitter users are shown at the top of the queue. Click a row to open
          the full submission and approve or reject it.
        </p>

        {submissions.length === 0 ? (
          <p className="text-sm text-gray-500">No pending submissions.</p>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="px-3 py-2 text-left">Author</th>
                  <th className="px-3 py-2 text-left">Submitted By</th>
                  <th className="px-3 py-2 text-left">Link</th>
                  <th className="px-3 py-2 text-left">Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <Link
                        href={`/review/${s.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {s.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{s.author}</td>
                    <td className="px-3 py-2">
                      {s.user.name}
                      {s.user.is_submitter && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">
                          Submitter
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {s.link ? (
                        <a
                          href={s.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Open
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {new Date(s.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
