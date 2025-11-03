import React, { useEffect, useRef, useState } from 'react';

type User = { id: number; name: string };
type Message = {
  id: number;
  club_id: number;
  type: 'text' | 'system';
  body: string;
  created_at: string;
  user: User | null;
};

type Props = {
  bookId: number;
  canPost?: boolean;
  clubIdOverride?: number;
};

export default function ChatBox({ bookId, canPost = false, clubIdOverride }: Props) {
  const [clubId, setClubId] = useState<number | null>(clubIdOverride ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastIdRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const messagesBase = clubIdOverride ? '' : '/api';

  const safeJson = async (resp: Response) => {
    const text = await resp.text();
    try { return JSON.parse(text); } catch { return { __raw: text, __status: resp.status }; }
  };

  // Resolve the public club for this book
  useEffect(() => {
    if (clubIdOverride) return;
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(`/api/clubs?only_public=1&book_id=${bookId}`, { credentials: 'include' });
        const json = await safeJson(resp);
        if (!resp.ok) throw new Error(`Clubs query failed (${resp.status})`);

        const first = json?.data?.[0] ?? json?.[0] ?? null;
        const resolvedId = Number(first?.id);
        console.log('[ChatBox] resolved clubId for book', bookId, '=>', resolvedId, first);
        if (!cancelled) setClubId(Number.isFinite(resolvedId) ? resolvedId : null);
      } catch (e: any) {
        if (!cancelled) setError('Could not load discussion for this book.');
        console.error('[ChatBox] resolve clubs error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [bookId, clubIdOverride]);

  // a micro effect so state follows the prop if it ever changes
  useEffect(() => {
  if (clubIdOverride) setClubId(clubIdOverride);
  }, [clubIdOverride]);


  // Initial load
  useEffect(() => {
    if (!clubId) return;
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(`${messagesBase}/clubs/${clubId}/messages`, {
          credentials: 'include',
        });
        const json = await safeJson(resp);
        if (!resp.ok) throw new Error(`Messages fetch failed (${resp.status})`);
        const data: Message[] = json?.data ?? json;
        const ordered = [...data].reverse(); // oldest -> newest
        if (!cancelled) {
          setMessages(ordered);
          lastIdRef.current = ordered.length
            ? ordered[ordered.length - 1].id
            : null;
        }
      } catch (e: any) {
        if (!cancelled) setError('Could not load messages.');
        console.error('[ChatBox] initial messages error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [clubId, messagesBase]);


  // Poll every 2s
  useEffect(() => {
    if (!clubId) return;
    const fetchNew = async () => {
      try {
        const resp = await fetch(`${messagesBase}/clubs/${clubId}/messages`, {
          credentials: 'include',
        });
        const json = await safeJson(resp);
        if (!resp.ok) throw new Error(`Messages poll failed (${resp.status})`);
        const newestFirst: Message[] = json?.data ?? json;
        if (lastIdRef.current == null) return;
        const newOnes = newestFirst
          .filter(m => m.id > lastIdRef.current!)
          .reverse();
        if (newOnes.length) {
          setMessages(prev => [...prev, ...newOnes]);
          lastIdRef.current = newOnes[newOnes.length - 1].id;
        }
      } catch (e) {
        console.warn('[ChatBox] poll error:', e);
      }
    };
    const id = window.setInterval(fetchNew, 2000);
    return () => { window.clearInterval(id); };
  }, [clubId, messagesBase]);


  // Auto-scroll to bottom when messages append
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  // Send via web route (session + CSRF)
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubId || !body.trim()) return;

    const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

    try {
      const resp = await fetch(`/clubs/${clubId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
        credentials: 'include',
        body: JSON.stringify({ body }),
      });

      const text = await resp.text();
      const json = (() => { try { return JSON.parse(text); } catch { return null; } })();

      if (resp.status === 201 && json) {
        setBody('');
        setMessages(prev => [...prev, json]);
        lastIdRef.current = json.id ?? lastIdRef.current;
      } else if (resp.status === 401) {
        alert('Log in to send messages.');
      } else {
        console.error('[ChatBox] send failed:', resp.status, text);
        alert('Could not send message.');
      }
    } catch (err) {
      console.error('[ChatBox] send error:', err);
      alert('Network or server error.');
    }
  };

  return (
    <div className="w-full border rounded-xl p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Discussion</h3>
        {!clubId && !error && loading && (
          <span className="text-sm opacity-70">Locating discussion…</span>
        )}
      </div>

      <div
        ref={listRef}
        className="h-64 overflow-y-auto space-y-2 border rounded-lg p-2 bg-white/50"
      >
        {loading && <div>Loading messages…</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {!loading && !clubId && !error && (
          <div className="opacity-70">No public discussion for this book yet.</div>
        )}
        {messages.map(m => (
          <div key={m.id} className="text-sm">
            <span className="font-medium">{m.user?.name ?? 'System'}:</span>{' '}
            <span>{m.body}</span>
            <span className="opacity-60 text-xs ml-2">
              {new Date(m.created_at).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      {canPost ? (
        <form onSubmit={send} className="flex gap-2">
          <input
            className="flex-1 border rounded-lg px-3 py-2"
            placeholder="Write a message…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (body.trim() && clubId) void send(e as any);
              }
            }}
          />
          <button
            className="px-4 py-2 rounded-lg border"
            type="submit"
            disabled={!body.trim() || !clubId}
            title={!clubId ? 'Loading discussion…' : undefined}
          >
            Send
          </button>
        </form>
      ) : (
        <div className="text-sm opacity-70">
          Log in to participate in the discussion.
        </div>
      )}
    </div>
  );
}
