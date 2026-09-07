import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  IndianRupee,
  Menu,
  RefreshCw,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { getAdminStats, type AdminStats } from "../../services/admin";

export default function Reports() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadReports() {
    setLoading(true);
    setError("");
    try {
      setStats(await getAdminStats());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReports();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8F8] dark:bg-[#101A18] text-gray-900 dark:text-[#F7F2E8] pb-8">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header className="bg-[#087F7A] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate("/admin")} className="rounded-xl bg-white/10 p-2" aria-label="Back to dashboard">
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-xs text-white/70">Administration</p>
              <h1 className="text-xl font-bold">Reports & Analytics</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => void loadReports()} disabled={loading} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium disabled:opacity-50 hover:bg-white/20 transition">
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button type="button" onClick={() => setSidebarOpen(true)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20" title="Menu">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/10 p-5 text-sm text-red-700 dark:text-red-400">
            <p>Unable to load data: {error}</p>
            <button type="button" onClick={() => void loadReports()} className="mt-3 font-semibold underline">Retry</button>
          </div>
        ) : (
          <>
            {/* Revenue Cards */}
            <section className="mb-7">
              <h2 className="text-sm font-bold text-gray-500 dark:text-[#9A9185] uppercase tracking-wide mb-3">Revenue Breakdown</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-[#087F7A]/10 flex items-center justify-center">
                      <IndianRupee size={17} className="text-[#087F7A]" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-[#9A9185]">Gross Booking Value</p>
                  </div>
                  <p className="text-2xl font-bold">₹{stats?.gross_booking_value.toFixed(0) || "0"}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Total value of all paid bookings</p>
                </div>

                <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                      <TrendingUp size={17} className="text-green-600" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-[#9A9185]">Platform Revenue</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">₹{stats?.platform_revenue.toFixed(0) || "0"}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Service charges collected</p>
                </div>

                <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                      <BriefcaseBusiness size={17} className="text-[#FF5A00]" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-[#9A9185]">Worker Payouts</p>
                  </div>
                  <p className="text-2xl font-bold">₹{stats?.worker_payouts.toFixed(0) || "0"}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Total paid to workers</p>
                </div>
              </div>
            </section>

            {/* Booking Status */}
            <section className="mb-7">
              <h2 className="text-sm font-bold text-gray-500 dark:text-[#9A9185] uppercase tracking-wide mb-3">Booking Status</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-500 dark:text-[#9A9185]">Total Bookings</p>
                    <ClipboardList size={17} className="text-[#087F7A]" />
                  </div>
                  <p className="text-3xl font-bold">{stats?.total_bookings || 0}</p>
                </div>

                <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-500 dark:text-[#9A9185]">Completed</p>
                    <CheckCircle2 size={17} className="text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-600">{stats?.completed_bookings || 0}</p>
                  <div className="h-2 bg-gray-100 dark:bg-[#26332F] rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{
                        width: stats?.total_bookings
                          ? `${Math.round((stats.completed_bookings / stats.total_bookings) * 100)}%`
                          : "0%",
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {stats?.total_bookings ? `${Math.round((stats.completed_bookings / stats.total_bookings) * 100)}%` : "0%"} completion rate
                  </p>
                </div>

                <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-500 dark:text-[#9A9185]">Pending</p>
                    <XCircle size={17} className="text-[#FF5A00]" />
                  </div>
                  <p className="text-3xl font-bold text-[#FF5A00]">{stats?.pending_bookings || 0}</p>
                  <div className="h-2 bg-gray-100 dark:bg-[#26332F] rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-[#FF5A00] rounded-full transition-all"
                      style={{
                        width: stats?.total_bookings
                          ? `${Math.round((stats.pending_bookings / stats.total_bookings) * 100)}%`
                          : "0%",
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Requires attention</p>
                </div>
              </div>
            </section>

            {/* User Growth */}
            <section className="mb-7">
              <h2 className="text-sm font-bold text-gray-500 dark:text-[#9A9185] uppercase tracking-wide mb-3">User Summary</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <Users size={17} className="text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-[#9A9185]">Total Users</p>
                  </div>
                  <p className="text-2xl font-bold">{stats?.total_users || 0}</p>
                </div>

                <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-[#087F7A]/10 flex items-center justify-center">
                      <Users size={17} className="text-[#087F7A]" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-[#9A9185]">Customers</p>
                  </div>
                  <p className="text-2xl font-bold">{stats?.total_customers || 0}</p>
                </div>

                <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                      <BriefcaseBusiness size={17} className="text-[#FF5A00]" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-[#9A9185]">Active Workers</p>
                  </div>
                  <p className="text-2xl font-bold">{stats?.total_workers || 0}</p>
                </div>
              </div>
            </section>

            {/* Key Metrics */}
            <section>
              <h2 className="text-sm font-bold text-gray-500 dark:text-[#9A9185] uppercase tracking-wide mb-3">Key Metrics</h2>
              <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] divide-y divide-gray-100 dark:divide-[#3D4944]">
                <div className="flex items-center justify-between p-4">
                  <p className="text-sm text-gray-600 dark:text-[#C8C0B4]">Avg. Revenue per Booking</p>
                  <p className="text-sm font-bold">
                    ₹{stats?.completed_bookings ? (stats.gross_booking_value / stats.completed_bookings).toFixed(0) : "0"}
                  </p>
                </div>
                <div className="flex items-center justify-between p-4">
                  <p className="text-sm text-gray-600 dark:text-[#C8C0B4]">Platform Commission Rate</p>
                  <p className="text-sm font-bold">
                    {stats?.gross_booking_value ? ((stats.platform_revenue / stats.gross_booking_value) * 100).toFixed(1) : "0"}%
                  </p>
                </div>
                <div className="flex items-center justify-between p-4">
                  <p className="text-sm text-gray-600 dark:text-[#C8C0B4]">Completion Rate</p>
                  <p className="text-sm font-bold text-green-600">
                    {stats?.total_bookings ? Math.round((stats.completed_bookings / stats.total_bookings) * 100) : 0}%
                  </p>
                </div>
                <div className="flex items-center justify-between p-4">
                  <p className="text-sm text-gray-600 dark:text-[#C8C0B4]">Bookings per User</p>
                  <p className="text-sm font-bold">
                    {stats?.total_customers ? (stats.total_bookings / stats.total_customers).toFixed(1) : "0"}
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
