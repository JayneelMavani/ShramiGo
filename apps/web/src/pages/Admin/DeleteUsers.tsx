import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Menu,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Unlock,
  Users as UsersIcon,
  X,
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  getAdminUsers,
  deleteAdminUser,
  type AdminUser,
} from "../../services/admin";

const PASSPHRASE_STORAGE_KEY = "shramigo_danger_zone_passphrase_hash";

async function hashPassphrase(passphrase: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(passphrase.trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function DeleteUsers() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Passphrase Security State
  const [isPassphraseConfigured, setIsPassphraseConfigured] = useState<boolean>(
    () => !!localStorage.getItem(PASSPHRASE_STORAGE_KEY)
  );
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Setup Form
  const [newPassphrase, setNewPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [showNewPassphrase, setShowNewPassphrase] = useState(false);
  const [showConfirmPassphrase, setShowConfirmPassphrase] = useState(false);
  const [setupError, setSetupError] = useState("");

  // Unlock Form
  const [enteredPassphrase, setEnteredPassphrase] = useState("");
  const [showEnteredPassphrase, setShowEnteredPassphrase] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  // Change Passphrase Modal
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [currentPassphraseForChange, setCurrentPassphraseForChange] = useState("");
  const [changeNewPassphrase, setChangeNewPassphrase] = useState("");
  const [changeConfirmPassphrase, setChangeConfirmPassphrase] = useState("");
  const [changeError, setChangeError] = useState("");
  const [changeSuccess, setChangeSuccess] = useState("");

  // Data State
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState<"all" | "customer" | "worker">("all");
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await getAdminUsers(0, 200);
      setUsersList(data);
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to load users",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      loadUsers();
    }
  }, [isUnlocked]);

  // Handle Initial Passphrase Setup
  const handleSetupPassphrase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError("");

    if (!newPassphrase.trim()) {
      setSetupError("Passphrase cannot be empty.");
      return;
    }
    if (newPassphrase.length < 4) {
      setSetupError("Passphrase must be at least 4 characters.");
      return;
    }
    if (newPassphrase !== confirmPassphrase) {
      setSetupError("Passphrases do not match.");
      return;
    }

    try {
      const hash = await hashPassphrase(newPassphrase);
      localStorage.setItem(PASSPHRASE_STORAGE_KEY, hash);
      setIsPassphraseConfigured(true);
      setIsUnlocked(true);
      setNewPassphrase("");
      setConfirmPassphrase("");
      setStatusMessage({
        type: "success",
        text: "Danger zone security passphrase created and access granted.",
      });
    } catch {
      setSetupError("Failed to store security passphrase. Please try again.");
    }
  };

  // Handle Unlocking
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError("");

    if (!enteredPassphrase.trim()) {
      setUnlockError("Please enter your passphrase.");
      return;
    }

    try {
      setUnlocking(true);
      const storedHash = localStorage.getItem(PASSPHRASE_STORAGE_KEY);
      const enteredHash = await hashPassphrase(enteredPassphrase);

      if (enteredHash === storedHash) {
        setIsUnlocked(true);
        setEnteredPassphrase("");
      } else {
        setUnlockError("Incorrect passphrase. Access denied.");
      }
    } catch {
      setUnlockError("Verification failed. Please try again.");
    } finally {
      setUnlocking(false);
    }
  };

  // Handle Lock
  const handleLock = () => {
    setIsUnlocked(false);
    setEnteredPassphrase("");
    setStatusMessage(null);
  };

  // Handle Changing Passphrase
  const handleChangePassphrase = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError("");
    setChangeSuccess("");

    if (!currentPassphraseForChange.trim()) {
      setChangeError("Please enter your current passphrase.");
      return;
    }
    if (changeNewPassphrase.length < 4) {
      setChangeError("New passphrase must be at least 4 characters.");
      return;
    }
    if (changeNewPassphrase !== changeConfirmPassphrase) {
      setChangeError("New passphrases do not match.");
      return;
    }

    try {
      const storedHash = localStorage.getItem(PASSPHRASE_STORAGE_KEY);
      const currentHash = await hashPassphrase(currentPassphraseForChange);

      if (currentHash !== storedHash) {
        setChangeError("Current passphrase is incorrect.");
        return;
      }

      const newHash = await hashPassphrase(changeNewPassphrase);
      localStorage.setItem(PASSPHRASE_STORAGE_KEY, newHash);
      setChangeSuccess("Passphrase updated successfully!");
      setCurrentPassphraseForChange("");
      setChangeNewPassphrase("");
      setChangeConfirmPassphrase("");
      setTimeout(() => {
        setShowChangeModal(false);
        setChangeSuccess("");
      }, 1500);
    } catch {
      setChangeError("Failed to update passphrase.");
    }
  };

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      // Exclude admin role accounts from deletion
      if (u.role === "admin") return false;

      if (userFilter !== "all" && u.role !== userFilter) return false;
      if (!userSearch.trim()) return true;
      const query = userSearch.toLowerCase();
      return (
        u.full_name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.phone.toLowerCase().includes(query) ||
        String(u.id).includes(query)
      );
    });
  }, [usersList, userFilter, userSearch]);

  const customerCount = useMemo(
    () => usersList.filter((u) => u.role === "customer").length,
    [usersList]
  );
  const workerCount = useMemo(
    () => usersList.filter((u) => u.role === "worker").length,
    [usersList]
  );

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setDeletingUser(true);
      setStatusMessage(null);
      await deleteAdminUser(userToDelete.id);
      setUsersList((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setStatusMessage({
        type: "success",
        text: `User "${userToDelete.full_name}" has been permanently deleted.`,
      });
      setUserToDelete(null);
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete user",
      });
    } finally {
      setDeletingUser(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F8] dark:bg-[#101A18] text-gray-900 dark:text-[#F7F2E8] pb-12">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <header className="bg-[#087F7A] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin/settings")}
              className="rounded-xl bg-white/10 p-2 hover:bg-white/20 transition"
              aria-label="Back to Settings"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-xs text-white/70">Administration · Danger Zone</p>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Trash2 size={20} className="text-red-300" />
                Delete Users
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isUnlocked && (
              <>
                <button
                  type="button"
                  onClick={() => setShowChangeModal(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition"
                  title="Change Passphrase"
                >
                  <KeyRound size={14} />
                  Change Passphrase
                </button>
                <button
                  type="button"
                  onClick={handleLock}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-xs font-semibold transition text-white"
                  title="Lock Danger Zone"
                >
                  <Lock size={14} />
                  Lock
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
              title="Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          LOCKED / SETUP GATEWAY
         ───────────────────────────────────────────────────────────── */}
      {!isUnlocked ? (
        <main className="mx-auto max-w-lg px-5 py-12">
          {!isPassphraseConfigured ? (
            /* First Time Setup */
            <div className="bg-white dark:bg-[#1C2825] rounded-3xl border border-red-200 dark:border-red-900/40 p-7 shadow-xl space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mx-auto shadow-inner">
                <ShieldAlert size={28} />
              </div>

              <div className="text-center space-y-2">
                <span className="px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
                  Initial Setup
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-[#F7F2E8]">
                  Set Danger Zone Passphrase
                </h2>
                <p className="text-xs text-gray-500 dark:text-[#9A9185] leading-relaxed">
                  Before accessing user deletion, you must set a security passphrase. You will be required to enter this passphrase each time you access the Danger Zone.
                </p>
              </div>

              {setupError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{setupError}</span>
                </div>
              )}

              <form onSubmit={handleSetupPassphrase} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-[#C8C0B4]">
                    Create Passphrase
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassphrase ? "text" : "password"}
                      placeholder="Enter a secure passphrase..."
                      value={newPassphrase}
                      onChange={(e) => setNewPassphrase(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-[#26332F] border border-gray-200 dark:border-[#3D4944] text-gray-900 dark:text-[#F7F2E8] placeholder-gray-400 focus:outline-none focus:border-red-400 pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassphrase(!showNewPassphrase)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassphrase ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-[#C8C0B4]">
                    Confirm Passphrase
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassphrase ? "text" : "password"}
                      placeholder="Re-enter your passphrase..."
                      value={confirmPassphrase}
                      onChange={(e) => setConfirmPassphrase(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-[#26332F] border border-gray-200 dark:border-[#3D4944] text-gray-900 dark:text-[#F7F2E8] placeholder-gray-400 focus:outline-none focus:border-red-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassphrase(!showConfirmPassphrase)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassphrase ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md transition"
                  >
                    <KeyRound size={15} />
                    Set Passphrase & Unlock
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/admin/settings")}
                    className="w-full py-2.5 px-4 rounded-xl border border-gray-200 dark:border-[#3D4944] text-xs font-semibold text-gray-600 dark:text-[#9A9185] hover:bg-gray-50 dark:hover:bg-[#26332F] transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Subsequent Unlock Screen */
            <div className="bg-white dark:bg-[#1C2825] rounded-3xl border border-red-200 dark:border-red-900/40 p-7 shadow-xl space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mx-auto shadow-inner">
                <Lock size={28} />
              </div>

              <div className="text-center space-y-2">
                <span className="px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
                  Authentication Required
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-[#F7F2E8]">
                  Danger Zone Locked
                </h2>
                <p className="text-xs text-gray-500 dark:text-[#9A9185] leading-relaxed">
                  Enter your admin danger zone passphrase to access and perform user deletions.
                </p>
              </div>

              {unlockError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{unlockError}</span>
                </div>
              )}

              <form onSubmit={handleUnlock} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-[#C8C0B4]">
                    Security Passphrase
                  </label>
                  <div className="relative">
                    <input
                      type={showEnteredPassphrase ? "text" : "password"}
                      placeholder="Enter passphrase..."
                      value={enteredPassphrase}
                      onChange={(e) => setEnteredPassphrase(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-[#26332F] border border-gray-200 dark:border-[#3D4944] text-gray-900 dark:text-[#F7F2E8] placeholder-gray-400 focus:outline-none focus:border-red-400 pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowEnteredPassphrase(!showEnteredPassphrase)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showEnteredPassphrase ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="submit"
                    disabled={unlocking}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                  >
                    {unlocking ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Unlock size={15} />
                        Unlock Danger Zone
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/admin/settings")}
                    className="w-full py-2.5 px-4 rounded-xl border border-gray-200 dark:border-[#3D4944] text-xs font-semibold text-gray-600 dark:text-[#9A9185] hover:bg-gray-50 dark:hover:bg-[#26332F] transition"
                  >
                    Back to Settings
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            UNLOCKED DANGER ZONE CONTENT
           ───────────────────────────────────────────────────────────── */
        <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8 space-y-6">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-medium ${
                statusMessage.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMessage.type === "success" ? (
                  <CheckCircle2 size={18} className="shrink-0 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle size={18} className="shrink-0 text-red-600 dark:text-red-400" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Security Status Bar */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  Danger Zone Unlocked · Authenticated Admin Session
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400/80">
                  Passphrase verified. Remember to lock this screen when you finish administrative actions.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setShowChangeModal(true)}
                className="sm:hidden text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-[#1C2825] border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300"
              >
                Change Passphrase
              </button>
              <button
                type="button"
                onClick={handleLock}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 shadow-sm transition"
              >
                <Lock size={13} />
                Lock Now
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-red-50/70 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-red-900 dark:text-red-300">
                  Permanent User Account Deletion
                </h2>
                <p className="text-xs text-red-700/80 dark:text-red-400/80 mt-1 leading-relaxed">
                  Deleting a customer or worker account permanently wipes their profile, bookings, reviews, payment records, and skills from the database. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-[#1C2825] border border-red-200 dark:border-red-900/30 text-gray-700 dark:text-[#F7F2E8]">
                {customerCount} Customers
              </span>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-[#1C2825] border border-red-200 dark:border-red-900/30 text-gray-700 dark:text-[#F7F2E8]">
                {workerCount} Workers
              </span>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-[#1C2825] rounded-2xl border border-gray-100 dark:border-[#3D4944] overflow-hidden shadow-sm">
            {/* Filter / Search Bar */}
            <div className="p-5 border-b border-gray-100 dark:border-[#3D4944] flex flex-col md:flex-row gap-3.5">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search user by name, email, phone, or ID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-[#26332F] border border-gray-200 dark:border-[#3D4944] text-gray-900 dark:text-[#F7F2E8] placeholder-gray-400 focus:outline-none focus:border-red-400 transition"
                />
                {userSearch && (
                  <button
                    type="button"
                    onClick={() => setUserSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#26332F] p-1 rounded-xl border border-gray-200 dark:border-[#3D4944] self-start md:self-auto">
                {(["all", "customer", "worker"] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setUserFilter(role)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                      userFilter === role
                        ? "bg-white dark:bg-[#1C2825] text-red-600 dark:text-red-400 shadow-sm font-semibold"
                        : "text-gray-500 dark:text-[#9A9185] hover:text-gray-800"
                    }`}
                  >
                    {role === "all" ? "All Accounts" : `${role}s`}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => loadUsers()}
                disabled={loadingUsers}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#26332F] border border-gray-200 dark:border-[#3D4944] text-xs font-semibold text-gray-700 dark:text-[#F7F2E8] hover:bg-gray-100 dark:hover:bg-[#32423D] transition disabled:opacity-50"
              >
                <RefreshCw size={14} className={loadingUsers ? "animate-spin text-red-500" : ""} />
                <span>Refresh</span>
              </button>
            </div>

            {/* User List */}
            {loadingUsers ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 size={28} className="animate-spin text-red-500" />
                <p className="text-xs text-gray-500 dark:text-[#9A9185]">Loading user accounts...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <UsersIcon size={32} className="mx-auto text-gray-300 dark:text-[#3D4944] mb-3" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  No matching accounts found
                </p>
                <p className="text-xs text-gray-500 dark:text-[#9A9185] mt-1">
                  {userSearch ? "Try adjusting your search query or filter." : "No non-admin accounts exist in the database."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-[#3D4944]">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 dark:hover:bg-[#26332F]/50 transition"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-[#26332F] flex items-center justify-center font-bold text-sm text-gray-700 dark:text-[#F7F2E8] shrink-0 border border-gray-200/50 dark:border-[#3D4944]">
                        {user.full_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-gray-900 dark:text-[#F7F2E8] truncate">
                            {user.full_name}
                          </p>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              user.role === "worker"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                            }`}
                          >
                            {user.role}
                          </span>
                          {!user.is_active && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                              Suspended
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400 font-mono">
                            ID #{user.id}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-[#9A9185] truncate mt-1">
                          {user.email} · {user.phone}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setUserToDelete(user)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-100 dark:border-red-900/30 transition self-end sm:self-auto shrink-0 shadow-sm"
                    >
                      <Trash2 size={14} />
                      Delete Account
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Footer of Table */}
            <div className="p-4 bg-gray-50/50 dark:bg-[#182320] border-t border-gray-100 dark:border-[#3D4944] flex items-center justify-between text-xs text-gray-500 dark:text-[#9A9185]">
              <span>Showing {filteredUsers.length} total accounts</span>
              <span>Admin accounts are protected and excluded</span>
            </div>
          </div>
        </main>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CHANGE PASSPHRASE MODAL
         ───────────────────────────────────────────────────────────── */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1C2825] border border-gray-100 dark:border-[#3D4944] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#3D4944] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#087F7A]/10 flex items-center justify-center text-[#087F7A]">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-[#F7F2E8]">
                    Change Security Passphrase
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#9A9185]">
                    Update your Danger Zone authorization key
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowChangeModal(false);
                  setChangeError("");
                  setChangeSuccess("");
                }}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#26332F] text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            {changeError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
                {changeError}
              </div>
            )}

            {changeSuccess && (
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-xs text-green-700 dark:text-green-300">
                {changeSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassphrase} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-[#C8C0B4]">
                  Current Passphrase
                </label>
                <input
                  type="password"
                  placeholder="Enter current passphrase..."
                  value={currentPassphraseForChange}
                  onChange={(e) => setCurrentPassphraseForChange(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-[#26332F] border border-gray-200 dark:border-[#3D4944] text-gray-900 dark:text-[#F7F2E8] placeholder-gray-400 focus:outline-none focus:border-[#087F7A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-[#C8C0B4]">
                  New Passphrase
                </label>
                <input
                  type="password"
                  placeholder="Enter new passphrase (min 4 chars)..."
                  value={changeNewPassphrase}
                  onChange={(e) => setChangeNewPassphrase(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-[#26332F] border border-gray-200 dark:border-[#3D4944] text-gray-900 dark:text-[#F7F2E8] placeholder-gray-400 focus:outline-none focus:border-[#087F7A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-[#C8C0B4]">
                  Confirm New Passphrase
                </label>
                <input
                  type="password"
                  placeholder="Re-enter new passphrase..."
                  value={changeConfirmPassphrase}
                  onChange={(e) => setChangeConfirmPassphrase(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-[#26332F] border border-gray-200 dark:border-[#3D4944] text-gray-900 dark:text-[#F7F2E8] placeholder-gray-400 focus:outline-none focus:border-[#087F7A]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowChangeModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-[#3D4944] text-xs font-semibold text-gray-700 dark:text-[#F7F2E8] hover:bg-gray-50 dark:hover:bg-[#26332F] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#087F7A] hover:bg-[#066561] text-white text-xs font-semibold transition shadow-sm"
                >
                  Update Passphrase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DELETE CONFIRMATION MODAL
         ───────────────────────────────────────────────────────────── */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1C2825] border border-gray-100 dark:border-[#3D4944] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-[#F7F2E8]">
                Permanently Delete User?
              </h3>
              <p className="text-sm text-gray-500 dark:text-[#9A9185]">
                Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{userToDelete.full_name}</strong> (<span className="text-gray-700 dark:text-gray-300">{userToDelete.email}</span>)?
              </p>
              <div className="p-3.5 bg-red-50/70 dark:bg-red-900/20 rounded-xl text-left text-xs text-red-700 dark:text-red-300 space-y-1.5 border border-red-100 dark:border-red-900/30">
                <p className="font-bold">⚠️ Warning:</p>
                <p>• All bookings, reviews, and payments for this user will be removed.</p>
                <p>• Any associated profile, skills, and availability data will be wiped.</p>
                <p>• This action is immediate and cannot be recovered.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={deletingUser}
                onClick={() => setUserToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3D4944] text-xs font-semibold text-gray-700 dark:text-[#F7F2E8] hover:bg-gray-50 dark:hover:bg-[#26332F] transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingUser}
                onClick={handleDeleteUser}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition disabled:opacity-50 shadow-sm"
              >
                {deletingUser ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
