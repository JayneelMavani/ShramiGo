import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Eye,
  Filter,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  UserRound,
  X,
  XCircle,
  Loader2,
} from "lucide-react";
import { getAdminWorkers, toggleWorkerVerified } from "../../services/admin";
import AdminSidebar from "../../components/admin/AdminSidebar";

type WorkerStatus = "Verified" | "Pending" | "Suspended";

type Worker = {
  id: string;
  name: string;
  service: string;
  location: string;
  experience: string;
  rating: number;
  reviews: number;
  status: WorkerStatus;
};

const workers: Worker[] = [];

export default function Workers() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "All" | WorkerStatus
  >("All");
  const [selectedWorker, setSelectedWorker] =
    useState<Worker | null>(null);
  const [workerList, setWorkerList] = useState<Worker[]>(workers);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [toggling, setToggling] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setLoadError("");
        const data = await getAdminWorkers(0, 100);
        setWorkerList(
            data.map((w: any) => ({
              id: `WRK${String(w.id).padStart(3, "0")}`,
              name: w.full_name,
              service: "Service Professional",
              location: [w.city, w.state].filter(Boolean).join(", ") || "Location not provided",
              experience: `${w.experience_years} years`,
              rating: 0,
              reviews: w.booking_count,
              status: w.is_verified
                ? "Verified"
                : !w.is_active
                ? "Suspended"
                : "Pending",
            }))
        );
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Unable to load workers.");
      } finally {
        setLoading(false);
      }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleToggleVerification(worker: Worker) {
    if (worker.status === "Verified") {
      alert("Worker is already verified.");
      return;
    }
    
    try {
      setToggling(true);
      setActionError("");
      const realId = parseInt(worker.id.replace("WRK", ""));
      await toggleWorkerVerified(realId);
      await load();
      setSelectedWorker(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to verify worker.");
    } finally {
      setToggling(false);
    }
  }

  const filteredWorkers = useMemo(() => {
    return workerList.filter((worker) => {
      const matchesFilter =
        filter === "All" || worker.status === filter;

      const query = search.toLowerCase();

      const matchesSearch =
        worker.name.toLowerCase().includes(query) ||
        worker.service.toLowerCase().includes(query) ||
        worker.location.toLowerCase().includes(query) ||
        worker.id.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [workerList, search, filter]);

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
                Worker Management
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

        {loadError && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Unable to load workers: {loadError}</div>}

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">

          <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
            <div className="w-10 h-10 rounded-xl bg-[#087F7A]/10 flex items-center justify-center">
              <BriefcaseBusiness
                size={20}
                className="text-[#087F7A]"
              />
            </div>

            <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-4">
              Total Workers
            </p>

            <p className="text-2xl font-bold mt-1">
              {workerList.length}
            </p>
          </div>

          <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle2
                size={20}
                className="text-green-600"
              />
            </div>

            <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-4">
              Verified
            </p>

            <p className="text-2xl font-bold mt-1">
              {workerList.filter((worker) => worker.status === "Verified").length}
            </p>
          </div>

          <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Filter
                size={20}
                className="text-[#FF5A00]"
              />
            </div>

            <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-4">
              Pending Verification
            </p>

            <p className="text-2xl font-bold mt-1">
              {workerList.filter((worker) => worker.status === "Pending").length}
            </p>
          </div>

          <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <XCircle
                size={20}
                className="text-red-600"
              />
            </div>

            <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-4">
              Suspended
            </p>

            <p className="text-2xl font-bold mt-1">
              16
            </p>
          </div>

        </div>

        {/* Search / Filters */}
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
                placeholder="Search worker, service, location..."
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-gray-50 dark:bg-[#1C2825] border border-gray-200 dark:border-[#2C3834] outline-none focus:border-[#087F7A] text-sm"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {(
                ["All", "Verified", "Pending", "Suspended"] as const
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

        {/* Worker List */}
        <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-100 dark:border-[#3D4944] flex items-center justify-between">

            <div>
              <h2 className="font-bold">
                Registered Workers
              </h2>

              <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-1">
                {filteredWorkers.length} workers displayed
              </p>
            </div>

            <ShieldCheck
              size={20}
              className="text-[#087F7A]"
            />

          </div>

          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="bg-gray-50 dark:bg-[#1C2825] text-left">

                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-[#9A9185]">
                    Worker
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-[#9A9185]">
                    Service
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-[#9A9185]">
                    Location
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-[#9A9185]">
                    Rating
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

                {filteredWorkers.map((worker) => (
                  <tr
                    key={worker.id}
                    className="border-t border-gray-100 dark:border-[#3D4944] hover:bg-gray-50 dark:hover:bg-[#3D3931] dark:bg-[#1C2825]/70"
                  >

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-[#087F7A]/10 flex items-center justify-center">
                          <UserRound
                            size={18}
                            className="text-[#087F7A]"
                          />
                        </div>

                        <div>
                          <p className="font-semibold text-sm">
                            {worker.name}
                          </p>

                          <p className="text-xs text-gray-400">
                            {worker.id}
                          </p>
                        </div>

                      </div>

                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium">
                        {worker.service}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {worker.experience}
                      </p>
                    </td>

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-[#C8C0B4]">
                        <MapPin size={15} />
                        {worker.location}
                      </div>

                    </td>

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-1">
                        <Star
                          size={15}
                          className="text-[#FF5A00] fill-[#FF5A00]"
                        />

                        <span className="text-sm font-semibold">
                          {worker.rating}
                        </span>

                        <span className="text-xs text-gray-400">
                          ({worker.reviews})
                        </span>
                      </div>

                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={worker.status} />
                    </td>

                    <td className="px-5 py-4">

                      <button
                        onClick={() =>
                          setSelectedWorker(worker)
                        }
                        className="flex items-center gap-1.5 text-sm font-medium text-[#087F7A] hover:underline"
                      >
                        <Eye size={16} />
                        Review
                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-gray-100">

            {filteredWorkers.map((worker) => (
              <div
                key={worker.id}
                className="p-5"
              >

                <div className="flex items-start justify-between">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-[#087F7A]/10 flex items-center justify-center">
                      <UserRound
                        size={19}
                        className="text-[#087F7A]"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-sm">
                        {worker.name}
                      </p>

                      <p className="text-xs text-gray-400">
                        {worker.id}
                      </p>
                    </div>

                  </div>

                  <StatusBadge status={worker.status} />

                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs text-gray-400">
                      Service
                    </p>

                    <p className="text-sm font-medium mt-1">
                      {worker.service}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      Experience
                    </p>

                    <p className="text-sm font-medium mt-1">
                      {worker.experience}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      Location
                    </p>

                    <p className="text-sm font-medium mt-1">
                      {worker.location}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      Rating
                    </p>

                    <div className="flex items-center gap-1 mt-1">
                      <Star
                        size={14}
                        className="text-[#FF5A00] fill-[#FF5A00]"
                      />

                      <span className="text-sm font-medium">
                        {worker.rating}
                      </span>
                    </div>
                  </div>

                </div>

                <button
                  onClick={() =>
                    setSelectedWorker(worker)
                  }
                  className="w-full mt-4 h-10 rounded-xl bg-[#087F7A]/10 text-[#087F7A] text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Eye size={17} />
                  Review Worker
                </button>

              </div>
            ))}

          </div>

          {filteredWorkers.length === 0 && (
            <div className="py-14 text-center">

              <Search
                size={28}
                className="mx-auto text-gray-300"
              />

              <p className="font-medium mt-3">
                No workers found
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Try changing your search or filter.
              </p>

            </div>
          )}

        </div>

      </main>

      {/* Review Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">

          <div className="w-full max-w-md bg-white dark:bg-[#1C2825] rounded-3xl shadow-xl p-6">

            <div className="flex items-center justify-between">

              <h2 className="text-lg font-bold">
                Worker Verification
              </h2>

              <button
                onClick={() => setSelectedWorker(null)}
                className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#26332F] flex items-center justify-center"
              >
                <X size={18} />
              </button>

            </div>

            {/* Worker */}
            <div className="flex items-center gap-4 mt-6">

              <div className="w-14 h-14 rounded-full bg-[#087F7A]/10 flex items-center justify-center">
                <UserRound
                  size={25}
                  className="text-[#087F7A]"
                />
              </div>

              <div>
                <h3 className="font-bold">
                  {selectedWorker.name}
                </h3>

                <p className="text-sm text-gray-500 dark:text-[#9A9185] mt-1">
                  {selectedWorker.service}
                </p>

                <div className="flex items-center gap-1 mt-1">
                  <Star
                    size={14}
                    className="text-[#FF5A00] fill-[#FF5A00]"
                  />

                  <span className="text-xs font-medium">
                    {selectedWorker.rating}
                  </span>
                </div>
              </div>

            </div>

            {/* Details */}
            <div className="mt-6 space-y-4">

              <DetailRow
                label="Worker ID"
                value={selectedWorker.id}
              />

              <DetailRow
                label="Experience"
                value={selectedWorker.experience}
              />

              <DetailRow
                label="Location"
                value={selectedWorker.location}
              />

              <DetailRow
                label="Reviews"
                value={String(selectedWorker.reviews)}
              />

              <DetailRow
                label="Current Status"
                value={selectedWorker.status}
              />

            </div>

            {/* Verification Documents */}
            <div className="mt-6 p-4 rounded-2xl bg-gray-50 dark:bg-[#1C2825]">

              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={18}
                  className="text-[#087F7A]"
                />

                <p className="text-sm font-semibold">
                  Verification Documents
                </p>
              </div>

              <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-2">
                Identity, skill and worker verification
                documents can be reviewed here.
              </p>

            </div>

            {/* Actions */}
            <div className="mt-6">
              {actionError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleToggleVerification(selectedWorker)}
                  disabled={toggling || selectedWorker.status === "Verified"}
                  className="h-11 rounded-xl bg-green-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {toggling ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  Approve
                </button>

                <button
                  onClick={() => setSelectedWorker(null)}
                  className="h-11 rounded-xl bg-red-50 text-red-600 font-semibold flex items-center justify-center gap-2"
                >
                  <XCircle size={18} />
                  Reject
                </button>
              </div>
            </div>

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

function StatusBadge({
  status,
}: {
  status: WorkerStatus;
}) {
  const styles = {
    Verified: "bg-green-50 text-green-700",
    Pending: "bg-orange-50 text-orange-700",
    Suspended: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-gray-400">
        {label}
      </span>

      <span className="text-sm font-medium text-right">
        {value}
      </span>
    </div>
  );
}