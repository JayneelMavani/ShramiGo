import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Loader2,
  MapPin,
  Navigation,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  markCashReceived,
  updateBookingStatus,
  type Booking,
} from "../../services/bookings";

type WorkerStatus = "accepted" | "on_the_way" | "in_progress" | "completed";

const STATUS_LABELS: Record<WorkerStatus, string> = {
  accepted: "Job Accepted",
  on_the_way: "On the Way",
  in_progress: "Work in Progress",
  completed: "Job Completed",
};

const BUTTON_LABELS: Record<WorkerStatus, string> = {
  accepted: "Start Driving",
  on_the_way: "I've Arrived – Start Service",
  in_progress: "Service Completed",
  completed: "Back to Dashboard",
};

const NEXT_STATUS: Record<WorkerStatus, string | null> = {
  accepted: "on_the_way",
  on_the_way: "in_progress",
  in_progress: "completed",
  completed: null,
};

export default function ActiveJob() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const stateBooking = (location.state as { booking?: Booking } | null)
    ?.booking;

  const [booking, setBooking] = useState<Booking | null>(
    stateBooking ?? null
  );
  const [jobStatus, setJobStatus] = useState<WorkerStatus>(
    (stateBooking?.status as WorkerStatus) ?? "accepted"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Always refresh the authoritative booking state when this screen opens.
  // This keeps worker and customer tracking synchronized even after a page refresh.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const loadBooking = async () => {
      try {
        const latest = await getBooking(Number(id));
        if (!cancelled) {
          setBooking(latest);
          if (["accepted", "on_the_way", "in_progress", "completed"].includes(latest.status)) {
            setJobStatus(latest.status as WorkerStatus);
          }
        }
      } catch (err) {
        if (!cancelled && !stateBooking) {
          setError(err instanceof Error ? err.message : "Failed to load active job.");
        }
      }
    };

    loadBooking();
    const interval = window.setInterval(loadBooking, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [id, stateBooking]);

  const handleStatusChange = async () => {
    if (
      jobStatus === "in_progress" &&
      booking?.payment_method === "cash" &&
      booking.payment_status === "cash_pending"
    ) {
      try {
        setLoading(true);
        setError("");
        const updated = await markCashReceived(booking.id);
        setBooking(updated);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to confirm cash payment.");
      } finally {
        setLoading(false);
      }
      return;
    }

    const nextStatus = NEXT_STATUS[jobStatus];

    if (!nextStatus) {
      // Job completed → go back to dashboard
      navigate("/worker");
      return;
    }

    if (!booking) {
      navigate("/worker");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const updated = await updateBookingStatus(booking.id, nextStatus);
      setBooking(updated);
      setJobStatus(nextStatus as WorkerStatus);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update status."
      );
    } finally {
      setLoading(false);
    }
  };

  const isCompleted = jobStatus === "completed";

  const formatDate = (dateStr: string) =>
    new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
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
      <div className="w-full max-w-md min-h-screen bg-[#F7F8F8]">

        {/* Header */}
        <div className="bg-[#087F7A] px-5 pt-7 pb-7 rounded-b-[30px] text-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/worker")}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
            >
              <ArrowLeft size={19} />
            </button>

            <div className="flex-1">
              <p className="text-xs text-white/60">Worker dashboard</p>
              <h1 className="text-xl font-bold mt-1">Active Job</h1>
            </div>

            <span
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold ${
                isCompleted
                  ? "bg-green-400/20 text-green-100"
                  : "bg-white/10 text-white/80"
              }`}
            >
              {STATUS_LABELS[jobStatus]}
            </span>
          </div>

          {/* Earning */}
          {booking && (
            <div className="mt-6 bg-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Earning for this job</p>
                <div className="flex items-center gap-1 mt-1">
                  <IndianRupee size={20} />
                  <span className="text-2xl font-bold">
                    {booking.worker_payout}
                  </span>
                </div>
              </div>

              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                {isCompleted ? (
                  <CheckCircle2 size={21} />
                ) : (
                  <ShieldCheck size={21} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-5 pt-5 pb-32">

          {/* Status Steps */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-base font-bold text-gray-900 mb-5">
              Job Progress
            </h2>

            {(["accepted", "on_the_way", "in_progress", "completed"] as WorkerStatus[]).map(
              (step, idx, arr) => {
                const done = arr.indexOf(jobStatus) >= arr.indexOf(step);
                const active = step === jobStatus;
                const isLast = idx === arr.length - 1;
                const labels: Record<WorkerStatus, string> = {
                  accepted: "Accepted",
                  on_the_way: "On the Way",
                  in_progress: "In Progress",
                  completed: "Completed",
                };

                return (
                  <div key={step} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          done ? "bg-[#087F7A]" : "bg-gray-100"
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 size={16} className="text-white" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                        )}
                      </div>
                      {!isLast && (
                        <div
                          className={`w-[2px] h-8 ${
                            done ? "bg-[#087F7A]" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>

                    <div className="pt-1 pb-3">
                      <p
                        className={`text-sm font-semibold ${
                          active || done
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        {labels[step]}
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* Job Details */}
          {booking && (
            <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <h2 className="text-base font-bold text-gray-900">
                Job Details
              </h2>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#EAF7F5] flex items-center justify-center">
                  <UserRound size={16} className="text-[#087F7A]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Customer ID</p>
                  <p className="text-sm font-semibold text-gray-800">
                    #{booking.customer_id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#EAF7F5] flex items-center justify-center">
                  <Clock3 size={16} className="text-[#087F7A]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">
                    Date & Time
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatDate(String(booking.booking_date))} at{" "}
                    {formatTime(String(booking.booking_time))} ·{" "}
                    {booking.hours} hr{booking.hours > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#EAF7F5] flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-[#087F7A]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Address</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {booking.service_address}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="w-full mt-2 h-11 rounded-xl border border-[#087F7A]/20 text-[#087F7A] text-xs font-bold flex items-center justify-center gap-2"
              >
                <Navigation size={15} />
                Navigate to Location
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-5 py-4 z-20">
          <button
            type="button"
            onClick={handleStatusChange}
            disabled={loading}
            className={`w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition ${
              isCompleted
                ? "bg-[#087F7A] text-white"
                : "bg-[#FF5A00] text-white"
            } disabled:bg-gray-300 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Updating...
              </>
            ) : (
              jobStatus === "in_progress" && booking?.payment_method === "cash" && booking.payment_status === "cash_pending"
                ? "Confirm cash received"
                : BUTTON_LABELS[jobStatus]
            )}
          </button>
        </div>
      </div>
    </div>
  );
}