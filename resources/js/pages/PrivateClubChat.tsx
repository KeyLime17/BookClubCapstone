import React from 'react';
import AppLayout from '@/layouts/AppLayout';
import ChatBox from '@/components/ChatBox';


type Props = { club: { id: number; name: string; book_id: number; is_public: boolean } };

function InvitePanel({ clubId }: { clubId: number }) {
  const [q, setQ] = React.useState('');
  const [list, setList] = React.useState<{id:number;name:string}[]>([]);
  const [busy, setBusy] = React.useState(false);
  const t = React.useRef<number | null>(null);

  const search = (val: string) => {
    if (t.current) window.clearTimeout(t.current);
    t.current = window.setTimeout(async () => {
      if (!val.trim()) { setList([]); return; }
      const resp = await fetch(`/api/users/search?q=${encodeURIComponent(val)}`, { credentials: 'include' });
      if (resp.ok) setList(await resp.json());
    }, 250);
  };

  const invite = async (userId: number) => {
    setBusy(true);
    try {
      const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
      const resp = await fetch(`/clubs/${clubId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
        credentials: 'include',
        body: JSON.stringify({ user_id: userId }),
      });
      if (resp.ok) {
        alert('Invited!');
        setQ(''); setList([]);
      } else {
        const txt = await resp.text();
        alert('Invite failed: ' + txt);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 rounded border p-3">
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); search(e.target.value); }}
          placeholder="Invite by name…"
          className="flex-1 border rounded px-3 py-2"
        />
        <span className="text-sm text-gray-500">Type to search</span>
      </div>

      {list.length > 0 && (
        <div className="mt-2 border rounded divide-y bg-white">
          {list.map(u => (
            <div key={u.id} className="flex items-center justify-between px-3 py-2">
              <span>{u.name}</span>
              <button
                disabled={busy}
                onClick={() => invite(u.id)}
                className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
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
      {/* Invite users */}
      <InvitePanel clubId={club.id} />
    </AppLayout>
  );

}


