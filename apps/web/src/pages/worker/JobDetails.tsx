import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Loader2,
  MapPin,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import {
  getBooking,
  updateBookingStatus,
  type Booking,
} from "../../services/bookings";

export default function JobDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const stateBooking = (location.state as { booking?: Booking } | null)
    ?.booking;

  const [booking, setBooking] = useState<Booking | null>(
    stateBooking ?? null
  );
  const [loading, setLoading] = useState(!stateBooking);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<
    "accept" | "reject" | null
  >(null);

  useEffect(() => {
    if (stateBooking || !id) return;

    async function load() {
      try {
        setLoading(true);
        const data = await getBooking(Number(id));
        setBooking(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load booking."
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, stateBooking]);

  const handleAccept = async () => {
    if (!booking) return;
    try {
      setActionLoading("accept");
      const updated = await updateBookingStatus(booking.id, "accepted");
      setBooking(updated);
      navigate(`/worker/active-job/${booking.id}`, {
        state: { booking: updated },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to accept job."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!booking) return;
    try {
      setActionLoading("reject");
      await updateBookingStatus(booking.id, "cancelled");
      navigate("/worker/job-requests");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reject job."
      );
    } finally {
      setActionLoading(null);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8F8] flex justify-center">
        <div className="w-full max-w-md min-h-screen flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#087F7A]" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#F7F8F8] flex justify-center">
        <div className="w-full max-w-md min-h-screen flex items-center justify-center">
          <div className="text-center px-8">
            <p className="text-sm text-red-500">
              {error || "Booking not found."}
            </p>
            <button
              onClick={() => navigate("/worker/job-requests")}
              className="mt-4 px-5 py-2.5 rounded-xl bg-[#FF5A00] text-white text-sm font-semibold"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPending = booking.status === "pending";

  return (
    <div className="min-h-screen bg-[#F7F8F8] flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-[#F7F8F8]">

        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100">
          <div className="px-5 pt-7 pb-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/worker/job-requests")}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-[#E5E7EB] transition active:scale-95"
            >
              <ArrowLeft size={19} />
            </button>

            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                Job Details
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Review the request before accepting
              </p>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-orange-50 text-[#FF5A00] text-[10px] font-bold capitalize">
              {booking.status}
            </span>
          </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pt-5 pb-32">

          {/* Service Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center">
                <BriefcaseBusiness size={24} className="text-[#FF5A00]" />
              </div>

              <div className="flex-1">
                <p className="text-xs text-gray-400">Service requested</p>
                <h2 className="text-xl font-bold text-gray-900 mt-1">
                  Booking #{booking.id}
                </h2>

                <div className="flex items-center gap-1 mt-2">
                  <ShieldCheck size={14} className="text-[#087F7A]" />
                  <span className="text-[11px] text-[#087F7A] font-medium">
                    Verified request
                  </span>
                </div>
              </div>
            </div>

            {booking.description && (
              <div className="border-t border-gray-100 mt-5 pt-5">
                <p className="text-xs font-semibold text-gray-900 mb-2">
                  Customer requirement
                </p>
                <p className="text-sm text-gray-500 leading-6">
                  {booking.description}
                </p>
              </div>
            )}
          </div>

          {/* Customer */}
          <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-base font-bold text-gray-900">Customer</h2>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#087F7A]/10 flex items-center justify-center">
                  <UserRound size={19} className="text-[#087F7A]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Customer #{booking.customer_id}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Verified customer
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-base font-bold text-gray-900">
              Schedule & Location
            </h2>

            <div className="space-y-5 mt-5">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <CalendarDays size={17} className="text-[#FF5A00]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Date</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {formatDate(String(booking.booking_date))}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                  <Clock3 size={17} className="text-[#087F7A]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">
                    Preferred time
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {formatTime(String(booking.booking_time))} ·{" "}
                    {booking.hours} hr
                    {booking.hours > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <MapPin size={17} className="text-[#FF5A00]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">
                    Service location
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {booking.service_address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings */}
          <div className="mt-4 bg-[#087F7A] rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Estimated earning</p>
                <div className="flex items-center gap-1 mt-1">
                  <IndianRupee size={22} />
                  <span className="text-2xl font-bold">
                    {booking.total_amount}
                  </span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                <CheckCircle2 size={21} />
              </div>
            </div>
            <p className="text-[10px] text-white/60 mt-3">
              ₹{booking.hourly_rate}/hr × {booking.hours} hr
              {booking.hours > 1 ? "s" : ""} + ₹{booking.service_charge}{" "}
              service charge
            </p>
          </div>

          {/* Error display */}
          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Bottom actions (only for pending bookings) */}
        {isPending && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-5 py-4 z-20">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading !== null}
                className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-50"
              >
                {actionLoading === "reject" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <X size={20} />
                )}
              </button>

              <button
                type="button"
                onClick={handleAccept}
                disabled={actionLoading !== null}
                className="flex-1 h-12 rounded-xl bg-[#FF5A00] text-white text-sm font-bold shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {actionLoading === "accept" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Accepting...
                  </>
                ) : (
                  "Accept Job"
                )}
              </button>
            </div>
          </div>
        )}

        {/* For already-accepted: go to active job */}
        {booking.status === "accepted" && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-5 py-4 z-20">
            <button
              type="button"
              onClick={() =>
                navigate(`/worker/active-job/${booking.id}`, {
                  state: { booking },
                })
              }
              className="w-full h-12 rounded-xl bg-[#087F7A] text-white text-sm font-bold"
            >
              View Active Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
}