import React from 'react';
import AppLayout from '@/layouts/AppLayout';
import ChatBox from '@/components/ChatBox';

type Club = { id: number; name: string; book_id: number; is_public: boolean };
type Props = { club: Club };

function InvitePanel({ clubId }: { clubId: number }) {
  const [q, setQ] = React.useState('');
  const [list, setList] = React.useState<{ id: number; name: string }[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const t = React.useRef<number | null>(null);

  const runSearch = async (val: string) => {
    setError(null);
    if (!val.trim()) { setList([]); return; }
    setSearching(true);
    try {
      // NOTE: web route (with auth cookie), not /api/...
      const resp = await fetch(`/users/search?q=${encodeURIComponent(val)}`, { credentials: 'include' });
      if (resp.status === 401) { setError('Please log in to search users.'); setList([]); return; }
      if (!resp.ok) { setError('Search failed.'); setList([]); return; }
      const data = await resp.json();
      setList(Array.isArray(data) ? data : []);
    } catch {
      setError('Network error while searching.');
      setList([]);
    } finally {
      setSearching(false);
    }
  };

  const onChange = (val: string) => {
    setQ(val);
    if (t.current) window.clearTimeout(t.current);
    t.current = window.setTimeout(() => { void runSearch(val); }, 250);
  };

  const invite = async (userId: number) => {
    setBusy(true);
    setError(null);
    try {
      const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
      const resp = await fetch(`/clubs/${clubId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
        credentials: 'include',
        body: JSON.stringify({ user_id: userId }),
      });

      if (resp.status === 403) {
        const txt = await resp.text();
        setError('You do not have permission to invite to this club.' + (txt ? ` (${txt})` : ''));
        return;
      }
      if (resp.status === 422) {
        const j = await resp.json().catch(() => null);
        setError(j?.message ?? 'Validation failed.');
        return;
      }
      if (!resp.ok) {
        const txt = await resp.text();
        setError(`Invite failed: ${txt || resp.status}`);
        return;
      }

      alert('Invite sent!');
      setQ('');
      setList([]);
    } catch {
      setError('Network error while sending invite.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 rounded border p-3 bg-white/70">
      <h2 className="font-medium mb-2">Invite people</h2>

      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type a name to search…"
          className="flex-1 border rounded px-3 py-2"
        />
        <span className="text-sm text-gray-500">{searching ? 'Searching…' : 'Type to search'}</span>
      </div>

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

      {q.trim() && !searching && list.length === 0 && !error && (
        <div className="mt-2 text-sm text-gray-600">No users found.</div>
      )}

      {list.length > 0 && (
        <div className="mt-3 border rounded divide-y bg-white">
          {list.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-3 py-2">
              <span>{u.name}</span>
              <button
                disabled={busy}
                onClick={() => invite(u.id)}
                className="text-xs px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-60"
              >
                Invite
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PrivateClubChat({ club }: Props) {
  return (
    <AppLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">{club.name}</h1>
        <p className="text-sm text-gray-600">Private chat for this book</p>
      </div>

      {/* Force ChatBox to use the private club id */}
      <section className="mt-4">
        <ChatBox bookId={club.book_id} canPost clubIdOverride={club.id} />
      </section>

      {/* Invite users (owner/mods should be authorized server-side) */}
      <InvitePanel clubId={club.id} />
    </AppLayout>
  );
}
