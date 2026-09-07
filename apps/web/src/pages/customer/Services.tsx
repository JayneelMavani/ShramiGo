import {
  ArrowLeft,
  ArrowRight,
  Car,
  ChevronRight,
  Droplets,
  Hammer,
  Home,
  Paintbrush,
  Search,
  Sparkles,
  UserRound,
  Wrench,
  Zap,
  Wind,
  Sofa,
  MoreHorizontal,
} from "lucide-react";

import {
  useEffect,
  useState,
  type ElementType,
} from "react";

import { useNavigate } from "react-router-dom";

import { getServices } from "../../services/services";

interface Service {
  id: number;
  name: string;
  category: string;
  description: string | null;
  base_price: number;
  icon: string | null;
  is_active: boolean;
}

const categories = [
  {
    name: "Electrician",
    icon: Zap,
    bg: "#FFF1E8",
    color: "#FF5A00",
  },
  {
    name: "Plumber",
    icon: Droplets,
    bg: "#E6F7F5",
    color: "#087F7A",
  },
  {
    name: "Carpenter",
    icon: Hammer,
    bg: "#FFF1E8",
    color: "#FF5A00",
  },
  {
    name: "Painter",
    icon: Paintbrush,
    bg: "#E6F7F5",
    color: "#087F7A",
  },
  {
    name: "Cleaner",
    icon: Sparkles,
    bg: "#FFF1E8",
    color: "#FF5A00",
  },
  {
    name: "Driver",
    icon: Car,
    bg: "#E6F7F5",
    color: "#087F7A",
  },
  {
    name: "AC Repair",
    icon: Wind,
    bg: "#E6F7F5",
    color: "#087F7A",
  },
  {
    name: "Appliance Repair",
    icon: Wrench,
    bg: "#FFF1E8",
    color: "#FF5A00",
  },
  {
    name: "Home Services",
    icon: Home,
    bg: "#E6F7F5",
    color: "#087F7A",
  },
  {
    name: "Sofa Cleaning",
    icon: Sofa,
    bg: "#FFF1E8",
    color: "#FF5A00",
  },
  {
    name: "Other Services",
    icon: MoreHorizontal,
    bg: "#E6F7F5",
    color: "#087F7A",
  },
];

