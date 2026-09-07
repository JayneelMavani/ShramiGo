import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  IndianRupee,
  Loader2,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { getWorkerBookings, type Booking } from "../../services/bookings";

type Period = "This Week" | "This Month" | "All Time";

const periods: Period[] = ["This Week", "This Month", "All Time"];

function isInPeriod(booking: Booking, period: Period): boolean {
  const now = new Date();
  const bookingDate = new Date(
    `${String(booking.booking_date)}T00:00:00`
  );

  if (period === "All Time") return true;

  if (period === "This Month") {
    return (
      bookingDate.getMonth() === now.getMonth() &&
      bookingDate.getFullYear() === now.getFullYear()
    );
  }

  // This Week – last 7 days
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  return bookingDate >= weekAgo;
}

export default function Earnings() {
  const navigate = useNavigate();
  const [activePeriod, setActivePeriod] = useState<Period>("This Month");
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getWorkerBookings();
        // Only show paid, completed bookings as earnings
        setAllBookings(
          data.filter(
            (b) =>
              b.status === "completed" && b.payment_status === "paid"
          )
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load earnings."
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredBookings = allBookings.filter((b) =>
    isInPeriod(b, activePeriod)
  );

  const totalEarnings = filteredBookings.reduce(
    (sum, b) => sum + Number(b.worker_payout),
    0
  );
  const totalJobs = filteredBookings.length;

  const formatDate = (dateStr: string) =>
    new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

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

            <div>
              <p className="text-xs text-white/60">Worker account</p>
              <h1 className="text-xl font-bold mt-1">Earnings</h1>
            </div>
          </div>

          {/* Total earnings */}
          <div className="mt-7">
            <p className="text-xs text-white/60">Total earnings</p>

            {loading ? (
              <div className="mt-2">
                <Loader2
                  size={22}
                  className="animate-spin text-white/60"
                />
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-1">
                <IndianRupee size={28} />
                <span className="text-4xl font-bold">
                  {totalEarnings.toFixed(0)}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 mt-2 text-white/70">
              <TrendingUp size={14} />
              <p className="text-xs">{totalJobs} jobs completed</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <BriefcaseBusiness size={16} className="text-white/60" />
                <p className="text-xs text-white/60">Jobs Done</p>
              </div>
              <p className="text-2xl font-bold mt-2">{totalJobs}</p>
            </div>

            <div className="bg-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-white/60" />
                <p className="text-xs text-white/60">Avg/Job</p>
              </div>
              <p className="text-2xl font-bold mt-2">
                ₹
                {totalJobs > 0
                  ? Math.round(totalEarnings / totalJobs)
                  : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Period tabs */}
        <div className="px-5 pt-5">
          <div className="flex gap-2">
            {periods.map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setActivePeriod(period)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                  activePeriod === period
                    ? "bg-[#087F7A] text-white"
                    : "bg-white text-gray-600 border border-gray-100"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="px-5 pt-5 pb-10">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Transaction History
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-[#087F7A]" />
              <p className="text-sm text-gray-500 mt-3">
                Loading earnings...
              </p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-red-100 p-8 text-center">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto">
                <Wallet size={22} className="text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-900 mt-4">
                No earnings yet
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                Completed bookings will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EAF7F5] flex items-center justify-center">
                      <BriefcaseBusiness
                        size={18}
                        className="text-[#087F7A]"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        Booking #{b.id}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                        <CalendarDays size={11} />
                        {formatDate(String(b.booking_date))} ·{" "}
                        {b.hours} hr{b.hours > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-[#087F7A]">
                      +₹{Number(b.worker_payout).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-green-600 font-semibold mt-0.5">
                      Paid
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}