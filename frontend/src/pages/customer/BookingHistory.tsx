import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  ChevronRight,
  Loader2,
} from "lucide-react";

import {
  getMyBookings,
  type Booking,
} from "../../services/bookings";

type BookingTab = "upcoming" | "completed" | "cancelled";

export default function Bookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] =
    useState<BookingTab>("upcoming");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyBookings();

        setBookings(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load bookings."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  const upcomingBookings = bookings.filter(
    (booking) =>
      !["completed", "cancelled"].includes(
        booking.status.toLowerCase()
      )
  );

  const completedBookings = bookings.filter(
    (booking) =>
      booking.status.toLowerCase() === "completed"
  );

  const cancelledBookings = bookings.filter(
    (booking) =>
      booking.status.toLowerCase() === "cancelled"
  );

  const filteredBookings =
    activeTab === "upcoming"
      ? upcomingBookings
      : activeTab === "completed"
      ? completedBookings
      : cancelledBookings;

  const formatDate = (date: string) => {
    const parsedDate = new Date(`${date}T00:00:00`);

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-50 text-green-700";

      case "cancelled":
        return "bg-red-50 text-red-600";

      case "accepted":
      case "confirmed":
        return "bg-blue-50 text-blue-700";

      case "in_progress":
      case "in-progress":
        return "bg-orange-50 text-orange-700";

      default:
        return "bg-yellow-50 text-yellow-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "in_progress":
        return "In Progress";

      case "pending":
        return "Pending";

      case "accepted":
        return "Accepted";

      case "confirmed":
        return "Confirmed";

      case "completed":
        return "Completed";

      case "cancelled":
        return "Cancelled";

      default:
        return status;
    }
  };

  const openBooking = (booking: Booking) => {
    navigate(`/customer/booking-tracking`, {
      state: {
        booking,
      },
    });
  };

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
              My Bookings
            </h1>

            <div className="w-10" />
          </div>
        </header>

        {/* Tabs */}
        <div className="px-5 pt-5">
          <div className="grid grid-cols-3 bg-gray-100 rounded-xl p-1">
            <TabButton
              label="Upcoming"
              active={activeTab === "upcoming"}
              onClick={() => setActiveTab("upcoming")}
            />

            <TabButton
              label="Completed"
              active={activeTab === "completed"}
              onClick={() => setActiveTab("completed")}
            />

            <TabButton
              label="Cancelled"
              active={activeTab === "cancelled"}
              onClick={() => setActiveTab("cancelled")}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pt-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2
                size={32}
                className="animate-spin text-[#087F7A]"
              />

              <p className="text-sm text-gray-500 mt-3">
                Loading your bookings...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
              <p className="text-sm text-red-600">
                {error}
              </p>

              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-5 py-2.5 rounded-xl bg-[#FF5A00] text-white text-sm font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <EmptyState activeTab={activeTab} />
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onClick={() => openBooking(booking)}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  getStatusStyle={getStatusStyle}
                  getStatusLabel={getStatusLabel}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-2.5 rounded-lg text-xs font-semibold transition ${
        active
          ? "bg-white text-[#087F7A] shadow-sm"
          : "text-gray-500"
      }`}
    >
      {label}
    </button>
  );
}

function BookingCard({
  booking,
  onClick,
  formatDate,
  formatTime,
  getStatusStyle,
  getStatusLabel,
}: {
  booking: Booking;
  onClick: () => void;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  getStatusStyle: (status: string) => string;
  getStatusLabel: (status: string) => string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:border-gray-200 transition"
    >
      {/* Top Row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-900">
            Booking #{booking.id}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Service ID: {booking.service_id ?? "N/A"}
          </p>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusStyle(
            booking.status
          )}`}
        >
          {getStatusLabel(booking.status)}
        </span>
      </div>

      {/* Booking Info */}
      <div className="mt-4 space-y-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EAF7F5] flex items-center justify-center">
            <CalendarDays
              size={16}
              className="text-[#087F7A]"
            />
          </div>

          <div>
            <p className="text-[10px] text-gray-400">
              Date
            </p>

            <p className="text-xs font-semibold text-gray-800">
              {formatDate(booking.booking_date)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EAF7F5] flex items-center justify-center">
            <Clock3
              size={16}
              className="text-[#087F7A]"
            />
          </div>

          <div>
            <p className="text-[10px] text-gray-400">
              Time
            </p>

            <p className="text-xs font-semibold text-gray-800">
              {formatTime(booking.booking_time)} ·{" "}
              {booking.hours} hr
              {booking.hours > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EAF7F5] flex items-center justify-center shrink-0">
            <MapPin
              size={16}
              className="text-[#087F7A]"
            />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] text-gray-400">
              Service Location
            </p>

            <p className="text-xs font-semibold text-gray-800 line-clamp-2">
              {booking.service_address}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-gray-400">
            Total Amount
          </p>

          <p className="text-base font-bold text-[#FF5A00]">
            ₹{booking.total_amount}
          </p>

          <p className="text-[10px] text-gray-500 mt-0.5">
            Payment:{" "}
            <span
              className={
                booking.payment_status === "paid"
                  ? "text-green-600 font-semibold"
                  : "text-yellow-600 font-semibold"
              }
            >
              {booking.payment_status}
            </span>
          </p>
        </div>

        <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center">
          <ChevronRight
            size={18}
            className="text-gray-500"
          />
        </div>
      </div>
    </button>
  );
}

function EmptyState({
  activeTab,
}: {
  activeTab: BookingTab;
}) {
  const title =
    activeTab === "upcoming"
      ? "No upcoming bookings"
      : activeTab === "completed"
      ? "No completed bookings"
      : "No cancelled bookings";

  const description =
    activeTab === "upcoming"
      ? "Your upcoming service bookings will appear here."
      : activeTab === "completed"
      ? "Completed services will appear here."
      : "Cancelled bookings will appear here.";

  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-[#EAF7F5] flex items-center justify-center">
        <CalendarDays
          size={28}
          className="text-[#087F7A]"
        />
      </div>

      <h2 className="text-base font-bold text-gray-900 mt-5">
        {title}
      </h2>

      <p className="text-xs text-gray-500 mt-2 max-w-[260px]">
        {description}
      </p>
    </div>
  );
}