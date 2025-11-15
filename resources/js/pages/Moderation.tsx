import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';

interface UserSummary {
  id: number;
  name: string;
  email?: string;
  is_submitter?: boolean;
  is_banned?: boolean;
  muted_until?: string | null;
}

export default function Moderation() {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<UserSummary[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserSummary | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [muteDuration, setMuteDuration] = React.useState<number>(5);
  const [actionBusy, setActionBusy] = React.useState(false);

  const loadResults = async (q: string, keepSelectedId?: number) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSelectedUser(null);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/users/search?q=${encodeURIComponent(q)}`);
      if (!response.ok) throw new Error('Search failed');
      const data: UserSummary[] = await response.json();
      setResults(data || []);

      if (keepSelectedId != null) {
        const updated = data.find((u) => u.id === keepSelectedId) || null;
        setSelectedUser(updated);
      }
    } catch (err) {
      console.error(err);
      setError('Could not load users. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setError(null);
    setSelectedUser(null);
    loadResults(value);
  };

  const doPost = (url: string, data: Record<string, any> = {}) => {
    if (!selectedUser) return;
    setActionBusy(true);
    router.post(
      url,
      data,
      {
        preserveScroll: true,
        onFinish: () => setActionBusy(false),
        onSuccess: () => {
          // re-fetch results and refresh selected user from server state
          loadResults(query, selectedUser.id);
        },
      }
    );
  };

  return (
    <AppLayout>
      <Head title="Moderation" />

      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        <h1 className="text-2xl font-semibold">Moderation Panel</h1>
        <p className="text-sm text-gray-600">
          Search for a user to manage submitter status, bans, and mutes.
        </p>

        <div className="rounded border bg-white p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="user-search">
              Find a user
            </label>
            <input
              id="user-search"
              type="text"
              value={query}
              onChange={handleSearchChange}
              placeholder="Start typing a username or email..."
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Type at least 2 characters to search.
            </p>
          </div>

          {loading && <p className="text-sm text-gray-500">Searching…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && results.length > 0 && (
            <div className="max-h-56 overflow-y-auto border rounded">
              {results.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedUser(u)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 border-b last:border-b-0"
                >
                  <div>
                    <div className="font-medium">{u.name}</div>
                    {u.email && (
                      <div className="text-xs text-gray-500">{u.email}</div>
                    )}
                  </div>
                  <div className="flex gap-2 text-xs">
                    {u.is_submitter && (
                      <span className="rounded bg-yellow-100 px-2 py-0.5 text-yellow-800">
                        Submitter
                      </span>
                    )}
                    {u.is_banned && (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-red-800">
                        Banned
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedUser && (
            <div className="mt-4 rounded border bg-gray-50 p-4 space-y-3">
              <h2 className="text-sm font-semibold">
                Selected user: {selectedUser.name}
              </h2>
              {selectedUser.email && (
                <p className="text-xs text-gray-600">{selectedUser.email}</p>
              )}
              <p className="text-xs text-gray-600">
                Submitter: {selectedUser.is_submitter ? 'Yes' : 'No'} · Banned:{' '}
                {selectedUser.is_banned ? 'Yes' : 'No'}
              </p>
              {selectedUser.muted_until && (
                <p className="text-xs text-gray-600">
                  Muted until:{' '}
                  {new Date(selectedUser.muted_until).toLocaleString()}
                </p>
              )}

              {/* Promote / Demote submitter */}
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedUser.is_submitter ? (
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={() =>
                      doPost(`/moderation/users/${selectedUser.id}/demote`)
                    }
                    className="rounded bg-yellow-700 px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
                  >
                    Remove Submitter
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={() =>
                      doPost(`/moderation/users/${selectedUser.id}/promote`)
                    }
                    className="rounded bg-yellow-500 px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
                  >
                    Promote to Submitter
                  </button>
                )}

                {/* Ban / Unban */}
                {selectedUser.is_banned ? (
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={() =>
                      doPost(`/moderation/users/${selectedUser.id}/unban`)
                    }
                    className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
                  >
                    Unban
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={() =>
                      doPost(`/moderation/users/${selectedUser.id}/ban`)
                    }
                    className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
                  >
                    Ban
                  </button>
                )}
              </div>

              {/* Mute controls */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <label className="text-xs font-medium">
                  Mute for:
                </label>
                <select
                  className="border rounded px-2 py-1 text-xs"
                  value={muteDuration}
                  onChange={(e) => setMuteDuration(Number(e.target.value))}
                  disabled={actionBusy}
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={300}>5 hours</option>
                  <option value={1440}>1 day</option>
                  <option value={10080}>1 week</option>
                </select>
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={() =>
                    doPost(`/moderation/users/${selectedUser.id}/mute`, {
                      duration: muteDuration,
                    })
                  }
                  className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
                >
                  Apply Mute
                </button>

                {selectedUser.muted_until && (
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={() =>
                      doPost(`/moderation/users/${selectedUser.id}/clear-mute`)
                    }
                    className="rounded bg-gray-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
                  >
                    Clear Mute
                  </button>
                )}
              </div>

              <p className="mt-3 text-[11px] text-gray-500">
                (Coming next: per-book temp bans for specific discussions.)
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
