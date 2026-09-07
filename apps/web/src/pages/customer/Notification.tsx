import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  CreditCard,
  Loader2,
  MessageCircle,
  Star,
} from "lucide-react";

import {
  getNotifications,
  markAllRead,
  markRead,
  type Notification,
} from "../../services/notifications";

function getNotifIcon(type: string) {
  switch (type) {
    case "booking_request":
    case "booking_accepted":
    case "booking_cancelled":
      return <BriefcaseBusiness size={20} className="text-[#FF5A00]" />;
    case "payment_received":
      return <CreditCard size={20} className="text-[#087F7A]" />;
    case "review":
      return <Star size={20} className="text-yellow-500" />;
    case "booking_completed":
      return <CheckCircle2 size={20} className="text-[#087F7A]" />;
    default:
      return <Bell size={20} className="text-gray-500" />;
  }
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function CustomerNotification() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getNotifications();
        setNotifications(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load notifications."
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // Silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // Silent
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[#F7F8F8] flex justify-center">
      <main className="w-full max-w-[430px] min-h-screen bg-white shadow-sm pb-10">

        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-gray-100">
          <div className="h-full px-5 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <ArrowLeft size={20} />
            </button>

            <h1 className="text-[17px] font-bold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-[#FF5A00] text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </h1>

            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || markingAll}
              className="text-[11px] text-[#087F7A] font-semibold disabled:text-gray-300"
            >
              {markingAll ? "..." : "Mark all read"}
            </button>
          </div>
        </header>

        <div className="px-5 pt-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2
                size={32}
                className="animate-spin text-[#087F7A]"
              />
              <p className="text-sm text-gray-500 mt-3">
                Loading notifications...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
                <Bell size={28} className="text-gray-300" />
              </div>
              <h3 className="font-bold text-gray-900 mt-5">
                No notifications yet
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                You'll be notified about your bookings here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleMarkRead(notif.id)}
                  className={`w-full text-left rounded-2xl border p-4 transition ${
                    !notif.is_read
                      ? "bg-[#EAF7F5] border-[#D5EFEB]"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        !notif.is_read ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      {getNotifIcon(notif.notif_type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm font-bold truncate ${
                            !notif.is_read
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notif.title}
                        </p>

                        <span className="text-[10px] text-gray-400 shrink-0">
                          {formatRelativeTime(notif.created_at)}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 leading-5 mt-1">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  {!notif.is_read && (
                    <div className="flex justify-end mt-2">
                      <div className="w-2 h-2 rounded-full bg-[#087F7A]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}