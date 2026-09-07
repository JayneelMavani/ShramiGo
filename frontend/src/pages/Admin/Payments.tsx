import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  IndianRupee,
  Loader2,
  Menu,
  Search,
  Wallet,
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  getAdminPayments,
  getAdminPaymentSummary,
  type AdminPayment,
  type AdminPaymentSummary,
} from "../../services/admin";

const statusColors: Record<string, string> = {
  paid: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  pending: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  failed: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  refunded: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  created: "bg-gray-100 text-gray-600 dark:bg-[#26332F] dark:text-[#C8C0B4]",
  cancelled: "bg-gray-100 text-gray-500 dark:bg-[#26332F] dark:text-[#9A9185]",
};

export default function Payments() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [summary, setSummary] = useState<AdminPaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [p, s] = await Promise.all([
        getAdminPayments(0, 100, statusFilter || undefined),
        getAdminPaymentSummary(),
      ]);
      setPayments(p);
      setSummary(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load payments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [statusFilter]);

  const filtered = payments.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.customer_name.toLowerCase().includes(q) ||
      p.worker_name.toLowerCase().includes(q) ||
      String(p.booking_id).includes(q) ||
      String(p.id).includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F7F8F8] dark:bg-[#101A18] text-gray-900 dark:text-[#F7F2E8]">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <header className="bg-[#087F7A] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate("/admin")} className="rounded-xl bg-white/10 p-2" aria-label="Back">
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-xs text-white/70">Administration</p>
              <h1 className="text-xl font-bold">Payments & Payouts</h1>
            </div>
          </div>
          <button type="button" onClick={() => setSidebarOpen(true)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20" title="Menu">
            <Menu size={20} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <IndianRupee size={17} />
                <span className="text-xs font-medium">Collected</span>
              </div>
              <p className="text-xl font-bold">₹{summary.total_collected.toFixed(0)}</p>
              <p className="text-[10px] text-gray-500 dark:text-[#9A9185] mt-1">{summary.paid_count} payments</p>
            </div>
            <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-4">
              <div className="flex items-center gap-2 text-yellow-600 mb-2">
                <Wallet size={17} />
                <span className="text-xs font-medium">Pending</span>
              </div>
              <p className="text-xl font-bold">₹{summary.total_pending.toFixed(0)}</p>
              <p className="text-[10px] text-gray-500 dark:text-[#9A9185] mt-1">{summary.pending_count} pending</p>
            </div>
            <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-4">
              <div className="flex items-center gap-2 text-[#087F7A] mb-2">
                <IndianRupee size={17} />
                <span className="text-xs font-medium">Cash</span>
              </div>
              <p className="text-xl font-bold">₹{summary.cash_total.toFixed(0)}</p>
            </div>
            <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <CreditCard size={17} />
                <span className="text-xs font-medium">Online</span>
              </div>
              <p className="text-xl font-bold">₹{summary.online_total.toFixed(0)}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or booking ID..."
              className="w-full rounded-xl border border-gray-200 dark:border-[#3D4944] bg-white dark:bg-[#1C2825] pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#087F7A]/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-[#3D4944] bg-white dark:bg-[#1C2825] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#087F7A]/30"
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/10 p-4 mb-6 text-sm text-red-700 dark:text-red-400">
            {error}
            <button onClick={() => void load()} className="ml-3 font-semibold underline">Retry</button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[#087F7A]" />
          </div>
        )}

        {/* Payment List */}
        {!loading && !error && (
          <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] overflow-hidden">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <CreditCard size={40} className="mx-auto text-gray-300 dark:text-[#3D4944]" />
                <p className="mt-4 text-sm text-gray-500 dark:text-[#9A9185]">No payments found.</p>
              </div>
            ) : (
              filtered.map((payment, index) => (
                <div
                  key={payment.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    index !== filtered.length - 1 ? "border-b border-gray-100 dark:border-[#3D4944]" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#087F7A]/10 flex items-center justify-center shrink-0">
                      <IndianRupee size={17} className="text-[#087F7A]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">₹{payment.amount.toFixed(0)}</p>
                      <p className="text-xs text-gray-500 dark:text-[#9A9185] truncate mt-0.5">
                        {payment.customer_name} → {payment.worker_name}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Booking #{payment.booking_id} · {payment.payment_method} · {new Date(payment.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>

                  <span className={`self-start sm:self-center px-3 py-1 rounded-full text-[11px] font-medium shrink-0 ${statusColors[payment.payment_status] || statusColors.created}`}>
                    {payment.payment_status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
