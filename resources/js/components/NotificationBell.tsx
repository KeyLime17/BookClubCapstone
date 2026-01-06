import { useEffect, useRef, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Bell } from "lucide-react";

type Notif = {
  id: string;
  created_at?: string;
  data: {
    message?: string;
    submission_id?: number;
    type?: string;
    title?: string;

    // dm request
    kind?: string;
    conversation_id?: number;
    from_user_id?: number;
    from_user_name?: string;
  };
};

export default function NotificationBell() {
  const { props } = usePage() as any;
  const serverNotifs: Notif[] = props.auth?.unreadNotifications ?? [];

  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const [localNotifs, setLocalNotifs] = useState<Notif[]>(serverNotifs);

  useEffect(() => {
    setLocalNotifs(serverNotifs);
  }, [serverNotifs]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function markRead(id: string) {
    setLocalNotifs((prev) => prev.filter((n) => n.id !== id));
    router.post(`/notifications/${id}/read`, {}, { preserveScroll: true });
  }

  const acceptDm = (notifId: string, conversationId: number) => {
    setLocalNotifs((prev) => prev.filter((n) => n.id !== notifId));
    router.post(
      `/dm-requests/${conversationId}/accept`,
      { notification_id: notifId },
      { preserveScroll: true }
    );
  };

  const denyDm = (notifId: string, conversationId: number) => {
    setLocalNotifs((prev) => prev.filter((n) => n.id !== notifId));
    router.post(
      `/dm-requests/${conversationId}/deny`,
      { notification_id: notifId },
      { preserveScroll: true }
    );
  };

  const unreadCount = localNotifs.length;

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-2 hover:bg-muted/40"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-border bg-card text-foreground shadow-xl z-[9999]">
          <div className="px-4 py-2 text-sm font-semibold border-b border-border">
            Notifications
          </div>

          {unreadCount === 0 ? (
            <div className="p-4 text-sm text-foreground/70">No new notifications</div>
          ) : (
            <div className="max-h-96 overflow-auto">
              {localNotifs.map((n) => {
                const isDm = n.data?.kind === "dm_request";
                const convoId = Number(n.data?.conversation_id);

                if (isDm && Number.isFinite(convoId)) {
                  const fromName = n.data?.from_user_name ?? "Someone";
                  return (
                    <div
                      key={n.id}
                      className="w-full px-4 py-3 text-sm border-b border-border last:border-b-0"
                    >
                      <div className="font-medium">{fromName} wants to DM you.</div>

                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          className="text-xs px-3 py-1.5 rounded bg-gray-900 text-white hover:bg-gray-800"
                          onClick={() => acceptDm(n.id, convoId)}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="text-xs px-3 py-1.5 rounded border hover:bg-muted/40"
                          onClick={() => denyDm(n.id, convoId)}
                        >
                          Deny
                        </button>

                        <button
                          type="button"
                          className="ml-auto text-xs underline text-foreground/70 hover:text-foreground"
                          onClick={() => markRead(n.id)}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => markRead(n.id)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-muted/40 border-b border-border last:border-b-0"
                  >
                    {n.data?.message ?? "Notification"}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
