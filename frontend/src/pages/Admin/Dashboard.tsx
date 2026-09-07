import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  IndianRupee,
  Loader2,
  Menu,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { BrandLogo } from "../../components/BrandLogo";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { getAdminStats, getAdminBookings, type AdminStats, type AdminBooking } from "../../services/admin";

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<AdminBooking[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoadError("");
        const [stats, bookings] = await Promise.all([
          getAdminStats(),
          getAdminBookings(0, 5),
        ]);
        setAdminStats(stats);
        setRecentBookings(bookings);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Unable to load dashboard data.");
      } finally {
        setLoadingStats(false);
      }
    }
    load();
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: loadingStats ? "…" : String(adminStats?.total_users ?? 0),
      icon: Users,
      change: `${adminStats?.total_customers ?? 0} customers`,
    },
    {
      title: "Active Workers",
      value: loadingStats ? "…" : String(adminStats?.total_workers ?? 0),
      icon: BriefcaseBusiness,
      change: "Registered workers",
    },
    {
      title: "Total Bookings",
      value: loadingStats ? "…" : String(adminStats?.total_bookings ?? 0),
      icon: ClipboardList,
      change: `${adminStats?.pending_bookings ?? 0} pending`,
    },
    {
      title: "Revenue",
      value: loadingStats
        ? "…"
        : `₹${((adminStats?.total_revenue ?? 0) / 100000).toFixed(2)}L`,
      icon: IndianRupee,
      change: `${adminStats?.completed_bookings ?? 0} completed`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8F8] dark:bg-[#101A18] text-gray-900 dark:text-[#F7F2E8] pb-8">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <header className="bg-[#087F7A] text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <BrandLogo size="sm" />

              <div>
                <h1 className="text-lg font-bold">
                  ShramiGo
                </h1>

                <p className="text-xs text-white/70">
                  Administration Panel
                </p>
              </div>

              {loadError && (
                <div className="mx-auto mt-5 max-w-7xl px-5 sm:px-8">
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <span>Unable to load data: {loadError}</span>
                    <button type="button" onClick={() => window.location.reload()} className="font-semibold underline">Retry</button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() => navigate("/admin/notifications")}
                className="w-10 h-10 rounded-xl bg-white dark:bg-[#1C2825]/10 flex items-center justify-center hover:bg-white dark:bg-[#1C2825]/20"
                title="Notifications"
              >
                <Bell size={20} />
              </button>

              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-[#1C2825]/10 flex items-center justify-center hover:bg-white dark:bg-[#1C2825]/20"
                title="Menu"
              >
                <Menu size={20} />
              </button>

            </div>
          </div>

          {/* Welcome */}
          <div className="mt-8">
            <p className="text-sm text-white/70">
              Welcome back
            </p>

            <h2 className="text-2xl font-bold mt-1">
              Admin Dashboard
            </h2>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-7">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] shadow-sm p-5"
              >
                <div className="flex items-start justify-between">

                  <div className="w-10 h-10 rounded-xl bg-[#087F7A]/10 flex items-center justify-center">
                    <Icon
                      size={20}
                      className="text-[#087F7A]"
                    />
                  </div>

                  <span className="text-xs font-semibold text-green-600">
                    {stat.change}
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-4">
                  {stat.title}
                </p>

                <p className="text-xl font-bold mt-1">
                  {stat.value}
                </p>
              </div>
            );
          })}

        </div>

        {/* Quick Actions */}
        <section className="mt-7">

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">
              Quick Actions
            </h3>

            <TrendingUp
              size={19}
              className="text-[#087F7A]"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            <button
              onClick={() => navigate("/admin/users")}
              className="bg-white dark:bg-[#1C2825] border border-gray-100 dark:border-[#3D4944] rounded-2xl p-5 text-left hover:border-[#087F7A]/30 transition"
            >
              <Users
                size={23}
                className="text-[#087F7A]"
              />

              <p className="font-semibold mt-4">
                Manage Users
              </p>

              <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-1">
                View customers and workers
              </p>
            </button>

            <button
              onClick={() => navigate("/admin/bookings")}
              className="bg-white dark:bg-[#1C2825] border border-gray-100 dark:border-[#3D4944] rounded-2xl p-5 text-left hover:border-[#087F7A]/30 transition"
            >
              <ClipboardList
                size={23}
                className="text-[#FF5A00]"
              />

              <p className="font-semibold mt-4">
                Bookings
              </p>

              <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-1">
                Monitor all bookings
              </p>
            </button>

            <button
              onClick={() => navigate("/admin/workers")}
              className="bg-white dark:bg-[#1C2825] border border-gray-100 dark:border-[#3D4944] rounded-2xl p-5 text-left hover:border-[#087F7A]/30 transition"
            >
              <BriefcaseBusiness
                size={23}
                className="text-[#087F7A]"
              />

              <p className="font-semibold mt-4">
                Workers
              </p>

              <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-1">
                Verify and manage workers
              </p>
            </button>

            <button
              onClick={() => navigate("/admin/reports")}
              className="bg-white dark:bg-[#1C2825] border border-gray-100 dark:border-[#3D4944] rounded-2xl p-5 text-left hover:border-[#087F7A]/30 transition"
            >
              <TrendingUp
                size={23}
                className="text-[#FF5A00]"
              />

              <p className="font-semibold mt-4">
                Reports
              </p>

              <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-1">
                Platform analytics
              </p>
            </button>

          </div>
        </section>

        {/* Platform Overview */}
        <section className="mt-7">

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">
              Platform Overview
            </h3>

            <span className="text-xs text-gray-500 dark:text-[#9A9185]">
              This Month
            </span>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">

            <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-[#9A9185]">Completed Jobs</p>
                <CheckCircle2 size={19} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold mt-3">
                {adminStats?.completed_bookings ?? 0}
              </p>
              <div className="h-2 bg-gray-100 dark:bg-[#26332F] rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-[#087F7A] rounded-full"
                  style={{
                    width: adminStats?.total_bookings
                      ? `${Math.round(
                          (adminStats.completed_bookings /
                            adminStats.total_bookings) *
                            100
                        )}%`
                      : "0%",
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-2">
                {adminStats?.total_bookings
                  ? `${Math.round(
                      (adminStats.completed_bookings /
                        adminStats.total_bookings) *
                        100
                    )}% of total bookings`
                  : "0% of total bookings"}
              </p>
            </div>

            <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-[#9A9185]">Pending Requests</p>
                <XCircle size={19} className="text-[#FF5A00]" />
              </div>
              <p className="text-2xl font-bold mt-3">
                {adminStats?.pending_bookings ?? 0}
              </p>
              <div className="h-2 bg-gray-100 dark:bg-[#26332F] rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-[#FF5A00] rounded-full"
                  style={{
                    width: adminStats?.total_bookings
                      ? `${Math.round(
                          (adminStats.pending_bookings /
                            adminStats.total_bookings) *
                            100
                        )}%`
                      : "0%",
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-2">Requires attention</p>
            </div>

            <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-[#9A9185]">Total Revenue</p>
                <IndianRupee size={19} className="text-[#087F7A]" />
              </div>
              <p className="text-2xl font-bold mt-3">
                ₹{adminStats?.total_revenue.toFixed(0) ?? 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-5">
                From {adminStats?.completed_bookings ?? 0} paid bookings
              </p>
            </div>

          </div>
        </section>

        {/* Recent Bookings */}
        <section className="mt-7">

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">
              Recent Bookings
            </h3>

            <button
              onClick={() => navigate("/admin/bookings")}
              className="text-sm font-medium text-[#087F7A] flex items-center gap-1"
            >
              View All
              <ChevronRight size={17} />
            </button>
          </div>

          <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] overflow-hidden">

            {recentBookings.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500 dark:text-[#9A9185]">
                  {loadingStats ? "Loading bookings..." : "No bookings yet."}
                </p>
              </div>
            ) : (
              recentBookings.map((booking, index) => (
                <div
                  key={booking.id}
                  className={`p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
                    index !== recentBookings.length - 1
                      ? "border-b border-gray-100 dark:border-[#3D4944]"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#087F7A]/10 flex items-center justify-center shrink-0">
                      <ClipboardList size={20} className="text-[#087F7A]" />
                    </div>

                    <div>
                      <p className="font-semibold">Booking #{booking.id}</p>
                      <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-1">
                        {booking.customer_name} → {booking.worker_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(`${booking.booking_date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <p className="font-bold">₹{booking.total_amount}</p>

                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        booking.status === "completed"
                          ? "bg-green-50 text-green-700"
                          : booking.status === "cancelled"
                          ? "bg-red-50 text-red-600"
                          : booking.status === "in_progress"
                          ? "bg-orange-50 text-orange-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            )}

          </div>

        </section>

        {/* Footer */}
        <footer className="text-center py-8">
          <p className="text-xs text-gray-400">
            © 2026 ShramiGo · Connecting people. Empowering work.
          </p>
        </footer>

      </main>
    </div>
  );
}