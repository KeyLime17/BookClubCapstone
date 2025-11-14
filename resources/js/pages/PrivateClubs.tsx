import React from 'react';
import AppLayout from '@/layouts/AppLayout';
import { Link, usePage } from '@inertiajs/react';

type Owner = { id: number; name: string };
type Club = {
  id: number;
  name: string;
  book_id: number | null;
  is_public: boolean;
  owner_id: number | null;
  owner?: Owner;
  members_count: number;
};

type Props = {
  clubs: Club[];
};

export default function PrivateClubs({ clubs }: Props) {
  const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
  const flash = usePage().props?.flash as { success?: string; error?: string } | undefined;

  return (
    <AppLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Your Clubs</h1>
        <p className="text-sm text-gray-600">Private chats you own or joined.</p>
      </div>

      {flash?.success && <div className="mb-3 text-sm text-green-700">{flash.success}</div>}
      {flash?.error && <div className="mb-3 text-sm text-red-700">{flash.error}</div>}

      {clubs.length === 0 ? (
        <div className="rounded border bg-white p-4 text-sm text-gray-600">
          You’re not a member of any private clubs yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {clubs.map((c) => (
            <div key={c.id} className="rounded border bg-white p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-medium">{c.name}</h2>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${c.is_public ? 'border-gray-300 text-gray-600' : 'border-indigo-400 text-indigo-700'}`}>
                    {c.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Owner: <span className="font-medium">{c.owner?.name ?? '—'}</span> ·
                  {' '}Members: <span className="font-medium">{c.members_count}</span>
                  {c.book_id ? <> · Book ID: <span className="font-mono">{c.book_id}</span></> : null}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Open chat */}
                <Link
                  href={`/clubs/${c.id}/chat`}
                  className="text-sm px-3 py-1.5 rounded border hover:bg-gray-50"
                >
                  Open chat
                </Link>

                {/* Leave button (hide if owner) */}
                {!c.is_public && c.owner_id !== (usePage().props as any)?.auth?.user?.id && (
                  <form method="post" action={`/clubs/${c.id}/leave`} onSubmit={(e) => {
                    if (!confirm('Leave this club?')) e.preventDefault();
                  }}>
                    <input type="hidden" name="_token" value={token} />
                    <input type="hidden" name="_method" value="DELETE" />
                    <button className="text-sm px-3 py-1.5 rounded border hover:bg-gray-50" type="submit">
                      Leave
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