export default function Services() {
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadServices = async () => {
      try {
        setError("");

        const data = await getServices();

        setServices(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load services."
        );
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const handleServiceSelect = (service: string) => {
    navigate(
      `/customer/search?service=${encodeURIComponent(service)}`
    );
  };

  return (
    <main className="min-h-screen w-full bg-[#F9FAFB] flex justify-center">
      <div className="relative flex min-h-screen w-full max-w-[430px] flex-col bg-[#F9FAFB]">

        {/* ================= HEADER ================= */}

        <header className="bg-white px-5 pb-5 pt-7">
          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => navigate("/customer")}
              aria-label="Go back"
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                text-[#111827]
                transition
                hover:bg-[#F3F4F6]
                active:scale-95
              "
            >
              <ArrowLeft
                size={20}
                strokeWidth={2}
              />
            </button>

            <div>
              <h1 className="text-[20px] font-bold tracking-[-0.3px] text-[#111827]">
                All Categories
              </h1>

              <p className="mt-0.5 text-[11px] text-[#6B7280]">
                Find the right service for your needs
              </p>
            </div>

          </div>
        </header>

        {/* ================= CONTENT ================= */}

        <div className="flex-1 overflow-y-auto px-5 pb-[105px]">

          {/* ================= SEARCH ================= */}

          <button
            type="button"
            onClick={() => navigate("/customer/search")}
            className="
              mt-5
              flex
              h-[48px]
              w-full
              items-center
              gap-3
              rounded-[12px]
              border
              border-[#E5E7EB]
              bg-white
              px-4
              text-left
              shadow-[0_2px_8px_rgba(0,0,0,0.03)]
            "
          >

            <Search
              size={18}
              strokeWidth={1.8}
              className="text-[#9CA3AF]"
            />

            <span className="flex-1 text-[12px] text-[#9CA3AF]">
              Search services
            </span>

            <ChevronRight
              size={16}
              className="text-[#9CA3AF]"
            />

          </button>

          {/* ================= SECTION HEADING ================= */}

          <div className="mt-7 flex items-end justify-between">

            <div>
              <h2 className="text-[16px] font-bold text-[#111827]">
                Browse Services
              </h2>

              <p className="mt-1 text-[10px] text-[#9CA3AF]">
                Choose a service to find nearby workers
              </p>
            </div>

            <span className="text-[10px] font-medium text-[#087F7A]">
              {loading
                ? "Loading..."
                : `${services.length}+ options`}
            </span>

          </div>

          {/* ================= LOADING ================= */}

          {loading && (
            <div className="mt-5 rounded-[16px] border border-[#E5E7EB] bg-white p-5 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#087F7A]" />

              <p className="mt-3 text-[11px] text-[#9CA3AF]">
                Loading services...
              </p>
            </div>
          )}

          {/* ================= ERROR ================= */}

          {error && !loading && (
            <div className="mt-5 rounded-[16px] border border-red-100 bg-red-50 p-4">
              <p className="text-[11px] font-medium text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-2 text-[10px] font-semibold text-red-700 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* ================= CATEGORY GRID ================= */}

          <div className="mt-5 grid grid-cols-3 gap-3">

            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <button
                  key={category.name}
                  type="button"
                  onClick={() =>
                    handleServiceSelect(category.name)
                  }
                  className="
                    group
                    flex
                    min-h-[112px]
                    flex-col
                    items-center
                    justify-center
                    rounded-[16px]
                    border
                    border-[#E5E7EB]
                    bg-white
                    px-2
                    py-4
                    transition-all
                    hover:-translate-y-0.5
                    hover:shadow-[0_6px_18px_rgba(0,0,0,0.06)]
                    active:scale-[0.97]
                  "
                >

                  <div
                    className="
                      flex
                      h-[46px]
                      w-[46px]
                      items-center
                      justify-center
                      rounded-[14px]
                      transition-transform
                      group-hover:scale-105
                    "
                    style={{
                      backgroundColor: category.bg,
                      color: category.color,
                    }}
                  >
                    <Icon
                      size={21}
                      strokeWidth={1.8}
                    />
                  </div>

                  <span className="mt-3 text-center text-[10px] font-semibold leading-[1.3] text-[#374151]">
                    {category.name}
                  </span>

                </button>
              );
            })}

          </div>

          {/* ================= AI SERVICE FINDER ================= */}

          <section className="mt-7">

            <button
              type="button"
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

                <Sparkles
                  size={19}
                  strokeWidth={1.8}
                  className="text-white"
                />

              </div>

              <div className="min-w-0 flex-1">

                <p className="text-[12px] font-bold text-white">
                  Not sure what you need?
                </p>

                <p className="mt-1 text-[10px] leading-4 text-white/75">
                  Let ShramiGo help you find the right worker.
                </p>

              </div>

              <ArrowRight
                size={18}
                strokeWidth={2}
                className="shrink-0 text-white"
              />

            </button>

          </section>

          {/* ================= POPULAR SERVICES ================= */}

          <section className="mt-7">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-[15px] font-bold text-[#111827]">
                  Popular Near You
                </h2>

                <p className="mt-1 text-[10px] text-[#9CA3AF]">
                  Frequently booked services
                </p>

              </div>

            </div>

            <div className="mt-4 space-y-2">

              <PopularService
                icon={Zap}
                name="Electrical Repair"
                bookings="120+ bookings this week"
                color="#FF5A00"
                bg="#FFF1E8"
                onClick={() =>
                  handleServiceSelect("Electrician")
                }
              />

              <PopularService
                icon={Droplets}
                name="Plumbing & Repairs"
                bookings="95+ bookings this week"
                color="#087F7A"
                bg="#E6F7F5"
                onClick={() =>
                  handleServiceSelect("Plumber")
                }
              />

              <PopularService
                icon={Sparkles}
                name="Home Cleaning"
                bookings="80+ bookings this week"
                color="#FF5A00"
                bg="#FFF1E8"
                onClick={() =>
                  handleServiceSelect("Cleaner")
                }
              />

            </div>

          </section>

        </div>

        {/* ================= BOTTOM NAVIGATION ================= */}

        <nav
          className="
            absolute
            bottom-0
            left-0
            right-0
            border-t
            border-[#E5E7EB]
            bg-white/95
            px-5
            pb-5
            pt-3
            backdrop-blur-sm
          "
        >

          <div className="grid grid-cols-4">

            <NavItem
              icon={Home}
              label="Home"
              onClick={() => navigate("/customer")}
            />

            <NavItem
              icon={Search}
              label="Search"
              active
              onClick={() => navigate("/customer/search")}
            />

            <NavItem
              icon={CalendarIcon}
              label="Bookings"
              onClick={() =>
                navigate("/customer/bookings")
              }
            />

            <NavItem
              icon={UserRound}
              label="Profile"
              onClick={() =>
                navigate("/customer/profile")
              }
            />

          </div>

        </nav>

      </div>
    </main>
  );
}

/* ================= POPULAR SERVICE ================= */

interface PopularServiceProps {
  icon: ElementType;
  name: string;
  bookings: string;
  color: string;
  bg: string;
  onClick: () => void;
}

function PopularService({
  icon: Icon,
  name,
  bookings,
  color,
  bg,
  onClick,
}: PopularServiceProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        w-full
        items-center
        gap-3
        rounded-[14px]
        border
        border-[#E5E7EB]
        bg-white
        p-3
        text-left
        transition
        hover:shadow-[0_4px_14px_rgba(0,0,0,0.05)]
        active:scale-[0.99]
      "
    >

      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]"
        style={{
          backgroundColor: bg,
          color,
        }}
      >
        <Icon
          size={18}
          strokeWidth={1.8}
        />
      </div>

      <div className="flex-1">

        <p className="text-[11px] font-semibold text-[#111827]">
          {name}
        </p>

        <p className="mt-1 text-[9px] text-[#9CA3AF]">
          {bookings}
        </p>

      </div>

      <ChevronRight
        size={16}
        className="text-[#9CA3AF]"
      />

    </button>
  );
}

/* ================= BOTTOM NAV ITEM ================= */

interface NavItemProps {
  icon: ElementType;
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
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1"
    >

      <Icon
        size={20}
        strokeWidth={active ? 2.2 : 1.8}
        className={
          active
            ? "text-[#FF5A00]"
            : "text-[#9CA3AF]"
        }
      />

      <span
        className={`text-[9px] font-medium ${
          active
            ? "text-[#FF5A00]"
            : "text-[#9CA3AF]"
        }`}
      >
        {label}
      </span>

    </button>
  );
}

/* ================= CALENDAR ICON ================= */

function CalendarIcon({
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
      <rect
        x="3"
        y="4"
        width="18"
        height="17"
        rx="2"
      />

      <path d="M16 2v4M8 2v4M3 10h18" />

      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  );
}