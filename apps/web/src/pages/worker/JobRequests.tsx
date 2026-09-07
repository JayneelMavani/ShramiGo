import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  Filter,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import { getWorkerBookings, type Booking } from "../../services/bookings";

const STATUS_LABELS: Record<string, string> = {
  pending: "New",
  accepted: "Accepted",
  on_the_way: "On the Way",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function JobRequests() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted">("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getWorkerBookings();
        // Show pending + accepted only in "job requests"
        setBookings(
          data.filter((b) =>
            ["pending", "accepted"].includes(b.status.toLowerCase())
          )
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load jobs."
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredBookings = bookings
    .filter((b) => {
      if (statusFilter !== "all" && b.status.toLowerCase() !== statusFilter) {
        return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        b.service_address.toLowerCase().includes(q) ||
        String(b.id).includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "amount") {
        return b.total_amount - a.total_amount;
      }
      return b.id - a.id;
    });

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
        <div className="bg-white px-5 pt-7 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/worker")}
              className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-700"
            >
              <ArrowLeft size={19} />
            </button>

            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                Job Requests
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Pending and accepted bookings
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                showFilters || statusFilter !== "all" || sortBy !== "date"
                  ? "bg-[#087F7A] text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
              aria-label="Filter job requests"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="mt-5 relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by address or booking ID"
              className="w-full h-12 rounded-2xl bg-[#F7F8F8] border border-gray-100 pl-11 pr-4 text-sm text-gray-900 outline-none focus:border-[#087F7A]"
            />
          </div>

          {/* Filter Drawer */}
          {showFilters && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2 animate-in fade-in duration-150">
              <span className="text-[11px] font-semibold text-gray-500 self-center mr-1">Status:</span>
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  statusFilter === "all" ? "bg-[#087F7A] text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  statusFilter === "pending" ? "bg-[#FF5A00] text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("accepted")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  statusFilter === "accepted" ? "bg-[#087F7A] text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                Accepted
              </button>

              <span className="text-[11px] font-semibold text-gray-500 self-center ml-2 mr-1">Sort:</span>
              <button
                type="button"
                onClick={() => setSortBy(sortBy === "date" ? "amount" : "date")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  sortBy === "amount" ? "bg-[#087F7A] text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {sortBy === "amount" ? "Highest ₹ first" : "Latest first"}
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-5 pt-5 pb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Available jobs
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {filteredBookings.length} requests found
              </p>
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-gray-500"
            >
              <Filter size={14} />
              Newest
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[#087F7A]" />
              <p className="text-sm text-gray-500 mt-3">Loading jobs...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-red-100 p-8 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-5 py-2.5 rounded-xl bg-[#FF5A00] text-white text-sm font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto">
                <Search size={23} className="text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-900 mt-4">No jobs found</h3>
              <p className="text-xs text-gray-500 mt-2">
                You have no pending job requests right now.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
                        <BriefcaseBusiness
                          size={19}
                          className="text-[#FF5A00]"
                        />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-gray-900">
                          Booking #{booking.id}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <UserRound size={12} className="text-gray-400" />
                          <span className="text-[11px] text-gray-500">
                            Customer #{booking.customer_id}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-orange-50 text-[#FF5A00] text-[10px] font-bold">
                      {STATUS_LABELS[booking.status] ?? booking.status}
                    </span>
                  </div>

                  {/* Description */}
                  {booking.description && (
                    <p className="text-xs text-gray-500 leading-5 mt-4">
                      {booking.description}
                    </p>
                  )}

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="flex items-start gap-2">
                      <MapPin
                        size={15}
                        className="text-[#087F7A] mt-0.5"
                      />
                      <div>
                        <p className="text-[10px] text-gray-400">
                          Location
                        </p>
                        <p className="text-xs font-medium text-gray-700 mt-0.5 line-clamp-2">
                          {booking.service_address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CalendarDays
                        size={15}
                        className="text-[#087F7A] mt-0.5"
                      />
                      <div>
                        <p className="text-[10px] text-gray-400">
                          Preferred time
                        </p>
                        <p className="text-xs font-medium text-gray-700 mt-0.5">
                          {formatDate(String(booking.booking_date))}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {formatTime(String(booking.booking_time))}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400">
                        Estimated earning
                      </p>
                      <p className="text-base font-bold text-[#087F7A] mt-0.5">
                        ₹{booking.total_amount}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/worker/job-details/${booking.id}`, {
                          state: { booking },
                        })
                      }
                      className="px-5 py-2.5 rounded-xl bg-[#FF5A00] text-white text-xs font-bold shadow-sm"
                    >
                      View Details
                    </button>
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