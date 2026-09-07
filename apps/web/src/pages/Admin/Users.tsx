import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Search,
  ShieldCheck,
  UserRound,
  Users as UsersIcon,
  X,
  Loader2,
} from "lucide-react";
import { getAdminUsers, toggleUserActive, type AdminUser } from "../../services/admin";
import AdminSidebar from "../../components/admin/AdminSidebar";

type UserRole = "Customer" | "Worker";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: "Active" | "Suspended";
  joined: string;
};

const users: User[] = [];

export default function Users() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | UserRole>("All");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userList, setUserList] = useState<User[]>(users);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setLoadError("");
        const data = await getAdminUsers(0, 100);
        if (data && data.length > 0) {
          setUserList(
            data.map((u) => ({
              id: `USR${String(u.id).padStart(3, "0")}`,
              name: u.full_name,
              email: u.email,
              phone: u.phone,
              role: (u.role === "worker" ? "Worker" : "Customer") as UserRole,
              status: u.is_active ? "Active" : "Suspended",
              joined: new Date(u.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
            }))
          );
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Unable to load users.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleToggleStatus = async (user: User) => {
    try {
      setToggling(true);
      const numericId = parseInt(user.id.replace(/\D/g, ""), 10);
      if (numericId) {
        await toggleUserActive(numericId);
      }
      setUserList((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" }
            : u
        )
      );
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev) =>
          prev
            ? { ...prev, status: prev.status === "Active" ? "Suspended" : "Active" }
            : null
        );
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to toggle status");
    } finally {
      setToggling(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return userList.filter((user) => {
      const matchesFilter =
        filter === "All" || user.role === filter;

      const query = search.toLowerCase();

      const matchesSearch =
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [userList, search, filter]);

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
                User Management
              </h1>
            </div>
          </div>

          <button type="button" onClick={() => setSidebarOpen(true)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20" title="Menu">
            <span className="sr-only">Menu</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-7">

        {(loadError || actionError) && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError || actionError}
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-7">

          <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
            <div className="w-10 h-10 rounded-xl bg-[#087F7A]/10 flex items-center justify-center">
              <UsersIcon
                size={20}
                className="text-[#087F7A]"
              />
            </div>

            <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-4">
              Total Users
            </p>

            <p className="text-2xl font-bold mt-1">
              {userList.length}
            </p>
          </div>

          <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <UserRound
                size={20}
                className="text-[#FF5A00]"
              />
            </div>

            <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-4">
              Customers
            </p>

            <p className="text-2xl font-bold mt-1">
              {userList.filter((user) => user.role === "Customer").length}
            </p>
          </div>

          <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] p-5">
            <div className="w-10 h-10 rounded-xl bg-[#087F7A]/10 flex items-center justify-center">
              <BriefcaseBusiness
                size={20}
                className="text-[#087F7A]"
              />
            </div>

            <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-4">
              Workers
            </p>

            <p className="text-2xl font-bold mt-1">
              {userList.filter((user) => user.role === "Worker").length}
            </p>
          </div>

        </div>

        {/* Search & Filter */}
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
                placeholder="Search by name, email or user ID..."
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-gray-50 dark:bg-[#1C2825] border border-gray-200 dark:border-[#2C3834] outline-none focus:border-[#087F7A] text-sm"
              />
            </div>

            <div className="flex gap-2">

              {(["All", "Customer", "Worker"] as const).map(
                (item) => (
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
                )
              )}

            </div>
          </div>

        </div>

        {/* User List */}
        <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-100 dark:border-[#3D4944] flex items-center justify-between">
            <div>
              <h2 className="font-bold">
                Registered Users
              </h2>

              <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-1">
                {filteredUsers.length} users displayed
              </p>
            </div>

            <ShieldCheck
              size={20}
              className="text-[#087F7A]"
            />
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">

            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#1C2825] text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-[#9A9185]">
                    User
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-[#9A9185]">
                    Role
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-[#9A9185]">
                    Contact
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-[#9A9185]">
                    Status
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-[#9A9185]">
                    Joined
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-[#9A9185]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-gray-100 dark:border-[#3D4944] hover:bg-gray-50 dark:hover:bg-[#3D3931] dark:bg-[#1C2825]/70"
                  >

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-[#087F7A]/10 flex items-center justify-center">
                          {user.role === "Worker" ? (
                            <BriefcaseBusiness
                              size={18}
                              className="text-[#087F7A]"
                            />
                          ) : (
                            <UserRound
                              size={18}
                              className="text-[#FF5A00]"
                            />
                          )}
                        </div>

                        <div>
                          <p className="font-semibold text-sm">
                            {user.name}
                          </p>

                          <p className="text-xs text-gray-400">
                            {user.id}
                          </p>
                        </div>

                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          user.role === "Worker"
                            ? "bg-[#087F7A]/10 text-[#087F7A]"
                            : "bg-orange-50 text-[#FF5A00]"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm">
                        {user.email}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {user.phone}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          user.status === "Active"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-[#9A9185]">
                      {user.joined}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-sm font-medium text-[#087F7A] hover:underline"
                      >
                        View
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">

            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-5"
              >

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-[#087F7A]/10 flex items-center justify-center">
                      {user.role === "Worker" ? (
                        <BriefcaseBusiness
                          size={19}
                          className="text-[#087F7A]"
                        />
                      ) : (
                        <UserRound
                          size={19}
                          className="text-[#FF5A00]"
                        />
                      )}
                    </div>

                    <div>
                      <p className="font-semibold text-sm">
                        {user.name}
                      </p>

                      <p className="text-xs text-gray-400">
                        {user.id}
                      </p>
                    </div>

                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.status === "Active"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {user.status}
                  </span>

                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">

                  <div>
                    <p className="text-gray-400">
                      Role
                    </p>
                    <p className="font-medium mt-1">
                      {user.role}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">
                      Joined
                    </p>
                    <p className="font-medium mt-1">
                      {user.joined}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-gray-400">
                      Email
                    </p>
                    <p className="font-medium mt-1">
                      {user.email}
                    </p>
                  </div>

                </div>

                <button
                  onClick={() => setSelectedUser(user)}
                  className="w-full mt-4 h-10 rounded-xl bg-[#087F7A]/10 text-[#087F7A] text-sm font-semibold"
                >
                  View User
                </button>

              </div>
            ))}

          </div>

          {filteredUsers.length === 0 && (
            <div className="py-14 text-center">
              <Search
                size={28}
                className="mx-auto text-gray-300"
              />

              <p className="font-medium mt-3">
                No users found
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Try changing your search or filter.
              </p>
            </div>
          )}

        </div>

      </main>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">

          <div className="w-full max-w-md bg-white dark:bg-[#1C2825] rounded-3xl p-6 shadow-xl">

            <div className="flex items-center justify-between">

              <h2 className="text-lg font-bold">
                User Details
              </h2>

              <button
                onClick={() => setSelectedUser(null)}
                className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#26332F] flex items-center justify-center"
              >
                <X size={18} />
              </button>

            </div>

            <div className="flex items-center gap-4 mt-6">

              <div className="w-14 h-14 rounded-full bg-[#087F7A]/10 flex items-center justify-center">
                {selectedUser.role === "Worker" ? (
                  <BriefcaseBusiness
                    size={24}
                    className="text-[#087F7A]"
                  />
                ) : (
                  <UserRound
                    size={24}
                    className="text-[#FF5A00]"
                  />
                )}
              </div>

              <div>
                <h3 className="font-bold">
                  {selectedUser.name}
                </h3>

                <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-1">
                  {selectedUser.id}
                </p>
              </div>

            </div>

            <div className="mt-6 space-y-4">

              <div>
                <p className="text-xs text-gray-400">
                  Email
                </p>
                <p className="text-sm font-medium mt-1">
                  {selectedUser.email}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Phone
                </p>
                <p className="text-sm font-medium mt-1">
                  {selectedUser.phone}
                </p>
              </div>

              <div className="flex gap-3">

                <div className="flex-1">
                  <p className="text-xs text-gray-400">
                    Role
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {selectedUser.role}
                  </p>
                </div>

                <div className="flex-1">
                  <p className="text-xs text-gray-400">
                    Status
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {selectedUser.status}
                  </p>
                </div>

              </div>

            </div>

            <div className="mt-7 flex gap-3">
              <button
                onClick={() => handleToggleStatus(selectedUser)}
                disabled={toggling}
                className={`flex-1 h-11 rounded-xl text-xs font-semibold transition ${
                  selectedUser.status === "Active"
                    ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                    : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                }`}
              >
                {toggling
                  ? "Updating..."
                  : selectedUser.status === "Active"
                  ? "Suspend Account"
                  : "Activate Account"}
              </button>

              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 h-11 rounded-xl bg-[#087F7A] text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}