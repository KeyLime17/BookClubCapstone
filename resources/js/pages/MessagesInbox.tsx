import React from "react";
import AppLayout from "@/layouts/AppLayout";
import { router } from "@inertiajs/react";

type RequestRow = {
  conversation_id: number;
  other_user_id: number;
  other_user_name: string;
  other_user_avatar?: string | null;
  last_body?: string | null;
  last_at?: string | null;
};

type Props = {
  requests: RequestRow[];
};

export default function MessagesRequests({ requests }: Props) {
  const accept = (conversationId: number) => {
    router.post(
      `/messages/${conversationId}/accept`,
      {},
      { preserveScroll: true, replace: true }
    );
  };

  const deny = (conversationId: number) => {
    router.post(
      `/messages/${conversationId}/deny`,
      {},
      { preserveScroll: true, replace: true }
    );
  };

  return (
    <AppLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Message Requests</h1>
      </div>

      {requests.length === 0 ? (
        <div className="rounded border bg-white p-4 text-sm text-gray-600">
          No message requests.
        </div>
      ) : (
        <div className="divide-y rounded border bg-white">
          {requests.map((t) => (
            <div
              key={t.conversation_id}
              className="flex items-center gap-3 p-3"
            >
              <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
                {t.other_user_avatar ? (
                  <img
                    src={t.other_user_avatar}
                    alt={t.other_user_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-500">
                    {t.other_user_name?.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium truncate">{t.other_user_name}</div>
                  <div className="text-xs text-gray-500">
                    {t.last_at ? new Date(t.last_at).toLocaleString() : ""}
                  </div>
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {t.last_body ?? "No messages yet"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => deny(t.conversation_id)}
                  className="text-sm px-3 py-1.5 rounded border hover:bg-gray-50"
                >
                  Deny
                </button>
                <button
                  type="button"
                  onClick={() => accept(t.conversation_id)}
                  className="text-sm px-3 py-1.5 rounded bg-gray-900 text-white hover:bg-gray-800"
                >
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
