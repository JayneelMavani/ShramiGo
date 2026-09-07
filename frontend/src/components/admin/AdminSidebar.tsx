import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  Star,
  Trash2,
  Users,
  Wrench,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Workers", path: "/admin/workers", icon: BriefcaseBusiness },
  { label: "Services", path: "/admin/services", icon: Wrench },
  { label: "Bookings", path: "/admin/bookings", icon: ClipboardList },
  { label: "Payments", path: "/admin/payments", icon: CreditCard },
  { label: "Reviews", path: "/admin/reviews", icon: Star },
  { label: "Reports", path: "/admin/reports", icon: BarChart3 },
  { label: "Notifications", path: "/admin/notifications", icon: Bell },
  { label: "Settings", path: "/admin/settings", icon: Settings },
  { label: "Delete Users", path: "/admin/delete-users", icon: Trash2 },
];

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("shramigo_token");
    localStorage.removeItem("shramigo_user");
    localStorage.removeItem("shramigo_refresh_token");
    navigate("/role-selection");
  };

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white dark:bg-[#151F1C] shadow-2xl transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 dark:border-[#2C3834]">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-[#F7F2E8]">
              ShramiGo
            </h2>
            <p className="text-[10px] font-semibold tracking-wider text-[#087F7A] uppercase">
              Admin Panel
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-[#9A9185] hover:bg-gray-100 dark:hover:bg-[#26332F] transition"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="px-3 py-4 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(item.path);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#087F7A]/10 text-[#087F7A] dark:bg-[#087F7A]/20 dark:text-[#4FD1C5]"
                      : "text-gray-600 dark:text-[#C8C0B4] hover:bg-gray-50 dark:hover:bg-[#1C2825]"
                  }`}
                >
                  <Icon size={19} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
