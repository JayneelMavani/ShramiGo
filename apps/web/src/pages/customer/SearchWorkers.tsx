import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Filter,
  Home,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  UserRound,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { BottomNavigation } from "../../components/navigation/BottomNavigation";

import {
  getWorkers,
  Worker,
} from "../../services/worker";

const categories = [
  "All",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Cleaner",
  "Painter",
];

export default function SearchWorkers() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const selectedService =
    searchParams.get("service") || "All";

  const displayService =
    selectedService === "All"
      ? "All Workers"
      : selectedService;

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");

  // ==================== LOAD WORKERS ====================

  useEffect(() => {
    async function loadWorkers() {
      try {
        setLoading(true);
        setError("");

        const data = await getWorkers(
          selectedService === "All"
            ? undefined
            : selectedService
        );

        setWorkers(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load workers"
        );
      } finally {
        setLoading(false);
      }
    }

    loadWorkers();
  }, [selectedService]);

  // ==================== SEARCH FILTER ====================

  const filteredWorkers = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return workers;
    }

    return workers.filter((worker) =>
      worker.name.toLowerCase().includes(query) ||
      worker.service.toLowerCase().includes(query)
    );
  }, [workers, searchText]);

  return (
    <main className="min-h-screen w-full bg-[#F7F8F8] flex justify-center">
      <div className="relative flex min-h-screen w-full max-w-[430px] flex-col bg-[#F7F8F8]">

        {/* ================= HEADER ================= */}

        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100">
          <div className="px-5 pb-4 pt-7">
          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                navigate("/customer/services")
              }
              aria-label="Go back"
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-gray-100
                text-[#111827]
                hover:bg-[#E5E7EB]
                active:scale-95
                transition
              "
            >
              <ArrowLeft size={20} />
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-[#9CA3AF]">
                Find nearby professionals
              </p>

              <h1 className="truncate text-xl font-bold text-[#111827]">
                {displayService}
              </h1>
            </div>

            <button
              aria-label="Filters"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-gray-100
                text-[#374151]
                hover:bg-[#E5E7EB]
                transition
              "
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {/* Search box */}

          <div
            className="
              mt-4
              flex
              h-[48px]
              items-center
              gap-3
              rounded-[12px]
              border
              border-[#E5E7EB]
              bg-[#F7F8F8]
              px-4
            "
          >
            <Search
              size={18}
              className="text-[#9CA3AF]"
            />

            <input
              type="text"
              value={searchText}
              onChange={(e) =>
                setSearchText(e.target.value)
              }
              placeholder="Search workers or services..."
              className="
                min-w-0
                flex-1
                bg-transparent
                text-[12px]
                text-[#111827]
                outline-none
                placeholder:text-[#9CA3AF]
              "
            />

            <button
              aria-label="Search filters"
              className="text-[#087F7A]"
            >
              <Filter size={17} />
            </button>
          </div>
          </div>
        </header>

        {/* ================= CONTENT ================= */}

        <div className="flex-1 overflow-y-auto px-5 pb-[105px]">

          {/* Category chips */}

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => {
              const active =
                category.toLowerCase() ===
                selectedService.toLowerCase();

              return (
                <button
                  key={category}
                  onClick={() => {
                    if (category === "All") {
                      navigate("/customer/search");
                    } else {
                      navigate(
                        `/customer/search?service=${encodeURIComponent(
                          category
                        )}`
                      );
                    }
                  }}
                  className={`
                    shrink-0
                    rounded-full
                    px-4
                    py-2
                    text-[10px]
                    font-semibold
                    transition
                    ${
                      active
                        ? "bg-[#FF5A00] text-white"
                        : "border border-[#E5E7EB] bg-white text-[#6B7280]"
                    }
                  `}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Results heading */}

          <div className="mt-6 flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-[#111827]">
                Nearby Workers
              </h2>

              <p className="mt-1 text-[10px] text-[#9CA3AF]">
                {loading
                  ? "Finding professionals..."
                  : `${filteredWorkers.length} professionals found`}
              </p>
            </div>

            <button className="flex items-center gap-1 text-[10px] font-medium text-[#6B7280]">
              Sort
              <ChevronDown size={13} />
            </button>
          </div>

          {/* ================= LOADING ================= */}

          {loading && (
            <div className="mt-8 rounded-[16px] border border-[#E5E7EB] bg-white p-7 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#087F7A]" />

              <p className="mt-4 text-[11px] text-[#6B7280]">
                Finding nearby workers...
              </p>
            </div>
          )}

          {/* ================= ERROR ================= */}

          {!loading && error && (
            <div className="mt-8 rounded-[16px] border border-red-100 bg-white p-7 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <UserRound
                  size={22}
                  className="text-red-500"
                />
              </div>

              <h3 className="mt-4 text-[14px] font-bold text-[#111827]">
                Unable to load workers
              </h3>

              <p className="mt-1 text-[11px] leading-5 text-[#6B7280]">
                {error}
              </p>

              <button
                onClick={() =>
                  window.location.reload()
                }
                className="
                  mt-4
                  rounded-full
                  bg-[#087F7A]
                  px-5
                  py-2
                  text-[10px]
                  font-semibold
                  text-white
                "
              >
                Try Again
              </button>
            </div>
          )}

          {/* ================= WORKER LIST ================= */}

          {!loading && !error && (
            <div className="mt-4 space-y-3">
              {filteredWorkers.map((worker) => (
                <button
                  key={worker.id}
                  onClick={() =>
                    navigate(
                      `/customer/worker/${worker.id}`
                    )
                  }
                  className="
                    w-full
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
                  <div className="flex gap-3">

                    {/* Worker photo */}

                    <div className="relative shrink-0">
                      {worker.image ? (
                        <img
                          src={worker.image}
                          alt={worker.name}
                          className="
                            h-[78px]
                            w-[78px]
                            rounded-[13px]
                            object-cover
                          "
                        />
                      ) : (
                        <div
                          className="
                            flex
                            h-[78px]
                            w-[78px]
                            items-center
                            justify-center
                            rounded-[13px]
                            bg-[#E6F7F5]
                          "
                        >
                          <UserRound
                            size={30}
                            className="text-[#087F7A]"
                          />
                        </div>
                      )}

                      {worker.verified && (
                        <div
                          className="
                            absolute
                            -bottom-1
                            -right-1
                            flex
                            h-5
                            w-5
                            items-center
                            justify-center
                            rounded-full
                            border-2
                            border-white
                            bg-[#16A34A]
                          "
                        >
                          <ShieldCheck
                            size={11}
                            className="text-white"
                          />
                        </div>
                      )}
                    </div>

                    {/* Information */}

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">

                          <h3 className="truncate text-[13px] font-bold text-[#111827]">
                            {worker.name}
                          </h3>

                          <p className="mt-0.5 text-[10px] text-[#6B7280]">
                            {worker.service}
                          </p>

                        </div>

                        {worker.verified && (
                          <span
                            className="
                              flex
                              shrink-0
                              items-center
                              gap-1
                              rounded-full
                              bg-[#E6F7F5]
                              px-2
                              py-1
                              text-[8px]
                              font-semibold
                              text-[#087F7A]
                            "
                          >
                            <CheckCircle2 size={10} />
                            Verified
                          </span>
                        )}
                      </div>

                      {/* Rating */}

                      <div className="mt-2 flex items-center gap-1.5">
                        <Star
                          size={12}
                          fill="#F59E0B"
                          className="text-[#F59E0B]"
                        />

                        <span className="text-[10px] font-bold text-[#374151]">
                          {worker.rating > 0
                            ? worker.rating.toFixed(1)
                            : "New"}
                        </span>

                        <span className="text-[9px] text-[#9CA3AF]">
                          {worker.reviews > 0
                            ? `(${worker.reviews} reviews)`
                            : "(No reviews yet)"}
                        </span>
                      </div>

                      {/* Distance + experience */}

                      <div className="mt-2 flex items-center gap-3">

                        <span className="flex items-center gap-1 text-[9px] text-[#6B7280]">
                          <MapPin size={11} />

                          {worker.distance ||
                            worker.city ||
                            "Location not set"}
                        </span>

                        <span className="text-[9px] text-[#6B7280]">
                          {worker.experience}
                        </span>

                      </div>
                    </div>
                  </div>

                  {/* Bottom row */}

                  <div className="mt-3 flex items-center justify-between border-t border-[#F3F4F6] pt-3">

                    <div className="flex items-center gap-2">

                      <span
                        className={`
                          h-1.5
                          w-1.5
                          rounded-full
                          ${
                            worker.available
                              ? "bg-[#16A34A]"
                              : "bg-[#9CA3AF]"
                          }
                        `}
                      />

                      <span
                        className={`
                          text-[9px]
                          font-medium
                          ${
                            worker.available
                              ? "text-[#16A34A]"
                              : "text-[#9CA3AF]"
                          }
                        `}
                      >
                        {worker.available
                          ? "Available now"
                          : "Currently unavailable"}
                      </span>

                    </div>

                    <div className="flex items-center gap-3">

                      <span className="text-[12px] font-bold text-[#111827]">
                        {worker.price}
                      </span>

                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFF1E8]">
                        <ChevronRight
                          size={15}
                          className="text-[#FF5A00]"
                        />
                      </span>

                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ================= NO RESULT STATE ================= */}

          {!loading &&
            !error &&
            filteredWorkers.length === 0 && (
              <div className="mt-10 rounded-[16px] border border-[#E5E7EB] bg-white p-7 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E6F7F5]">
                  <UserRound
                    size={22}
                    className="text-[#087F7A]"
                  />
                </div>

                <h3 className="mt-4 text-[14px] font-bold text-[#111827]">
                  No workers found
                </h3>

                <p className="mt-1 text-[11px] leading-5 text-[#6B7280]">
                  Try another service or search for workers nearby.
                </p>

              </div>
            )}

          {/* ================= AI MATCHING ================= */}

          <button
            onClick={() =>
              navigate("/customer/recommendations")
            }
            className="
              mt-6
              flex
              w-full
              items-center
              gap-3
              rounded-[16px]
              bg-[#087F7A]
              px-4
              py-4
              text-left
            "
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-white/15">
              <Search
                size={17}
                className="text-white"
              />
            </div>

            <div className="flex-1">
              <p className="text-[11px] font-bold text-white">
                Can't decide?
              </p>

              <p className="mt-0.5 text-[9px] text-white/75">
                Get smart recommendations based on your requirements.
              </p>
            </div>

            <ChevronRight
              size={17}
              className="text-white"
            />
          </button>
        </div>

        <BottomNavigation role="customer" />
      </div>
    </main>
  );
}
