import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  Loader2,
  Menu,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Wrench,
  X,
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  getAdminServices,
  createService,
  updateService,
  deleteService,
  type AdminService,
} from "../../services/admin";

export default function Services() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<AdminService | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    base_price: "",
    icon: "",
  });
  const [saving, setSaving] = useState(false);

  async function loadServices() {
    setLoading(true);
    setError("");
    try {
      setServices(await getAdminServices());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load services.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadServices();
  }, []);

  const categories = [...new Set(services.map((s) => s.category))].sort();

  const filtered = services.filter((s) => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || s.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  function openCreate() {
    setEditingService(null);
    setForm({ name: "", category: "", description: "", base_price: "", icon: "" });
    setShowModal(true);
  }

  function openEdit(service: AdminService) {
    setEditingService(service);
    setForm({
      name: service.name,
      category: service.category,
      description: service.description || "",
      base_price: String(service.base_price),
      icon: service.icon || "",
    });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const data = {
        name: form.name,
        category: form.category,
        description: form.description || undefined,
        base_price: parseFloat(form.base_price) || 0,
        icon: form.icon || undefined,
      };
      if (editingService) {
        await updateService(editingService.id, data);
      } else {
        await createService(data);
      }
      setShowModal(false);
      await loadServices();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save service.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(service: AdminService) {
    try {
      if (service.is_active) {
        await deleteService(service.id);
      } else {
        await updateService(service.id, { is_active: true });
      }
      await loadServices();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update service.");
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8F8] dark:bg-[#101A18] text-gray-900 dark:text-[#F7F2E8]">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <header className="bg-[#087F7A] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="rounded-xl bg-white/10 p-2"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-xs text-white/70">Administration</p>
              <h1 className="text-xl font-bold">Services & Categories</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20 transition"
            >
              <Plus size={17} />
              Add
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20"
              title="Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full rounded-xl border border-gray-200 dark:border-[#3D4944] bg-white dark:bg-[#1C2825] pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#087F7A]/30"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-[#3D4944] bg-white dark:bg-[#1C2825] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#087F7A]/30"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-4 text-center">
            <p className="text-2xl font-bold">{services.length}</p>
            <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-1">Total</p>
          </div>
          <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{services.filter((s) => s.is_active).length}</p>
            <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-1">Active</p>
          </div>
          <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-4 text-center">
            <p className="text-2xl font-bold text-gray-400">{services.filter((s) => !s.is_active).length}</p>
            <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-1">Inactive</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/10 p-4 mb-6 text-sm text-red-700 dark:text-red-400">
            {error}
            <button onClick={() => void loadServices()} className="ml-3 font-semibold underline">Retry</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[#087F7A]" />
          </div>
        )}

        {/* List */}
        {!loading && !error && (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Wrench size={40} className="mx-auto text-gray-300 dark:text-[#3D4944]" />
                <p className="mt-4 text-sm text-gray-500 dark:text-[#9A9185]">No services found.</p>
              </div>
            ) : (
              filtered.map((service) => (
                <div
                  key={service.id}
                  className={`bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-4 flex items-center justify-between gap-4 transition ${
                    !service.is_active ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#087F7A]/10 flex items-center justify-center shrink-0">
                      <Wrench size={19} className="text-[#087F7A]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{service.name}</p>
                      <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-0.5">{service.category}</p>
                      <p className="text-xs text-[#087F7A] font-medium mt-0.5">₹{service.base_price}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(service)}
                      className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-[#26332F] flex items-center justify-center text-gray-500 dark:text-[#C8C0B4] hover:bg-gray-100 dark:hover:bg-[#3D4944] transition"
                      title="Edit"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(service)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${
                        service.is_active
                          ? "bg-green-50 dark:bg-green-900/20 text-green-600"
                          : "bg-gray-100 dark:bg-[#26332F] text-gray-400"
                      }`}
                      title={service.is_active ? "Deactivate" : "Activate"}
                    >
                      {service.is_active ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-md bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">
                {editingService ? "Edit Service" : "Add New Service"}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-[#9A9185]">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 dark:border-[#3D4944] bg-gray-50 dark:bg-[#26332F] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#087F7A]/30"
                  placeholder="e.g. Plumbing"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-[#9A9185]">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 dark:border-[#3D4944] bg-gray-50 dark:bg-[#26332F] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#087F7A]/30"
                  placeholder="e.g. Home Services"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-[#9A9185]">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-gray-200 dark:border-[#3D4944] bg-gray-50 dark:bg-[#26332F] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#087F7A]/30 resize-none"
                  placeholder="Optional description"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-[#9A9185]">Base Price (₹)</label>
                  <input
                    type="number"
                    value={form.base_price}
                    onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 dark:border-[#3D4944] bg-gray-50 dark:bg-[#26332F] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#087F7A]/30"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-[#9A9185]">Icon</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 dark:border-[#3D4944] bg-gray-50 dark:bg-[#26332F] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#087F7A]/30"
                    placeholder="wrench"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl border border-gray-200 dark:border-[#3D4944] px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#26332F] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !form.name || !form.category}
                className="flex-1 rounded-xl bg-[#087F7A] text-white px-4 py-3 text-sm font-medium hover:bg-[#066c68] disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                {editingService ? "Save Changes" : "Create Service"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
