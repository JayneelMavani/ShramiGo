import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  CircleHelp,
  Edit3,
  FileText,
  IndianRupee,
  LogOut,
  MapPin,
  Settings,
  ShieldCheck,
  Star,
  UserRound,
  Wallet,
} from "lucide-react";

import {
  getWorkerProfile,
  getWorkerSkills,
  getMyWorkerServices,
  type WorkerProfile,
  type WorkerSkill,
  type WorkerService,
} from "../../services/worker";
import { updateWorkerProfile } from "../../services/worker";
import { compressProfileImage } from "../../utils/profileImage";

interface StoredUser {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  role: "customer" | "worker" | "admin";
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState<StoredUser | null>(null);
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [skills, setSkills] = useState<WorkerSkill[]>([]);
  const [services, setServices] = useState<WorkerService[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    bio: "",
    experience_years: 0,
    profile_image: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const storedUser = localStorage.getItem(
          "shramigo_user"
        );

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        const [
          workerProfile,
          workerSkills,
          workerServices,
        ] = await Promise.all([
          getWorkerProfile(),
          getWorkerSkills(),
          getMyWorkerServices(),
        ]);

        setProfile(workerProfile);
        setSkills(workerSkills);
        setServices(workerServices);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const openEditModal = () => {
    setEditForm({
      full_name: user?.full_name ?? "",
      phone: user?.phone ?? "",
      address: profile?.address ?? "",
      city: profile?.city ?? "",
      state: profile?.state ?? "",
      pincode: profile?.pincode ?? "",
      bio: profile?.bio ?? "",
      experience_years: profile?.experience_years ?? 0,
      profile_image: profile?.profile_image ?? "",
    });
    setEditError("");
    setSaveSuccess(false);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      setEditError("");
      const updated = await updateWorkerProfile({
        full_name: editForm.full_name.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
        city: editForm.city.trim(),
        state: editForm.state.trim(),
        pincode: editForm.pincode.trim(),
        bio: editForm.bio.trim(),
        experience_years: Number(editForm.experience_years),
        profile_image: editForm.profile_image || undefined,
      });
      setProfile(updated);
      if (user) {
        const updatedUser = {
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
      }, 900);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const workerName =
    user?.full_name || "Worker";

  const skillText =
    skills.length > 0
      ? skills.map((skill) => skill.skill_name).join(", ")
      : "No skills added yet";

  const serviceArea =
    profile?.city ||
    profile?.address ||
    "Service area not set";

  const experience =
    profile?.experience_years !== undefined
      ? `${profile.experience_years} years`
      : "Not specified";

  const hourlyRate =
    services.length > 0
      ? services[0].custom_price !== null
        ? `₹${services[0].custom_price} / service`
        : `From ₹${services[0].base_price}`
      : "Not set";

  return (
    <div className="min-h-screen bg-[#F7F8F8] flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-[#F7F8F8]">

        {/* Header */}
        <div className="bg-[#087F7A] px-5 pt-7 pb-8 rounded-b-[32px] text-white">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => navigate("/worker")}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
            >
              <ArrowLeft size={19} />
            </button>

            <h1 className="text-xl font-bold">
              My Profile
            </h1>

          </div>

          {/* Profile */}
          <div className="mt-7 flex items-center gap-4">

            <div className="relative">

              <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center overflow-hidden">

                {profile?.profile_image ? (
                  <img
                    src={profile.profile_image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserRound
                    size={38}
                    className="text-[#087F7A]"
                  />
                )}

              </div>

              <button
                type="button"
                onClick={openEditModal}
                aria-label="Edit profile"
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#FF5A00] border-2 border-[#087F7A] flex items-center justify-center"
              >
                <Edit3 size={12} className="text-white" />
              </button>

            </div>

            <div>

              <div className="flex items-center gap-2">

                <h2 className="text-lg font-bold">
                  {loading ? "Loading..." : workerName}
                </h2>

                {user?.is_verified && (
                  <ShieldCheck
                    size={17}
                    className="text-white"
                  />
                )}

              </div>

              <p className="text-sm text-white/70 mt-1">
                {skills.length > 0
                  ? `Professional ${skills[0].skill_name}`
                  : "Professional Worker"}
              </p>

              <div className="flex items-center gap-3 mt-2">

                <div className="flex items-center gap-1">

                  <Star
                    size={13}
                    fill="currentColor"
                  />

                  <span className="text-xs font-semibold">
                    4.9
                  </span>

                </div>

                <span className="text-white/40">
                  •
                </span>

                <span className="text-xs text-white/70">
                  120 reviews
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* Content */}
        <div className="px-5 pt-5 pb-10">
          <button
            type="button"
            onClick={openEditModal}
            className="w-full h-11 rounded-xl bg-white border border-[#FF5A00] text-[#FF5A00] text-xs font-bold flex items-center justify-center gap-2"
          >
            <Edit3 size={15} />
            Edit Profile
          </button>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-4">
              <p className="text-xs text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* Verification */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">

                <ShieldCheck
                  size={20}
                  className="text-green-600"
                />

              </div>

              <div className="flex-1">

                <p className="text-sm font-bold text-gray-900">
                  {user?.is_verified
                    ? "Verified Worker"
                    : "Worker Verification"}
                </p>

                <p className="text-[10px] text-gray-400 mt-1">
                  {user?.is_verified
                    ? "Your profile has been verified by ShramiGo"
                    : "Your profile is awaiting verification"}
                </p>

              </div>

              <span
                className={`text-[10px] font-bold ${
                  user?.is_verified
                    ? "text-green-600"
                    : "text-orange-500"
                }`}
              >
                {user?.is_verified
                  ? "Verified"
                  : "Pending"}
              </span>

            </div>

          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">

            <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">

              <BriefcaseBusiness
                size={17}
                className="text-[#FF5A00] mx-auto"
              />

              <p className="text-lg font-bold text-gray-900 mt-2">
                120
              </p>

              <p className="text-[9px] text-gray-400">
                Jobs done
              </p>

            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">

              <Star
                size={17}
                className="text-yellow-500 mx-auto"
                fill="currentColor"
              />

              <p className="text-lg font-bold text-gray-900 mt-2">
                4.9
              </p>

              <p className="text-[9px] text-gray-400">
                Rating
              </p>

            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">

              <IndianRupee
                size={17}
                className="text-green-600 mx-auto"
              />

              <p className="text-lg font-bold text-gray-900 mt-2">
                {services.length > 0
                  ? services.length
                  : 0}
              </p>

              <p className="text-[9px] text-gray-400">
                Services
              </p>

            </div>

          </div>

          {/* Professional information */}
          <div className="mt-6">

            <h2 className="text-base font-bold text-gray-900 mb-3">
              Professional information
            </h2>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

              <ProfileRow
                icon={<BriefcaseBusiness size={17} />}
                title="Skills"
                value={
                  loading
                    ? "Loading..."
                    : skillText
                }
                iconClass="text-[#FF5A00] bg-orange-50"
              />

              <ProfileRow
                icon={<MapPin size={17} />}
                title="Service area"
                value={
                  loading
                    ? "Loading..."
                    : serviceArea
                }
                iconClass="text-[#087F7A] bg-teal-50"
              />

              <ProfileRow
                icon={<Wallet size={17} />}
                title="Services offered"
                value={
                  loading
                    ? "Loading..."
                    : services.length > 0
                    ? `${services.length} services`
                    : "No services added"
                }
                iconClass="text-green-600 bg-green-50"
              />

              <ProfileRow
                icon={<IndianRupee size={17} />}
                title="Pricing"
                value={
                  loading
                    ? "Loading..."
                    : hourlyRate
                }
                iconClass="text-blue-600 bg-blue-50"
              />

              <ProfileRow
                icon={<FileText size={17} />}
                title="Experience"
                value={
                  loading
                    ? "Loading..."
                    : experience
                }
                iconClass="text-purple-600 bg-purple-50"
                last
              />

            </div>

          </div>

          {/* My Services */}
          <div className="mt-6">

            <div className="flex items-center justify-between mb-3">

              <h2 className="text-base font-bold text-gray-900">
                My Services
              </h2>

              <span className="text-[10px] font-semibold text-[#087F7A]">
                {services.length} active
              </span>

            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

              {loading ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-gray-400">
                    Loading services...
                  </p>
                </div>
              ) : services.length === 0 ? (
                <div className="px-4 py-6 text-center">

                  <BriefcaseBusiness
                    size={24}
                    className="mx-auto text-gray-300"
                  />

                  <p className="text-sm font-semibold text-gray-700 mt-2">
                    No services added
                  </p>

                  <p className="text-[10px] text-gray-400 mt-1">
                    Select your skills to add services.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/worker/skills")
                    }
                    className="mt-3 text-[11px] font-semibold text-[#087F7A]"
                  >
                    Manage skills →
                  </button>

                </div>
              ) : (
                services.map((service, index) => (

                  <div
                    key={service.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      index !== services.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >

                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#087F7A] flex items-center justify-center">

                      <BriefcaseBusiness
                        size={17}
                      />

                    </div>

                    <div className="flex-1 min-w-0">

                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {service.name}
                      </p>

                      <p className="text-[10px] text-gray-400 mt-1">
                        {service.category}
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-xs font-bold text-gray-800">
                        ₹
                        {service.custom_price ??
                          service.base_price}
                      </p>

                      <p className="text-[9px] text-green-600">
                        Active
                      </p>

                    </div>

                  </div>

                ))
              )}

            </div>

          </div>

          {/* Account settings */}
          <div className="mt-6">

            <h2 className="text-base font-bold text-gray-900 mb-3">
              Account & settings
            </h2>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

              <SettingsRow
                icon={<UserRound size={17} />}
                title="Personal information"
                subtitle="Name, phone and email"
              />

              <SettingsRow
                icon={<Bell size={17} />}
                title="Notifications"
                subtitle="Manage notification preferences"
              />

              <SettingsRow
                icon={<Settings size={17} />}
                title="App settings"
                subtitle="Language and preferences"
              />

              <SettingsRow
                icon={<CircleHelp size={17} />}
                title="Help & support"
                subtitle="Get help with ShramiGo"
                last
              />

            </div>

          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(
                "shramigo_token"
              );
              localStorage.removeItem(
                "shramigo_user"
              );

              navigate("/role-selection");
            }}
            className="w-full mt-5 h-12 rounded-2xl bg-white border border-red-100 text-red-500 text-sm font-bold flex items-center justify-center gap-2"
          >

            <LogOut size={17} />

            Logout

          </button>

          <p className="text-center text-[10px] text-gray-400 mt-5">
            ShramiGo Worker • Version 1.0
          </p>

          {isEditModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-[400px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900">Edit Worker Profile</h3>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    ×
                  </button>
                </div>

                <form onSubmit={handleSaveProfile} className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFA] p-3">
                    <div className="h-14 w-14 overflow-hidden rounded-full bg-[#087F7A] flex items-center justify-center text-lg font-bold text-white shrink-0">
                      {editForm.profile_image ? <img src={editForm.profile_image} alt="Preview" className="h-full w-full object-cover" /> : workerName.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Profile photo</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG or WEBP · compressed automatically</p>
                      <label className="inline-flex mt-2 cursor-pointer rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-[10px] font-semibold text-gray-700">
                        Choose photo
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const image = await compressProfileImage(file);
                            setEditForm((current) => ({ ...current, profile_image: image }));
                            setEditError("");
                          } catch (err) {
                            setEditError(err instanceof Error ? err.message : "Could not process image.");
                          }
                        }} />
                      </label>
                    </div>
                  </div>

                  {([
                    ["Full Name", "full_name", "text"],
                    ["Phone Number", "phone", "tel"],
                    ["Address", "address", "text"],
                    ["City", "city", "text"],
                    ["State", "state", "text"],
                    ["Pincode", "pincode", "text"],
                  ] as const).map(([label, key, type]) => (
                    <div key={key}>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">{label}</label>
                      <input type={type} value={editForm[key]} onChange={(e) => setEditForm((current) => ({ ...current, [key]: e.target.value }))} required={key === "full_name" || key === "phone"} className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#FF5A00]" />
                    </div>
                  ))}

                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Experience (years)</label>
                    <input type="number" min="0" max="60" value={editForm.experience_years} onChange={(e) => setEditForm((current) => ({ ...current, experience_years: Number(e.target.value) }))} className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#FF5A00]" />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Bio</label>
                    <textarea value={editForm.bio} onChange={(e) => setEditForm((current) => ({ ...current, bio: e.target.value }))} rows={3} className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#FF5A00] resize-none" placeholder="Tell customers about your experience" />
                  </div>

                  {editError && <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-[11px] text-red-600">{editError}</div>}
                  {saveSuccess && <div className="rounded-xl bg-green-50 border border-green-100 px-3 py-2 text-[11px] text-green-600">Profile updated successfully!</div>}

                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-1/2 h-11 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600">Cancel</button>
                    <button type="submit" disabled={saving} className="w-1/2 h-11 rounded-xl bg-[#FF5A00] text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60">
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

function ProfileRow({
  icon,
  title,
  value,
  iconClass,
  last = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  iconClass: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-4 ${
        !last ? "border-b border-gray-100" : ""
      }`}
    >

      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">

        <p className="text-xs text-gray-400">
          {title}
        </p>

        <p className="text-sm font-semibold text-gray-800 mt-1 truncate">
          {value}
        </p>

      </div>

      <ChevronRight
        size={17}
        className="text-gray-400 shrink-0"
      />

    </div>
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
  last = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  last?: boolean;
}) {
  return (
    <button
      type="button"
      className={`w-full flex items-center gap-3 px-4 py-4 text-left ${
        !last ? "border-b border-gray-100" : ""
      }`}
    >

      <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center">
        {icon}
      </div>

      <div className="flex-1">

        <p className="text-sm font-semibold text-gray-800">
          {title}
        </p>

        <p className="text-[10px] text-gray-400 mt-1">
          {subtitle}
        </p>

      </div>

      <ChevronRight
        size={17}
        className="text-gray-400"
      />

    </button>
  );
}