import React from 'react';
import { usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import ChatBox from '@/components/ChatBox';

type Club = { id: number; name: string; book_id: number; is_public: boolean };
type Props = { club: Club };

function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([$?*|{}\]\\^])/g, '\\$1') + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function InvitePanel({ clubId }: { clubId: number }) {
  const [q, setQ] = React.useState('');
  const [list, setList] = React.useState<{ id: number; name: string }[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [notice, setNotice] = React.useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const t = React.useRef<number | null>(null);

  const runSearch = async (val: string) => {
    setError(null);
    setNotice(null);

    if (!val.trim()) { setList([]); return; }

    setSearching(true);
    try {
      const resp = await fetch(`/users/search?q=${encodeURIComponent(val)}`, {
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (resp.status === 401) {
        setError('Please log in to search users.');
        setList([]);
        return;
      }

      if (!resp.ok) {
        setError('Search failed.');
        setList([]);
        return;
      }

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
    setNotice(null);

    try {
      const xsrf = getCookie('XSRF-TOKEN') || '';

      const resp = await fetch(`/clubs/${clubId}/invite`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': xsrf,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (resp.status === 403) {
        setError('You do not have permission to invite to this club.');
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

      setNotice({ type: 'success', text: 'Invite sent!' });
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
        <span className="text-sm text-gray-500">
          {searching ? 'Searching…' : 'Type to search'}
        </span>
      </div>

      {/* Notice banner */}
      {notice && (
        <div
          className={`mt-2 text-sm rounded-lg border px-3 py-2 ${
            notice.type === 'error'
              ? 'border-red-300 bg-red-50 text-red-700'
              : 'border-green-300 bg-green-50 text-green-700'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <span>{notice.text}</span>
            <button
              type="button"
              className="text-xs underline opacity-70 hover:opacity-100"
              onClick={() => setNotice(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

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
  const page = usePage<any>();
  const user = page.props.auth?.user;

  const mutedUntil = user?.muted_until ? new Date(user.muted_until) : null;
  const isMuted = mutedUntil !== null && mutedUntil > new Date();

  // for dms
  const startDm = (userId: number) => {
    router.post(`/dm/${userId}`, {}, { preserveScroll: true });
  };

  return (
    <AppLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">{club.name}</h1>
      </div>

      <section className="mt-4 space-y-2">
        <ChatBox
          bookId={club.book_id}
          clubIdOverride={club.id}
          canPost={!isMuted}
          onUserClick={startDm}
        />


        {isMuted && mutedUntil && (
          <p className="text-xs text-red-600">
            You are muted until {mutedUntil.toLocaleString()}.
          </p>
        )}
      </section>

      <InvitePanel clubId={club.id} />
    </AppLayout>
  );
}
