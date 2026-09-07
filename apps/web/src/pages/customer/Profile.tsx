import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  HelpCircle,
  Home,
  Lock,
  LogOut,
  MapPin,
  Pencil,
  Search,
  User,
  CreditCard,
  CalendarDays,
  ShieldCheck,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { getStoredUser, logout, type AuthUser } from "../../services/auth";
import {
  getCustomerProfile,
  updateCustomerProfile,
  type CustomerProfile,
} from "../../services/profile";
import { getMyBookings, type Booking } from "../../services/bookings";
import { compressProfileImage } from "../../utils/profileImage";
import { BottomNavigation } from "../../components/navigation/BottomNavigation";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<{
    title: string;
    content: React.ReactNode;
  } | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    profile_image: "",
  });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);

    async function loadData() {
      try {
        setLoading(true);
        const [profileData, bookingsData] = await Promise.all([
          getCustomerProfile().catch(() => null),
          getMyBookings().catch(() => []),
        ]);

        if (profileData) {
          setProfile(profileData);
        }
        setBookings(bookingsData);
      } catch (err) {
        console.error("Error loading profile data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const openEditModal = () => {
    setEditForm({
      full_name: user?.full_name ?? "",
      phone: user?.phone ?? "",
      address: profile?.address ?? "",
      city: profile?.city ?? "",
      state: profile?.state ?? "",
      pincode: profile?.pincode ?? "",
      profile_image: profile?.profile_image ?? "",
    });
    setEditError("");
    setSaveSuccess(false);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setEditError("");

      const updatedProfile = await updateCustomerProfile({
        full_name: editForm.full_name.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
        city: editForm.city.trim(),
        state: editForm.state.trim(),
        pincode: editForm.pincode.trim(),
        profile_image: editForm.profile_image || undefined,
      });

      setProfile(updatedProfile);

      // Update stored user in localStorage & state
      if (user) {
        const updatedUser: AuthUser = {
          ...user,
          full_name: editForm.full_name.trim() || user.full_name,
          phone: editForm.phone.trim() || user.phone,
        };
        localStorage.setItem("shramigo_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSaveSuccess(false);
      }, 1000);
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/welcome");
  };

  const avatarInitial = user?.full_name
    ? user.full_name.trim()[0].toUpperCase()
    : "U";

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(
    (b) => b.status !== "completed" && b.status !== "cancelled"
  ).length;
  const hasSavedAddress = Boolean(profile?.address || profile?.city);

  const menuItems = [
    {
      icon: User,
      title: "Personal Information",
      subtitle: "Manage your name, phone and email",
      action: openEditModal,
    },
    {
      icon: MapPin,
      title: "My Addresses",
      subtitle: profile?.address
        ? `${profile.address}, ${profile.city || ""}`
        : "Manage your saved addresses",
      action: () =>
        setInfoModal({
          title: "My Saved Address",
          content: (
            <div className="space-y-3 text-left">
              {profile?.address ? (
                <div className="rounded-xl border border-gray-100 bg-[#F9FAFB] p-4">
                  <p className="text-xs font-bold text-[#087F7A]">PRIMARY ADDRESS</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {profile.address}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {[profile.city, profile.state, profile.pincode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  No address saved yet. Update your address by clicking "Edit Profile".
                </p>
              )}
              <button
                onClick={() => {
                  setInfoModal(null);
                  openEditModal();
                }}
                className="w-full py-2.5 rounded-xl bg-[#087F7A] text-white text-xs font-semibold"
              >
                {profile?.address ? "Edit Address" : "Add Address"}
              </button>
            </div>
          ),
        }),
    },
    {
      icon: CreditCard,
      title: "Payment Methods",
      subtitle: "UPI, Cards, and Cash on Completion",
      action: () =>
        setInfoModal({
          title: "Payment Options",
          content: (
            <div className="space-y-3 text-left text-xs text-gray-600">
              <div className="rounded-xl border border-gray-100 bg-[#F9FAFB] p-3.5 flex items-center gap-3">
                <span className="text-lg">💵</span>
                <div>
                  <p className="font-semibold text-gray-900">Cash on Completion</p>
                  <p className="text-[11px] text-gray-500">
                    Pay the service professional directly once work is complete.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-[#F9FAFB] p-3.5 flex items-center gap-3">
                <span className="text-lg">📱</span>
                <div>
                  <p className="font-semibold text-gray-900">UPI & Online</p>
                  <p className="text-[11px] text-gray-500">
                    Pay securely using UPI (GPay, PhonePe) or debit/credit card during checkout.
                  </p>
                </div>
              </div>
            </div>
          ),
        }),
    },
  ];

  const supportItems = [
    {
      icon: HelpCircle,
      title: "Help & Support",
      subtitle: "Get help with your bookings",
      action: () =>
        setInfoModal({
          title: "Help & Support",
          content: (
            <div className="space-y-3 text-left text-xs text-gray-600">
              <p>Need assistance with a booking or account?</p>
              <div className="rounded-xl bg-gray-50 p-3 space-y-1.5">
                <p>
                  <span className="font-semibold text-gray-900">Email:</span>{" "}
                  support@shramigo.in
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Helpline:</span>{" "}
                  +91 1800-123-4567 (9 AM - 8 PM)
                </p>
              </div>
            </div>
          ),
        }),
    },
    {
      icon: Lock,
      title: "Privacy & Security",
      subtitle: "Manage your account security",
      action: () =>
        setInfoModal({
          title: "Privacy & Security",
          content: (
            <div className="space-y-3 text-left text-xs text-gray-600">
              <p>
                Your account is protected by encrypted password hashing (bcrypt) and
                secure JWT token authentication.
              </p>
              <p>
                Your personal details and booking history are private and only shared
                with assigned service professionals.
              </p>
            </div>
          ),
        }),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8F8] text-[#171717]">
      <div className="mx-auto min-h-screen max-w-[430px] bg-white shadow-sm relative">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F8F8]"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="text-lg font-bold">My Profile</h1>

          <div className="w-10" />
        </header>

        <main className="px-5 pb-28 pt-5">
          {/* Profile Card */}
          <section className="rounded-3xl bg-gradient-to-br from-[#FFF4EC] to-white p-5 border border-orange-100/50 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#FF5A00] text-2xl font-bold text-white shadow-md shadow-orange-200 overflow-hidden">
                  {profile?.profile_image ? (
                    <img src={profile.profile_image} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    avatarInitial
                  )}
                </div>

                <button
                  onClick={openEditModal}
                  aria-label="Edit Profile"
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#087F7A] text-white hover:scale-105 transition"
                >
                  <Pencil size={13} />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold truncate text-gray-900">
                  {user?.full_name || "User"}
                </h2>
                <p className="mt-0.5 text-sm text-gray-500 truncate">
                  {user?.phone || profile?.address || "No phone registered"}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {user?.email || ""}
                </p>
              </div>
            </div>

            <button
              onClick={openEditModal}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#FF5A00] bg-white py-3 text-sm font-semibold text-[#FF5A00] hover:bg-orange-50 transition active:scale-[0.99]"
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          </section>

          {/* Quick Stats */}
          <section className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-[#F7F8F8] p-3 text-center border border-gray-100/80">
              <CalendarDays
                size={20}
                className="mx-auto text-[#FF5A00]"
              />
              <p className="mt-2 text-lg font-bold text-gray-900">
                {loading ? "-" : totalBookings}
              </p>
              <p className="text-[11px] text-gray-500">Bookings</p>
            </div>

            <div className="rounded-2xl bg-[#F7F8F8] p-3 text-center border border-gray-100/80">
              <ShieldCheck
                size={20}
                className="mx-auto text-[#087F7A]"
              />
              <p className="mt-2 text-lg font-bold text-gray-900">
                {loading ? "-" : activeBookings}
              </p>
              <p className="text-[11px] text-gray-500">Active</p>
            </div>

            <div className="rounded-2xl bg-[#F7F8F8] p-3 text-center border border-gray-100/80">
              <Home size={20} className="mx-auto text-[#FF5A00]" />
              <p className="mt-2 text-lg font-bold text-gray-900">
                {hasSavedAddress ? "1" : "0"}
              </p>
              <p className="text-[11px] text-gray-500">Addresses</p>
            </div>
          </section>

          {/* Account */}
          <section className="mt-7">
            <h3 className="mb-3 text-sm font-bold text-gray-900">
              Account
            </h3>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
              {menuItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    onClick={item.action}
                    className={`flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-gray-50 ${
                      index !== menuItems.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF1E8] text-[#FF5A00]">
                      <Icon size={19} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-gray-900">{item.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500 truncate">
                        {item.subtitle}
                      </p>
                    </div>

                    <ChevronRight
                      size={18}
                      className="text-gray-400 shrink-0"
                    />
                  </button>
                );
              })}

              {/* Notifications */}
              <div className="flex items-center gap-4 border-t border-gray-100 px-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E9F7F6] text-[#087F7A]">
                  <Bell size={19} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Notifications</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Booking and service updates
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Toggle notifications"
                  onClick={() => setNotifications(!notifications)}
                  className={`relative h-6 w-11 rounded-full transition ${
                    notifications ? "bg-[#087F7A]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                      notifications ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Support */}
          <section className="mt-7">
            <h3 className="mb-3 text-sm font-bold text-gray-900">
              Support
            </h3>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
              {supportItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    onClick={item.action}
                    className={`flex w-full items-center gap-4 px-4 py-4 text-left hover:bg-gray-50 transition ${
                      index !== supportItems.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7F8F8] text-gray-700">
                      <Icon size={19} />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {item.subtitle}
                      </p>
                    </div>

                    <ChevronRight
                      size={18}
                      className="text-gray-400 shrink-0"
                    />
                  </button>
                );
              })}
            </div>
          </section>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 py-3.5 text-sm font-semibold text-red-500 hover:bg-red-100 transition active:scale-[0.99]"
          >
            <LogOut size={18} />
            Logout
          </button>

          <p className="mt-5 text-center text-xs text-gray-400">
            ShramiGo • Version 1.0.0
          </p>
        </main>

        {/* ================= EDIT PROFILE MODAL ================= */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-[400px] rounded-3xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">
                  Edit Personal Information
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="mt-4 space-y-3.5">
                <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFA] p-3">
                  <div className="h-14 w-14 overflow-hidden rounded-full bg-[#FF5A00] flex items-center justify-center text-lg font-bold text-white shrink-0">
                    {editForm.profile_image ? (
                      <img src={editForm.profile_image} alt="Preview" className="h-full w-full object-cover" />
                    ) : avatarInitial}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-800">Profile photo</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG or WEBP · compressed automatically</p>
                    <label className="inline-flex mt-2 cursor-pointer rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-[10px] font-semibold text-gray-700">
                      Choose photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const image = await compressProfileImage(file);
                            setEditForm((current) => ({ ...current, profile_image: image }));
                            setEditError("");
                          } catch (err) {
                            setEditError(err instanceof Error ? err.message : "Could not process image.");
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, full_name: e.target.value })
                    }
                    required
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#FF5A00]"
                    placeholder="Your Full Name"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#FF5A00]"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Service Address
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#FF5A00]"
                    placeholder="House / Flat No., Street, Landmark"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) =>
                        setEditForm({ ...editForm, city: e.target.value })
                      }
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#FF5A00]"
                      placeholder="e.g. Ahmedabad"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={editForm.pincode}
                      onChange={(e) =>
                        setEditForm({ ...editForm, pincode: e.target.value })
                      }
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#FF5A00]"
                      placeholder="e.g. 380009"
                    />
                  </div>
                </div>

                {editError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                    {editError}
                  </p>
                )}

                {saveSuccess && (
                  <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2.5 rounded-lg border border-green-100">
                    <CheckCircle2 size={16} />
                    Profile updated successfully!
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="w-1/2 h-11 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-1/2 h-11 rounded-xl bg-[#FF5A00] text-xs font-bold text-white hover:bg-[#e65100] transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= INFO MODAL ================= */}
        {infoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-[380px] rounded-3xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">
                  {infoModal.title}
                </h3>
                <button
                  onClick={() => setInfoModal(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4">{infoModal.content}</div>

              <button
                onClick={() => setInfoModal(null)}
                className="mt-5 w-full h-10 rounded-xl bg-gray-100 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNavigation role="customer" />
      </div>
    </div>
  );
}