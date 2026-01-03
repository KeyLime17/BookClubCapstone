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
  };
};

export default function NotificationBell() {
  const { props } = usePage() as any;
  const notifs: Notif[] = props.auth?.unreadNotifications ?? [];

  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  // close when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);
  
    function markRead(id: string) {
    router.post(`/notifications/${id}/read`, {}, { preserveScroll: true });
    }


  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="relative rounded-md p-2 hover:bg-gray-100"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {notifs.length > 0 && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-lg border bg-white shadow-lg z-50">
          <div className="px-4 py-2 text-sm font-semibold border-b">
            Notifications
          </div>

          {notifs.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No new notifications</div>
          ) : (
            <div className="max-h-96 overflow-auto">
              {notifs.map(n => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markRead(n.id)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b last:border-b-0"
                >
                  {n.data?.message ?? "Notification"}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
