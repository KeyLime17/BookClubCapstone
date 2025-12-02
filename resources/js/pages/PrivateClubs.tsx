import React, { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { Link, usePage, router } from '@inertiajs/react';

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
  const page = usePage<any>();
  const authUserId = page.props?.auth?.user?.id as number | undefined;
  const flash = page.props?.flash as { success?: string; error?: string } | undefined;

  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  // rename mode
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [renameError, setRenameError] = useState<string | null>(null);

  const isOwner = (c: Club) =>
    !c.is_public && authUserId != null && c.owner_id === authUserId;

  // --- DELETE CLUB (owner only) via Inertia ---
  const handleDelete = (club: Club) => {
    if (!confirm(`Delete "${club.name}"? This will remove all messages and members.`)) {
      return;
    }

    setBusyId(club.id);
    setMenuOpenId(null);

    router.delete(`/clubs/${club.id}`, {
      preserveScroll: true,
      onError: (errors) => {
        console.error('Delete error:', errors);
        alert('Could not delete the club.');
      },
      onFinish: () => {
        setBusyId(null);
      },
    });
  };

  const openRename = (club: Club) => {
    setMenuOpenId(null);
    setEditingId(club.id);
    setEditingName(club.name);
    setRenameError(null);
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingName('');
    setRenameError(null);
  };

  // --- RENAME CLUB (owner only) via Inertia PATCH ---
  const submitRename = (club: Club, e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editingName.trim();

    if (!trimmed) {
      setRenameError('Name cannot be empty.');
      return;
    }
    if (trimmed === club.name) {
      cancelRename();
      return;
    }

    setBusyId(club.id);
    setRenameError(null);

    router.patch(
      `/clubs/${club.id}`,
      { name: trimmed },
      {
        preserveScroll: true,
        onError: (errors: any) => {
          console.error('Rename error:', errors);
          // You don't have validation errors wired here, so just show generic
          setRenameError('Could not rename the club.');
        },
        onSuccess: () => {
          // server should send back updated clubs via Inertia props
          cancelRename();
        },
        onFinish: () => {
          setBusyId(null);
        },
      }
    );
  };

  // --- LEAVE CLUB (non-owner) via Inertia DELETE ---
  const handleLeave = (club: Club) => {
    if (!confirm('Leave this club?')) return;

    setBusyId(club.id);

    router.delete(`/clubs/${club.id}/leave`, {
      preserveScroll: true,
      onError: (errors) => {
        console.error('Leave error:', errors);
        alert('Could not leave the club.');
      },
      onFinish: () => {
        setBusyId(null);
      },
    });
  };

  return (
    <AppLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Your Clubs</h1>
      </div>

      {flash?.success && (
        <div className="mb-3 text-sm text-green-700">{flash.success}</div>
      )}
      {flash?.error && <div className="mb-3 text-sm text-red-700">{flash.error}</div>}

      {clubs.length === 0 ? (
        <div className="rounded border bg-white p-4 text-sm text-gray-600">
          You’re not a member of any private clubs yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {clubs.map((c) => {
            const owner = isOwner(c);
            const isBusy = busyId === c.id;
            const isEditing = editingId === c.id;

            return (
              <div
                key={c.id}
                className="rounded border bg-white p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-medium">{c.name}</h2>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          c.is_public
                            ? 'border-gray-300 text-gray-600'
                            : 'border-indigo-400 text-indigo-700'
                        }`}
                      >
                        {c.is_public ? 'Public' : 'Private'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Owner:{' '}
                      <span className="font-medium">{c.owner?.name ?? '—'}</span> ·
                      Members: <span className="font-medium">{c.members_count}</span>
                      {c.book_id ? (
                        <>
                          {' '}
                          · Book ID: <span className="font-mono">{c.book_id}</span>
                        </>
                      ) : null}
                      {owner && (
                        <span className="ml-1 text-xs text-gray-500">
                          (You are the owner)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative flex items-center gap-2">
                    {/* Open chat */}
                    <Link
                      href={`/clubs/${c.id}/chat`}
                      className="text-sm px-3 py-1.5 rounded border hover:bg-gray-50"
                    >
                      Open chat
                    </Link>

                    {/* Non-owner: Leave button (private only) */}
                    {!c.is_public && !owner && (
                      <button
                        type="button"
                        onClick={() => handleLeave(c)}
                        className="text-sm px-3 py-1.5 rounded border hover:bg-gray-50 disabled:opacity-60"
                        disabled={isBusy}
                      >
                        Leave
                      </button>
                    )}

                    {/* Owner: 3-dot menu (rename/delete) */}
                    {owner && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setMenuOpenId((prev) => (prev === c.id ? null : c.id))
                          }
                          className="h-8 w-8 flex items-center justify-center rounded-full border hover:bg-gray-50 text-gray-600"
                          aria-label="Club options"
                          disabled={isBusy}
                        >
                          ⋮
                        </button>

                        {menuOpenId === c.id && (
                          <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-lg z-20">
                            <button
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                              onClick={() => openRename(c)}
                              disabled={isBusy}
                            >
                              Rename
                            </button>
                            <button
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                              onClick={() => handleDelete(c)}
                              disabled={isBusy}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline rename panel */}
                {owner && isEditing && (
                  <form
                    onSubmit={(e) => submitRename(c, e)}
                    className="mt-1 rounded border border-gray-200 bg-gray-50 px-3 py-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-600">
                        Rename this club
                      </label>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full rounded border px-2 py-1 text-sm"
                        placeholder="New club name"
                        autoFocus
                      />
                      {renameError && (
                        <p className="text-xs text-red-600">{renameError}</p>
                      )}
                    </div>
                    <div className="mt-2 flex gap-2 sm:mt-0 sm:ml-3">
                      <button
                        type="button"
                        onClick={cancelRename}
                        className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-white"
                        disabled={isBusy}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-sm rounded bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60"
                        disabled={isBusy}
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
