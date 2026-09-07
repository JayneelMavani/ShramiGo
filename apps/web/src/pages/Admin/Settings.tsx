import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  CreditCard,
  Globe,
  IndianRupee,
  LogOut,
  Menu,
  Moon,
  Percent,
  Server,
  Settings as SettingsIcon,
  Shield,
  Star,
  Sun,
  Trash2,
  UserRound,
  Users,
  Wrench,
  TrendingUp,
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";

export default function Settings() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stored = localStorage.getItem("shramigo_user");
  const adminUser = stored ? JSON.parse(stored) : null;

  const isDarkMode = document.documentElement.classList.contains("dark");

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    localStorage.setItem(
      "shramigo_theme",
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("shramigo_token");
    localStorage.removeItem("shramigo_user");
    localStorage.removeItem("shramigo_refresh_token");
    navigate("/role-selection");
  };

  const quickLinks = [
    { label: "Manage Users", path: "/admin/users", icon: Users, color: "text-[#087F7A]" },
    { label: "Manage Workers", path: "/admin/workers", icon: Shield, color: "text-[#087F7A]" },
    { label: "Manage Services", path: "/admin/services", icon: Wrench, color: "text-[#FF5A00]" },
    { label: "View Reports & Analytics", path: "/admin/reports", icon: TrendingUp, color: "text-blue-600" },
    { label: "Manage Payments", path: "/admin/payments", icon: CreditCard, color: "text-green-600" },
    { label: "Customer Reviews", path: "/admin/reviews", icon: Star, color: "text-amber-500" },
    {
      label: "Delete User Accounts",
      path: "/admin/delete-users",
      icon: Trash2,
      color: "text-red-500",
      badge: "Danger Zone",
      badgeColor: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900/40",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8F8] dark:bg-[#101A18] text-gray-900 dark:text-[#F7F2E8] pb-8">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <header className="bg-[#087F7A] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="rounded-xl bg-white/10 p-2 hover:bg-white/20 transition"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-xs text-white/70">Administration</p>
              <h1 className="text-xl font-bold">Settings</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
            title="Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        {/* Admin Account */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9A9185] mb-3 px-1">
            Account
          </h2>
          <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#087F7A]/10 flex items-center justify-center">
                <UserRound size={26} className="text-[#087F7A]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg">{adminUser?.full_name || "Administrator"}</p>
                <p className="text-xs text-gray-500 dark:text-[#9A9185]">{adminUser?.email || "admin@shramigo.com"}</p>
                <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-[#087F7A]/10 text-[#087F7A] text-[10px] font-semibold">
                  <Shield size={10} />
                  Platform Admin
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Info */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9A9185] mb-3 px-1">
            Platform
          </h2>
          <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] divide-y divide-gray-100 dark:divide-[#3D4944]">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#087F7A]/10 flex items-center justify-center">
                  <Globe size={17} className="text-[#087F7A]" />
                </div>
                <div>
                  <p className="text-sm font-medium">Platform Name</p>
                  <p className="text-xs text-gray-500 dark:text-[#9A9185]">App identity</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-[#087F7A]">ShramiGo</p>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#087F7A]/10 flex items-center justify-center">
                  <Server size={17} className="text-[#087F7A]" />
                </div>
                <div>
                  <p className="text-sm font-medium">Version</p>
                  <p className="text-xs text-gray-500 dark:text-[#9A9185]">Current release</p>
                </div>
              </div>
              <p className="text-sm font-medium">v1.0.0</p>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#087F7A]/10 flex items-center justify-center">
                  <Server size={17} className="text-[#087F7A]" />
                </div>
                <div>
                  <p className="text-sm font-medium">API Status</p>
                  <p className="text-xs text-gray-500 dark:text-[#9A9185]">Backend health</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Online
              </span>
            </div>
          </div>
        </section>

        {/* Configuration */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9A9185] mb-3 px-1">
            Configuration
          </h2>
          <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] divide-y divide-gray-100 dark:divide-[#3D4944]">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                  <Percent size={17} className="text-[#FF5A00]" />
                </div>
                <div>
                  <p className="text-sm font-medium">Service Charge</p>
                  <p className="text-xs text-gray-500 dark:text-[#9A9185]">Platform fee per booking</p>
                </div>
              </div>
              <p className="text-sm font-semibold">₹30 flat</p>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <CreditCard size={17} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Payment Methods</p>
                  <p className="text-xs text-gray-500 dark:text-[#9A9185]">Enabled gateways</p>
                </div>
              </div>
              <p className="text-sm font-medium">Cash, Razorpay</p>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <IndianRupee size={17} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Currency</p>
                  <p className="text-xs text-gray-500 dark:text-[#9A9185]">Default transaction currency</p>
                </div>
              </div>
              <p className="text-sm font-medium">INR (₹)</p>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9A9185] mb-3 px-1">
            Appearance
          </h2>
          <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944]">
            <button
              type="button"
              onClick={toggleDark}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                  {isDarkMode ? <Moon size={17} className="text-purple-600" /> : <Sun size={17} className="text-amber-500" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Theme</p>
                  <p className="text-xs text-gray-500 dark:text-[#9A9185]">{isDarkMode ? "Dark mode" : "Light mode"}</p>
                </div>
              </div>
              <ChevronRight size={17} className="text-gray-400" />
            </button>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9A9185] mb-3 px-1">
            Quick Links & Actions
          </h2>
          <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] divide-y divide-gray-100 dark:divide-[#3D4944]">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => navigate(link.path)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#26332F] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-[#26332F] flex items-center justify-center">
                      <Icon size={17} className={link.color || "text-gray-500 dark:text-[#9A9185]"} />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{link.label}</p>
                        {link.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${link.badgeColor}`}>
                            {link.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={17} className="text-gray-400" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Logout */}
        <section>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl py-4 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition"
          >
            <LogOut size={17} />
            Logout
          </button>
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
