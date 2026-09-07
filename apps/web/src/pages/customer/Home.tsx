import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Car,
  ChevronRight,
  Clock3,
  Droplets,
  Hammer,
  Home as HomeIcon,
  Loader2,
  MapPin,
  Paintbrush,
  Search,
  ShieldCheck,
  Star,
  UserRound,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getStoredUser, type AuthUser } from "../../services/auth";
import { getCustomerProfile } from "../../services/profile";
import { getWorkers, type Worker } from "../../services/worker";
import { BottomNavigation } from "../../components/navigation/BottomNavigation";

const services = [
  {
    name: "Electrician",
    icon: ZapIcon,
    color: "#FFF1E8",
    iconColor: "#FF5A00",
  },
  {
    name: "Plumber",
    icon: Droplets,
    color: "#E6F7F5",
    iconColor: "#087F7A",
  },
  {
    name: "Carpenter",
    icon: Hammer,
    color: "#FFF1E8",
    iconColor: "#FF5A00",
  },
  {
    name: "Cleaner",
    icon: SparkleIcon,
    color: "#E6F7F5",
    iconColor: "#087F7A",
  },
  {
    name: "Painter",
    icon: Paintbrush,
    color: "#FFF1E8",
    iconColor: "#FF5A00",
  },
  {
    name: "Driver",
    icon: Car,
    color: "#E6F7F5",
    iconColor: "#087F7A",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [workersList, setWorkersList] = useState<Worker[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [locationLabel, setLocationLabel] = useState("Set your location");

  useEffect(() => {
    setUser(getStoredUser());

    getCustomerProfile()
      .then((profile) => {
        const city = profile.city?.trim();
        const state = profile.state?.trim();
        if (city && state) setLocationLabel(`${city}, ${state}`);
        else if (city) setLocationLabel(city);
        else setLocationLabel("Set your location");
      })
      .catch(() => setLocationLabel("Set your location"));

    async function loadWorkers() {
      try {
        setLoadingWorkers(true);
        const data = await getWorkers();
        setWorkersList(data);
      } catch (err) {
        console.error("Failed to load workers:", err);
      } finally {
        setLoadingWorkers(false);
      }
    }

    loadWorkers();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning,";
    if (hour < 17) return "Good Afternoon,";
    return "Good Evening,";
  };

  const displayName = user?.full_name
    ? `${user.full_name.split(" ")[0]} 👋`
    : "Welcome 👋";

  const avatarInitial = user?.full_name
    ? user.full_name.trim()[0].toUpperCase()
    : null;

  return (
    <main className="min-h-screen w-full bg-[#F9FAFB] flex justify-center">
      <div className="relative flex min-h-screen w-full max-w-[430px] flex-col bg-[#F9FAFB]">
        {/* ================= HEADER ================= */}
        <header className="px-5 pb-3 pt-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#E6F7F5]">
                {avatarInitial ? (
                  <span className="text-sm font-bold text-[#087F7A]">
                    {avatarInitial}
                  </span>
                ) : (
                  <UserRound
                    size={22}
                    strokeWidth={1.8}
                    className="text-[#087F7A]"
                  />
                )}
              </div>

              <div>
                <p className="text-[11px] font-medium text-[#6B7280]">
                  {getGreeting()}
                </p>

                <h1 className="text-[17px] font-bold text-[#111827]">
                  {displayName}
                </h1>
              </div>
            </div>

            <button
              className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-white
                text-[#374151]
                shadow-[0_2px_10px_rgba(0,0,0,0.05)]
              "
              aria-label="Notifications"
              onClick={() => navigate("/customer/notifications")}
            >
              <Bell size={19} strokeWidth={1.8} />

              <span className="absolute right-[9px] top-[8px] h-2 w-2 rounded-full bg-[#FF5A00]" />
            </button>
          </div>

          {/* Location */}
          <button
            type="button"
            onClick={() => navigate("/customer/profile")}
            className="mt-4 flex items-center gap-1.5 text-left"
            aria-label="Update service location"
          >
            <MapPin
              size={15}
              strokeWidth={2}
              className="text-[#FF5A00]"
            />

            <span className="text-[12px] font-medium text-[#374151]">
              {locationLabel}
            </span>

            <ChevronRight
              size={14}
              className="text-[#9CA3AF]"
            />
          </button>
        </header>

        {/* ================= SCROLLABLE CONTENT ================= */}
        <div className="flex-1 overflow-y-auto px-5 pb-[105px]">
          {/* Search */}
          <button
            onClick={() => navigate("/customer/search")}
            className="
              mt-4
              flex
              h-[50px]
              w-full
              items-center
              gap-3
              rounded-[12px]
              border
              border-[#E5E7EB]
              bg-white
              px-4
              text-left
              shadow-[0_2px_10px_rgba(0,0,0,0.03)]
            "
          >
            <Search
              size={19}
              strokeWidth={1.8}
              className="text-[#9CA3AF]"
            />

            <span className="flex-1 text-[12px] text-[#9CA3AF]">
              Search for Electrician, Plumber...
            </span>

            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#FFF1E8]">
              <Wrench
                size={15}
                className="text-[#FF5A00]"
              />
            </div>
          </button>

          {/* ================= POPULAR SERVICES ================= */}
          <section className="mt-7">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#111827]">
                Popular Services
              </h2>

              <button
                onClick={() => navigate("/customer/services")}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#087F7A]"
              >
                See all
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <button
                    key={service.name}
                    onClick={() =>
                      navigate(
                        `/customer/search?service=${encodeURIComponent(
                          service.name
                        )}`
                      )
                    }
                    className="
                      flex
                      min-h-[92px]
                      flex-col
                      items-center
                      justify-center
                      rounded-[15px]
                      border
                      border-[#E5E7EB]
                      bg-white
                      px-2
                      py-3
                      transition
                      hover:-translate-y-0.5
                      hover:shadow-[0_5px_15px_rgba(0,0,0,0.06)]
                      active:scale-[0.98]
                    "
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-[12px]"
                      style={{
                        backgroundColor: service.color,
                        color: service.iconColor,
                      }}
                    >
                      <Icon size={19} strokeWidth={1.8} />
                    </div>

                    <span className="mt-2 text-[10px] font-medium text-[#374151]">
                      {service.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ================= AI MATCHING BANNER ================= */}
          <section className="mt-7">
            <button
              onClick={() =>
                navigate("/customer/recommendations")
              }
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-[16px]
                bg-[#087F7A]
                px-4
                py-4
                text-left
                shadow-[0_6px_18px_rgba(8,127,122,0.14)]
              "
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white/15">
                <SparkleIcon
                  size={19}
                  className="text-white"
                />
              </div>

              <div className="flex-1">
                <p className="text-[12px] font-bold text-white">
                  Find your best match
                </p>

                <p className="mt-0.5 text-[10px] leading-4 text-white/75">
                  Get smart worker recommendations near you.
                </p>
              </div>

              <ArrowRight
                size={18}
                className="shrink-0 text-white"
              />
            </button>
          </section>

          {/* ================= TOP RATED WORKERS ================= */}
          <section className="mt-7">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-[#111827]">
                  Top Rated Workers
                </h2>

                <p className="mt-1 text-[10px] text-[#9CA3AF]">
                  Trusted professionals near you
                </p>
              </div>

              <button
                onClick={() => navigate("/customer/search")}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#087F7A]"
              >
                View all
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="space-y-3">
              {loadingWorkers ? (
                <div className="flex flex-col items-center justify-center py-8 bg-white rounded-2xl border border-gray-100">
                  <Loader2 size={24} className="animate-spin text-[#087F7A]" />
                  <p className="text-xs text-gray-500 mt-2">Finding nearby service providers...</p>
                </div>
              ) : workersList.length === 0 ? (
                <div className="text-center py-8 px-4 bg-white rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-500">No service providers available right now.</p>
                </div>
              ) : (
                workersList.map((worker) => (
                  <button
                    key={worker.id}
                    onClick={() => navigate(`/customer/worker/${worker.id}`)}
                    className="
                      flex
                      w-full
                      gap-3
                      rounded-[16px]
                      border
                      border-[#E5E7EB]
                      bg-white
                      p-3
                      text-left
                      transition
                      hover:shadow-[0_5px_18px_rgba(0,0,0,0.06)]
                      active:scale-[0.99]
                    "
                  >
                    {/* Worker Image */}
                    <div className="relative shrink-0">
                      <img
                        src={
                          worker.image ||
                          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=85"
                        }
                        alt={worker.name}
                        className="h-[76px] w-[76px] rounded-[13px] object-cover"
                      />

                      {worker.verified && (
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#16A34A]">
                          <ShieldCheck
                            size={11}
                            className="text-white"
                          />
                        </div>
                      )}
                    </div>

                    {/* Worker Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="truncate text-[13px] font-bold text-[#111827]">
                            {worker.name}
                          </h3>

                          <p className="mt-0.5 text-[11px] text-[#6B7280]">
                            {worker.service}
                          </p>
                        </div>

                        {worker.verified && (
                          <span className="shrink-0 rounded-full bg-[#E6F7F5] px-2 py-1 text-[9px] font-semibold text-[#087F7A]">
                            Verified
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {worker.reviews > 0 ? (
                            <>
                              <Star
                                size={12}
                                fill="#F59E0B"
                                className="text-[#F59E0B]"
                              />
                              <span className="text-[10px] font-semibold text-[#374151]">
                                {worker.rating.toFixed(1)}
                              </span>
                              <span className="text-[9px] text-[#9CA3AF]">
                                ({worker.reviews})
                              </span>
                            </>
                          ) : (
                            <span className="text-[10px] font-medium text-[#6B7280]">
                              No reviews yet
                            </span>
                          )}
                        </div>

                        <span className="h-3 w-px bg-[#E5E7EB]" />

                        <span className="text-[9px] text-[#6B7280]">
                          {worker.experience}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[9px] text-[#6B7280]">
                            <MapPin size={11} />
                            {worker.city || "Nearby"}
                          </span>

                          <span className="flex items-center gap-1 text-[9px] text-[#6B7280]">
                            <Clock3 size={11} />
                            {worker.available ? "Available" : "Offline"}
                          </span>
                        </div>

                        <span className="text-[12px] font-bold text-[#111827]">
                          {worker.price}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          {/* ================= TRUST SECTION ================= */}
          <section className="mt-7 rounded-[16px] border border-[#E5E7EB] bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#E6F7F5]">
                <ShieldCheck
                  size={20}
                  className="text-[#087F7A]"
                />
              </div>

              <div>
                <h3 className="text-[12px] font-bold text-[#111827]">
                  Trusted local professionals
                </h3>

                <p className="mt-0.5 text-[10px] leading-4 text-[#6B7280]">
                  Verified workers from your local cooperative.
                </p>
              </div>
            </div>
          </section>
        </div>

        <BottomNavigation role="customer" />
      </div>
    </main>
  );
}

/* ================= NAV ITEM ================= */

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function NavItem({
  icon: Icon,
  label,
  active = false,
  onClick,
}: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1"
    >
      <Icon
        size={20}
        strokeWidth={active ? 2.2 : 1.8}
        className={
          active ? "text-[#FF5A00]" : "text-[#9CA3AF]"
        }
      />

      <span
        className={`text-[9px] font-medium ${
          active ? "text-[#FF5A00]" : "text-[#9CA3AF]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

/* ================= CUSTOM ICONS ================= */

function ZapIcon({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
    </svg>
  );
}

function SparkleIcon({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.5 4.5L6 9l4.5 1.5L12 15l1.5-4.5L18 9l-4.5-1.5L12 3Z" />
      <path d="m19 15-.8 2.2L16 18l2.2.8L19 21l.8-2.2L22 18l-2.2-.8L19 15Z" />
    </svg>
  );
}