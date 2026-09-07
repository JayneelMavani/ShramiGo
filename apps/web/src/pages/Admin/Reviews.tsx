import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Menu,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  getAdminReviews,
  getAdminReviewSummary,
  deleteAdminReview,
  type AdminReview,
  type AdminReviewSummary,
} from "../../services/admin";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-[#3D4944]"}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [summary, setSummary] = useState<AdminReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [r, s] = await Promise.all([
        getAdminReviews(0, 100, ratingFilter || undefined),
        getAdminReviewSummary(),
      ]);
      setReviews(r);
      setSummary(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [ratingFilter]);

  async function handleDelete(reviewId: number) {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteAdminReview(reviewId);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete review.");
    }
  }

  const filtered = reviews.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.customer_name.toLowerCase().includes(q) ||
      r.worker_name.toLowerCase().includes(q) ||
      (r.review_text && r.review_text.toLowerCase().includes(q))
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
              <h1 className="text-xl font-bold">Reviews & Ratings</h1>
            </div>
          </div>
          <button type="button" onClick={() => setSidebarOpen(true)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20" title="Menu">
            <Menu size={20} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        {/* Summary */}
        {summary && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
              <p className="text-xs text-gray-500 dark:text-[#9A9185]">Average Rating</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-3xl font-bold">{summary.avg_rating}</p>
                <Star size={22} className="text-amber-400 fill-amber-400" />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{summary.total_reviews} total reviews</p>
            </div>

            <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
              <p className="text-xs text-gray-500 dark:text-[#9A9185] mb-3">Distribution</p>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.rating_distribution[String(star)] || 0;
                const pct = summary.total_reviews > 0 ? (count / summary.total_reviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-medium w-3 text-right">{star}</span>
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-[#26332F] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 w-5">{count}</span>
                  </div>
                );
              })}
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
              placeholder="Search reviews..."
              className="w-full rounded-xl border border-gray-200 dark:border-[#3D4944] bg-white dark:bg-[#1C2825] pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#087F7A]/30"
            />
          </div>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(Number(e.target.value))}
            className="rounded-xl border border-gray-200 dark:border-[#3D4944] bg-white dark:bg-[#1C2825] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#087F7A]/30"
          >
            <option value={0}>All Ratings</option>
            <option value={5}>★★★★★ (5)</option>
            <option value={4}>★★★★ (4)</option>
            <option value={3}>★★★ (3)</option>
            <option value={2}>★★ (2)</option>
            <option value={1}>★ (1)</option>
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

        {/* Review List */}
        {!loading && !error && (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Star size={40} className="mx-auto text-gray-300 dark:text-[#3D4944]" />
                <p className="mt-4 text-sm text-gray-500 dark:text-[#9A9185]">No reviews found.</p>
              </div>
            ) : (
              filtered.map((review) => (
                <div
                  key={review.id}
                  className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StarRating rating={review.rating} />
                        <span className="text-[10px] text-gray-400">
                          {new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>

                      <p className="text-sm font-medium mt-2">
                        <span className="text-gray-500 dark:text-[#9A9185]">by</span> {review.customer_name}{" "}
                        <span className="text-gray-500 dark:text-[#9A9185]">for</span> {review.worker_name}
                      </p>

                      {review.review_text && (
                        <p className="text-xs text-gray-600 dark:text-[#C8C0B4] mt-2 leading-5">
                          "{review.review_text}"
                        </p>
                      )}

                      <p className="text-[10px] text-gray-400 mt-2">Booking #{review.booking_id}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(review.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition shrink-0"
                      title="Delete review"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
