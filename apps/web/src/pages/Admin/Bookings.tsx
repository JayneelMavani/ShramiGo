import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  IndianRupee,
  MapPin,
  Search,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { getAdminBookings, type AdminBooking } from "../../services/admin";
import AdminSidebar from "../../components/admin/AdminSidebar";

type BookingStatus =
  | "Completed"
  | "In Progress"
  | "Pending"
  | "Cancelled";

type Booking = {
  id: string;
  customer: string;
  worker: string;
  service: string;
  location: string;
  date: string;
  time: string;
  amount: number;
  status: BookingStatus;
};

const bookings: Booking[] = [];

export default function Bookings() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | BookingStatus>("All");
  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);
  const [bookingList, setBookingList] = useState<Booking[]>(bookings);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setLoadError("");
        const data = await getAdminBookings(0, 100);
        setBookingList(
            data.map((b) => ({
              id: `#SS${b.id}`,
              customer: b.customer_name,
              worker: b.worker_name,
              service: b.service_id ? `Service #${b.service_id}` : "Household Service",
              location: b.service_address,
              date: String(b.booking_date),
              time: String(b.booking_time).slice(0, 5),
              amount: b.total_amount,
              status: (
                b.status === "completed"
                  ? "Completed"
                  : b.status === "in_progress" || b.status === "on_the_way" || b.status === "accepted"
                  ? "In Progress"
                  : b.status === "cancelled"
                  ? "Cancelled"
                  : "Pending"
              ) as BookingStatus,
            }))
        );
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Unable to load bookings.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookingList.filter((booking) => {
      const query = search.toLowerCase();

      const matchesSearch =
        booking.id.toLowerCase().includes(query) ||
        booking.customer.toLowerCase().includes(query) ||
        booking.worker.toLowerCase().includes(query) ||
        booking.service.toLowerCase().includes(query) ||
        booking.location.toLowerCase().includes(query);

      const matchesFilter =
        filter === "All" || booking.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [bookingList, search, filter]);

  return (
    <div className="min-h-screen bg-[#F7F8F8] dark:bg-[#101A18] text-gray-900 dark:text-[#F7F2E8]">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <header className="bg-[#087F7A] text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5">

          <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin")}
              className="w-10 h-10 rounded-xl bg-white dark:bg-[#1C2825]/10 flex items-center justify-center hover:bg-white dark:bg-[#1C2825]/20"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <p className="text-xs text-white/70">
                Administration
              </p>

              <h1 className="text-xl font-bold">
                Booking Management
              </h1>
            </div>
          </div>

          <button type="button" onClick={() => setSidebarOpen(true)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20" title="Menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>

          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-7">

        {loadError && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Unable to load bookings: {loadError}</div>}

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">

          <SummaryCard
            icon={ClipboardList}
            title="Total Bookings"
            value={String(bookingList.length)}
          />

          <SummaryCard
            icon={CheckCircle2}
            title="Completed"
            value={String(bookingList.filter((booking) => booking.status === "Completed").length)}
            iconClass="text-green-600"
            bgClass="bg-green-50"
          />

          <SummaryCard
            icon={Clock3}
            title="In Progress"
            value={String(bookingList.filter((booking) => booking.status === "In Progress").length)}
            iconClass="text-blue-600"
            bgClass="bg-blue-50"
          />

          <SummaryCard
            icon={IndianRupee}
            title="Total Revenue"
            value={`₹${bookingList.reduce((total, booking) => total + booking.amount, 0).toFixed(2)}`}
            iconClass="text-[#FF5A00]"
            bgClass="bg-orange-50"
          />

        </div>

        {/* Search + Filters */}
        <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-4 mb-5">

          <div className="flex flex-col lg:flex-row gap-4">

            <div className="relative flex-1">

              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search booking, customer, worker, service..."
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-gray-50 dark:bg-[#1C2825] border border-gray-200 dark:border-[#2C3834] outline-none focus:border-[#087F7A] text-sm"
              />

            </div>

            <div className="flex gap-2 flex-wrap">

              {(
                [
                  "All",
                  "Pending",
                  "In Progress",
                  "Completed",
                  "Cancelled",
                ] as const
              ).map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                    filter === item
                      ? "bg-[#087F7A] text-white"
                      : "bg-gray-50 dark:bg-[#1C2825] text-gray-600 dark:text-[#C8C0B4] hover:bg-gray-100 dark:hover:bg-[#3D3931] dark:bg-[#26332F]"
                  }`}
                >
                  {item}
                </button>
              ))}

            </div>

          </div>

        </div>

        {/* Booking List */}
        <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-100 dark:border-[#3D4944] flex items-center justify-between">

            <div>
              <h2 className="font-bold">
                All Bookings
              </h2>

              <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-1">
                {filteredBookings.length} bookings displayed
              </p>
            </div>

            <CalendarDays
              size={20}
              className="text-[#087F7A]"
            />

          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="bg-gray-50 dark:bg-[#1C2825] text-left">

                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-[#9A9185]">
                    Booking
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-[#9A9185]">
                    Customer
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-[#9A9185]">
                    Worker
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-[#9A9185]">
                    Service
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-[#9A9185]">
                    Schedule
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-[#9A9185]">
                    Amount
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-[#9A9185]">
                    Status
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-[#9A9185]">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-t border-gray-100 dark:border-[#3D4944] hover:bg-gray-50 dark:hover:bg-[#3D3931] dark:bg-[#1C2825]/70"
                  >

                    <td className="px-5 py-4">

                      <p className="font-semibold text-sm">
                        {booking.id}
                      </p>

                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                        <MapPin size={13} />
                        {booking.location}
                      </div>

                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium">
                        {booking.customer}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium">
                        {booking.worker}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm">
                        {booking.service}
                      </p>
                    </td>

                    <td className="px-5 py-4">

                      <p className="text-sm">
                        {booking.date}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {booking.time}
                      </p>

                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-sm">
                        ₹{booking.amount}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={booking.status} />
                    </td>

                    <td className="px-5 py-4">

                      <button
                        onClick={() =>
                          setSelectedBooking(booking)
                        }
                        className="flex items-center gap-1.5 text-sm font-medium text-[#087F7A] hover:underline"
                      >
                        <Eye size={16} />
                        View
                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          {/* Mobile / Tablet Cards */}
          <div className="lg:hidden divide-y divide-gray-100">

            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-5"
              >

                <div className="flex items-start justify-between">

                  <div>
                    <p className="font-bold">
                      {booking.id}
                    </p>

                    <p className="text-sm text-gray-500 dark:text-[#9A9185] mt-1">
                      {booking.service}
                    </p>
                  </div>

                  <StatusBadge status={booking.status} />

                </div>

                <div className="grid grid-cols-2 gap-4 mt-5">

                  <div>
                    <p className="text-xs text-gray-400">
                      Customer
                    </p>

                    <div className="flex items-center gap-1.5 mt-1">
                      <UserRound size={14} className="text-gray-400" />

                      <p className="text-sm font-medium">
                        {booking.customer}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      Worker
                    </p>

                    <p className="text-sm font-medium mt-1">
                      {booking.worker}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      Date & Time
                    </p>

                    <p className="text-sm font-medium mt-1">
                      {booking.date}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {booking.time}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      Amount
                    </p>

                    <p className="text-sm font-bold mt-1">
                      ₹{booking.amount}
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#9A9185] mt-4">
                  <MapPin size={14} />
                  {booking.location}
                </div>

                <button
                  onClick={() =>
                    setSelectedBooking(booking)
                  }
                  className="w-full mt-4 h-10 rounded-xl bg-[#087F7A]/10 text-[#087F7A] text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Eye size={17} />
                  View Booking
                </button>

              </div>
            ))}

          </div>

          {filteredBookings.length === 0 && (
            <div className="py-14 text-center">

              <Search
                size={28}
                className="mx-auto text-gray-300"
              />

              <p className="font-medium mt-3">
                No bookings found
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Try changing your search or filter.
              </p>

            </div>
          )}

        </div>

      </main>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">

          <div className="w-full max-w-md bg-white dark:bg-[#1C2825] rounded-3xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs text-gray-400">
                  Booking
                </p>

                <h2 className="text-lg font-bold">
                  {selectedBooking.id}
                </h2>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#26332F] flex items-center justify-center"
              >
                <X size={18} />
              </button>

            </div>

            {/* Status */}
            <div className="mt-5">
              <StatusBadge
                status={selectedBooking.status}
              />
            </div>

            {/* Service */}
            <div className="mt-6 p-4 rounded-2xl bg-[#087F7A]/5">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-white dark:bg-[#1C2825] flex items-center justify-center">
                  <ClipboardList
                    size={21}
                    className="text-[#087F7A]"
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Service
                  </p>

                  <p className="font-bold mt-1">
                    {selectedBooking.service}
                  </p>
                </div>

              </div>

            </div>

            {/* Details */}
            <div className="mt-6 space-y-4">

              <InfoRow
                label="Customer"
                value={selectedBooking.customer}
                icon={<UserRound size={16} />}
              />

              <InfoRow
                label="Worker"
                value={selectedBooking.worker}
                icon={<UserRound size={16} />}
              />

              <InfoRow
                label="Location"
                value={selectedBooking.location}
                icon={<MapPin size={16} />}
              />

              <InfoRow
                label="Date"
                value={selectedBooking.date}
                icon={<CalendarDays size={16} />}
              />

              <InfoRow
                label="Time"
                value={selectedBooking.time}
                icon={<Clock3 size={16} />}
              />

              <InfoRow
                label="Amount"
                value={`₹${selectedBooking.amount}`}
                icon={<IndianRupee size={16} />}
              />

            </div>

            {/* Action */}
            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full mt-7 h-11 rounded-xl bg-[#087F7A] text-white font-semibold"
            >
              Close
            </button>

          </div>

        </div>
      )}

      <footer className="text-center py-8">
        <p className="text-xs text-gray-400">
          © 2026 ShramiGo · Connecting people. Empowering work.
        </p>
      </footer>

    </div>
  );
}

function SummaryCard({
  icon: Icon,
  title,
  value,
  iconClass = "text-[#087F7A]",
  bgClass = "bg-[#087F7A]/10",
}: {
  icon: typeof ClipboardList;
  title: string;
  value: string;
  iconClass?: string;
  bgClass?: string;
}) {
  return (
    <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">

      <div
        className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center`}
      >
        <Icon size={20} className={iconClass} />
      </div>

      <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-4">
        {title}
      </p>

      <p className="text-2xl font-bold mt-1">
        {value}
      </p>

    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: BookingStatus;
}) {
  const styles: Record<BookingStatus, string> = {
    Completed: "bg-green-50 text-green-700",
    "In Progress": "bg-blue-50 text-blue-700",
    Pending: "bg-orange-50 text-orange-700",
    Cancelled: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#26332F] flex items-center justify-center text-gray-500 dark:text-[#9A9185]">
        {icon}
      </div>

      <div>
        <p className="text-xs text-gray-400">
          {label}
        </p>

        <p className="text-sm font-medium mt-0.5">
          {value}
        </p>
      </div>

    </div>
  );
}