import React, { useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { router } from "@inertiajs/react";

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
  const [body, setBody] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    router.post(
      `/messages/${conversationId}`,
      { body: trimmed },
      {
        preserveScroll: true,
        onSuccess: () => setBody(""),
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

      <div className="rounded border bg-white">
        <div className="h-[420px] overflow-y-auto p-3 space-y-2 border-b">
          {messages.length === 0 ? (
            <div className="text-sm text-gray-600">No messages yet.</div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="text-sm">
                <span className="font-medium">{m.sender_name}:</span>{" "}
                <span>{m.body}</span>
                <span className="ml-2 text-xs text-gray-400">
                  {new Date(m.created_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>

        <form onSubmit={send} className="p-3 flex gap-2">
          <input
            className="flex-1 rounded border px-3 py-2 text-sm"
            placeholder="Write a message…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button
            type="submit"
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            disabled={!body.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
