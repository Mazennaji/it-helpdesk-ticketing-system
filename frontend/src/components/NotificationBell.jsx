import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/notificationService";
import { startNotificationConnection } from "../realtime/notificationConnection";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const panelRef = useRef(null);

  useEffect(() => {
    fetchNotifications().then(setNotifications).catch(() => {});

    let conn;
    startNotificationConnection().then((c) => {
      conn = c;
      conn.on("ReceiveNotification", (dto) => {
        setNotifications((prev) => [dto, ...prev]);
      });
    });

    return () => {
      if (conn) conn.off("ReceiveNotification");
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleOpenNotification = async (n) => {
    if (!n.isRead) {
      await markNotificationRead(n.notificationId);
      setNotifications((prev) =>
        prev.map((x) => (x.notificationId === n.notificationId ? { ...x, isRead: true } : x))
      );
    }
    setOpen(false);
    if (n.ticketId) navigate(`/tickets/${n.ticketId}`);
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.6)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-[#0C1426]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-[fadeIn_0.12s_ease-out]">
          <div className="relative flex items-center justify-between px-4 py-3 border-b border-white/8">
            <div className="absolute inset-x-0 bottom-0 neon-line opacity-40" />
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto premium-scroll">
            {notifications.length === 0 && (
              <p className="text-sm text-slate-500 px-4 py-6 text-center">
                No notifications yet.
              </p>
            )}
            {notifications.map((n) => (
              <button
                key={n.notificationId}
                onClick={() => handleOpenNotification(n)}
                className={`w-full text-left px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${
                  !n.isRead ? "bg-blue-500/10" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 glow-dot mt-1.5 shrink-0" style={{ color: "#60A5FA" }} />}
                  <div className={!n.isRead ? "" : "ml-3.5"}>
                    <p className="text-sm text-slate-200">{n.message}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {n.ticketReferenceNo && `${n.ticketReferenceNo} \u00B7 `}
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}