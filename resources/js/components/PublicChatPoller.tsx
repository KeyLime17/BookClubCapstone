import { useEffect, useRef, useState } from 'react';

type Message = {
  id: number;
  club_id: number;
  type: 'text' | 'system';
  body: string;
  created_at: string;
  user: { id: number; name: string } | null;
};

export default function PublicChatPoller({ clubId }: { clubId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const lastIdRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  // fetch messages once
  const fetchMessages = async () => {
    const res = await fetch(`/api/clubs/${clubId}/messages`);
    const raw = await res.json();
    const data: Message[] = raw?.data ?? raw; // handle paginate/cursorPaginate
    // API returns newest-first; display oldest-first
    const ordered = [...data].reverse();
    setMessages(ordered);
    lastIdRef.current = ordered.length ? ordered[ordered.length - 1].id : null;
  };

  // fetch only new messages
  const fetchNew = async () => {
    const res = await fetch(`/api/clubs/${clubId}/messages`);
    const raw = await res.json();
    const data: Message[] = raw?.data ?? raw;
    const newestFirst = data; // newest-first
    if (lastIdRef.current == null) {
      await fetchMessages();
      return;
    }
    // find items with id > lastIdRef
    const newOnes = newestFirst.filter(m => m.id > (lastIdRef.current as number)).reverse();
    if (newOnes.length) {
      setMessages(prev => [...prev, ...newOnes]);
      lastIdRef.current = newOnes[newOnes.length - 1].id;
    }
  };

  useEffect(() => {
    fetchMessages();
    // poll every 2s (tune as needed)
    timerRef.current = window.setInterval(fetchNew, 2000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [clubId]);

  useEffect(() => {
    // log arrivals so you can see it working
    if (messages.length) {
      // console.log('Messages:', messages.map(m => m.id));
    }
  }, [messages]);

  return null; // listener only; add UI later
}
