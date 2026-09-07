import { useEffect, useState } from "react";
import { ArrowLeft, BarChart3, IndianRupee, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAdminStats, type AdminStats } from "../../services/admin";

export default function Reports() {
  const navigate = useNavigate();
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

  const cards = stats
    ? [
        ["Gross booking value", stats.gross_booking_value],
        ["Platform revenue", stats.platform_revenue],
        ["Worker payouts", stats.worker_payouts],
        ["Completed bookings", stats.completed_bookings],
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#F7F8F8] text-gray-900">
      <header className="bg-[#087F7A] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate("/admin")} className="rounded-xl bg-white/10 p-2" aria-label="Back to dashboard">
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-xs text-white/70">Administration</p>
              <h1 className="text-xl font-bold">Reports &amp; Analytics</h1>
            </div>
          </div>
          <BarChart3 size={22} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Live platform reports</h2>
            <p className="mt-1 text-sm text-gray-500">Values come from paid bookings in the database.</p>
          </div>
          <button type="button" onClick={() => void loadReports()} disabled={loading} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p>Unable to load data: {error}</p>
            <button type="button" onClick={() => void loadReports()} className="mt-3 font-semibold underline">Retry</button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F6F5] text-[#087F7A]"><IndianRupee size={19} /></div>
                <p className="mt-4 text-sm text-gray-500">{label}</p>
                <p className="mt-1 text-2xl font-bold">{label === "Completed bookings" ? value : `₹${Number(value).toFixed(2)}`}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
