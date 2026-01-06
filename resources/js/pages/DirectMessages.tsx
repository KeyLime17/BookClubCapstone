import React, { useEffect, useRef, useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { router, Link, usePage } from "@inertiajs/react";

type OtherUser = { id: number; name: string; avatar?: string | null };

type Message = {
  id: number;
  sender_id: number;
  body: string;
  created_at: string;
  sender_name: string;
};

type Props = {
  conversationId: number;
  otherUser: OtherUser | null;
  messages: Message[];
};

export default function DirectMessages({ conversationId, otherUser, messages }: Props) {
  const page = usePage<any>();
  const authUser = page.props.auth?.user as
    | { id: number; name: string; muted_until?: string | null }
    | undefined;

  const mutedUntilStr = authUser?.muted_until ?? null;
  const mutedUntil = mutedUntilStr ? new Date(mutedUntilStr) : null;
  const isMuted = !!mutedUntil && mutedUntil > new Date();

  const [body, setBody] = useState("");
  const [notice, setNotice] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    if (!authUser) {
      setNotice({ type: "error", text: "Please log in to send messages." });
      return;
    }

    if (isMuted) {
      setNotice({
        type: "error",
        text: `You are muted${mutedUntil ? ` until ${mutedUntil.toLocaleString()}` : ""}.`,
      });
      return;
    }

    router.post(
      `/messages/${conversationId}`,
      { body: trimmed },
      {
        preserveScroll: true,
        onStart: () => setNotice(null),
        onSuccess: () => {
          setBody("");
          setNotice(null);
        },
        onError: (errors: any) => {
          const msg =
            errors?.body ||
            errors?.message ||
            "Could not send message. Please try again.";
          setNotice({ type: "error", text: String(msg) });
        },
      }
    );
  };

  return (
    <AppLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">
          {otherUser ? otherUser.name : "Direct Messages"}
        </h1>
      </div>

      <div className="w-full border rounded-xl p-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Discussion</h3>

          {otherUser ? (
            <span className="text-sm opacity-70">
              Messaging <span className="font-medium">{otherUser.name}</span>
            </span>
          ) : null}
        </div>

        <div
          ref={listRef}
          className="h-64 overflow-y-auto space-y-2 border rounded-lg p-2 bg-white/50"
        >
          {messages.length === 0 ? (
            <div className="text-sm opacity-70">No messages yet.</div>
          ) : (
            messages.map((m) => {
              const mine = !!authUser && m.sender_id === authUser.id;
              return (
                <div key={m.id} className="text-sm">
                  <span className={`font-medium ${mine ? "text-blue-700" : ""}`}>
                    {m.sender_name}:
                  </span>{" "}
                  <span>{m.body}</span>
                  <span className="opacity-60 text-xs ml-2">
                    {new Date(m.created_at).toLocaleTimeString()}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {notice && (
          <div
            className={`text-sm rounded-lg border px-3 py-2 ${
              notice.type === "error"
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-green-300 bg-green-50 text-green-700"
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

        {!authUser ? (
          <div className="text-sm opacity-70">
            <Link href="/login" className="underline">
              Log in
            </Link>{" "}
            to send messages.
          </div>
        ) : isMuted ? (
          <div className="text-sm text-red-600">
            You are muted{mutedUntil ? ` until ${mutedUntil.toLocaleString()}.` : "."}
          </div>
        ) : (
          <form onSubmit={send} className="flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Write a message…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isMuted}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (body.trim() && !isMuted) {
                    send(e as any);
                  }
                }
              }}
            />
            <button
              className="px-4 py-2 rounded-lg border disabled:opacity-50"
              type="submit"
              disabled={!body.trim() || isMuted}
            >
              Send
            </button>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
