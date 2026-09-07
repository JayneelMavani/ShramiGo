import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";

import { getBooking, cancelBooking, type Booking } from "../../services/bookings";

// Ordered booking statuses for progress display
const STATUS_ORDER = [
  "pending",
  "accepted",
  "on_the_way",
  "in_progress",
  "completed",
];

const STATUS_LABELS: Record<string, string> = {
  pending: "Booking Confirmed",
  accepted: "Worker Assigned",
  on_the_way: "On the Way",
  in_progress: "Service Started",
  completed: "Service Completed",
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  pending: "Your booking has been confirmed. Waiting for worker to accept.",
  accepted: "Worker has accepted and will arrive soon.",
  on_the_way: "Worker is heading to your location.",
  in_progress: "Service is currently in progress.",
  completed: "Service has been completed successfully.",
};

function getStatusIndex(status: string): number {
  const normalized = status.toLowerCase();
  const idx = STATUS_ORDER.indexOf(normalized);
  return idx === -1 ? 0 : idx;
}

export default function BookingTracking() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { booking?: Booking } | null;
  const initialBooking = state?.booking;

  const [booking, setBooking] = useState<Booking | null>(
    initialBooking ?? null
  );
  const [loadError, setLoadError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (booking?.id) {
      sessionStorage.setItem("shramigo_tracking_booking_id", String(booking.id));
      return;
    }

    const storedId = sessionStorage.getItem("shramigo_tracking_booking_id");
    if (!storedId) return;

    getBooking(Number(storedId))
      .then(setBooking)
      .catch(() => setLoadError("Unable to load the booking. Please open it again from My Bookings."));
  }, [booking?.id]);

  const handleCancelBooking = async () => {
    if (!booking) return;
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      setCancelling(true);
      const updated = await cancelBooking(booking.id);
      setBooking(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel booking.");
    } finally {
      setCancelling(false);
    }
  };

  // Keep customer tracking synchronized with worker actions.
  useEffect(() => {
    if (!booking) return;

    // Don't poll if already at a terminal state
    const isTerminal =
      booking.status === "completed" || booking.status === "cancelled";

    if (isTerminal) return;

    const poll = async () => {
      try {
        const updated = await getBooking(booking.id);
        setBooking(updated);
      } catch {
        // Silent – don't disrupt the UI on poll failure
      }
    };

    pollingRef.current = setInterval(poll, 5_000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [booking?.id, booking?.status]);

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#F7F8F8] flex justify-center">
        <main className="w-full max-w-[430px] min-h-screen bg-white flex items-center justify-center">
          <div className="text-center px-8">
            <p className="text-sm text-red-500">
              {loadError || "Booking data not found."}
            </p>
            <button
              onClick={() => navigate("/customer/bookings")}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#FF5A00] text-white text-sm font-semibold"
            >
              View My Bookings
            </button>
          </div>
        </main>
      </div>
    );
  }

  const statusIndex = getStatusIndex(booking.status);
  const isCancelled = booking.status === "cancelled";

  // Status banner text
  const bannerTitle = isCancelled
    ? "Booking Cancelled"
    : STATUS_LABELS[booking.status] ?? "Booking Pending";
  const bannerDesc = isCancelled
    ? "This booking has been cancelled."
    : STATUS_DESCRIPTIONS[booking.status] ??
      "Waiting for worker to accept your booking.";

  const formatDate = (dateStr: string) =>
    new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m);
    return d.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F8F8] flex justify-center">
      <main className="w-full max-w-[430px] min-h-screen bg-white relative pb-8 shadow-sm">

        {/* Header */}
        <header className="h-16 px-5 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-30">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-gray-800" />
          </button>

          <h1 className="text-[17px] font-bold text-gray-900">
            Track Booking
          </h1>

          <div className="w-10" />
        </header>

        <div className="px-5 pt-5">

          {/* Status Banner */}
          <section
            className={`rounded-2xl border p-5 ${
              isCancelled
                ? "bg-red-50 border-red-200"
                : "bg-[#EAF7F5] border-[#D5EFEB]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center ${
                  isCancelled ? "bg-red-400" : "bg-[#087F7A]"
                }`}
              >
                <CheckCircle2 size={25} className="text-white" />
              </div>

              <div>
                <p className="text-[16px] font-bold text-gray-900">
                  {bannerTitle}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {bannerDesc}
                </p>
              </div>
            </div>
          </section>

          {/* Progress Steps */}
          {!isCancelled && (
            <section className="mt-7">
              <h2 className="text-[16px] font-bold text-gray-900">
                Booking Status
              </h2>

              <div className="mt-4">
                {STATUS_ORDER.map((step, idx) => {
                  const completed = idx < statusIndex;
                  const active = idx === statusIndex;
                  const isLast = idx === STATUS_ORDER.length - 1;

                  return (
                    <StatusStep
                      key={step}
                      title={STATUS_LABELS[step]}
                      description={STATUS_DESCRIPTIONS[step]}
                      completed={completed}
                      active={active}
                      last={isLast}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* Service Details */}
          <section className="mt-7">
            <h2 className="text-[16px] font-bold text-gray-900">
              Service Details
            </h2>

            <div className="mt-3 space-y-2.5">
              <DetailRow
                icon={<UserRound size={18} />}
                title="Booking ID"
                value={`#${booking.id}`}
              />

              <DetailRow
                icon={<CalendarDays size={18} />}
                title="Date"
                value={formatDate(String(booking.booking_date))}
              />

              <DetailRow
                icon={<Clock3 size={18} />}
                title="Time"
                value={formatTime(String(booking.booking_time))}
              />

              <DetailRow
                icon={<MapPin size={18} />}
                title="Service Location"
                value={booking.service_address}
              />
            </div>
          </section>

          {/* Payment Summary */}
          <section className="mt-6">
            <div className="rounded-2xl bg-[#F8FAFA] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Booking Amount</p>

                  <p className="text-xl font-bold text-gray-900 mt-1">
                    ₹{booking.total_amount}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[#087F7A]">
                  <ShieldCheck size={18} />

                  <span className="text-xs font-semibold">
                    {booking.payment_status === "paid"
                      ? "Paid"
                      : booking.payment_status === "cash_pending"
                      ? "Cash on Completion"
                      : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Rate & Invoice buttons (only for completed bookings) */}
          {booking.status === "completed" && (
            <div className="mt-5 space-y-3">
              <button
                onClick={() =>
                  navigate("/customer/rating", {
                    state: { booking },
                  })
                }
                className="w-full h-12 rounded-xl bg-[#FF5A00] text-white text-sm font-bold active:scale-[0.98] transition"
              >
                <Star size={16} className="inline mr-2" />
                Rate Your Experience
              </button>

              <button
                onClick={() =>
                  navigate("/customer/invoice", {
                    state: { booking },
                  })
                }
                className="w-full h-12 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold active:scale-[0.98] transition"
              >
                View Invoice
              </button>
            </div>
          )}

          {/* Cancel pending booking */}
          {booking.status === "pending" && (
            <button
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="w-full mt-4 h-12 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold active:scale-[0.98] transition hover:bg-red-100 flex items-center justify-center gap-2"
            >
              {cancelling ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Cancelling booking...
                </>
              ) : (
                "Cancel Booking"
              )}
            </button>
          )}

          {/* View bookings */}
          <button
            onClick={() => navigate("/customer/bookings")}
            className="w-full mt-4 h-12 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold active:scale-[0.98] transition"
          >
            View My Bookings
          </button>
        </div>
      </main>
    </div>
  );
}

function StatusStep({
  title,
  description,
  completed = false,
  active = false,
  last = false,
}: {
  title: string;
  description: string;
  completed?: boolean;
  active?: boolean;
  last?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            completed
              ? "bg-[#087F7A]"
              : active
              ? "bg-[#FF5A00]"
              : "bg-gray-100"
          }`}
        >
          {completed ? (
            <CheckCircle2 size={18} className="text-white" />
          ) : (
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                active ? "bg-white" : "bg-gray-300"
              }`}
            />
          )}
        </div>

        {!last && (
          <div
            className={`w-[2px] h-10 ${
              completed ? "bg-[#087F7A]" : "bg-gray-200"
            }`}
          />
        )}
      </div>

      <div className="pt-1 pb-3">
        <p
          className={`text-sm font-semibold ${
            active || completed ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {title}
        </p>

        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50">
      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#087F7A] shrink-0">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] text-gray-500">{title}</p>

        <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}