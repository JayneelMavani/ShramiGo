import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  MapPin,
  Star,
  Clock,
  IndianRupee,
  ChevronRight,
  SlidersHorizontal,
  CheckCircle2,
  Loader2,
  Search,
} from "lucide-react";
import { getAIRecommendations, AIRecommendationWorker } from "../../services/ai";
import { getServices, Service } from "../../services/services";
import { ApiError } from "../../services/api";

export default function AIRecommendation() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [service, setService] = useState("Any Service");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("Any Budget");
  const [showFilters, setShowFilters] = useState(false);
  const [workers, setWorkers] = useState<AIRecommendationWorker[]>([]);
  const [detectedService, setDetectedService] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationLabel, setLocationLabel] = useState("Use current location");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getServices()
      .then(setServices)
      .catch(() => setServices([]));
  }, []);

  const budgetLimit = useMemo(() => {
    if (budget === "Under ₹300") return 300;
    if (budget === "Under ₹500") return 500;
    return undefined;
  }, [budget]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Your browser does not support location access.");
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationLabel("Current location ready");
        setLocationLoading(false);
      },
      (geoError) => {
        setLocationLoading(false);
        setError(
          geoError.code === geoError.PERMISSION_DENIED
            ? "Location permission was denied. You can still search without location."
            : "Could not get your current location. You can still search without location."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const findMatches = async () => {
    if (!description.trim() && service === "Any Service") {
      setError("Describe what you need or choose a service first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await getAIRecommendations({
        description: description.trim(),
        service: service === "Any Service" ? undefined : service,
        max_price: budgetLimit,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        limit: 5,
      });

      setWorkers(result.workers);
      setDetectedService(result.detected_service);
      setConfidence(result.confidence);
      setExplanation(result.explanation);
    } catch (requestError) {
      const message =
        requestError instanceof ApiError
          ? requestError.message
          : "Could not generate recommendations. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (distance: number | null) =>
    distance === null ? "Location not available" : `${distance.toFixed(1)} km`;

  const formatPrice = (price: number) => Math.round(price).toLocaleString("en-IN");

  return (
    <div className="min-h-screen bg-[#F7F8F8] text-[#171717]">
      <div className="mx-auto min-h-screen max-w-[430px] bg-white shadow-sm">
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F8F8]"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="text-center">
            <h1 className="text-lg font-bold">AI Recommendations</h1>
            <p className="text-[11px] text-gray-500">Find the right worker for you</p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F8F8]"
            aria-label="Toggle filters"
          >
            <SlidersHorizontal size={19} />
          </button>
        </header>

        <main className="px-5 pb-8 pt-5">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#087F7A] to-[#075E5A] p-5 text-white">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-5 h-24 w-24 rounded-full bg-white/10" />
            <div className="relative">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                  <Sparkles size={23} />
                </div>
                <div>
                  <p className="text-xs font-medium text-white/75">Powered by AI</p>
                  <h2 className="text-lg font-bold">Smart Worker Match</h2>
                </div>
              </div>
              <p className="text-sm leading-5 text-white/85">
                Describe your problem and ShramiGo identifies the service and ranks suitable workers using skills, location, availability, rating, experience and price.
              </p>
            </div>
          </section>

          <section className="mt-5 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-bold">Tell us what you need</h3>

            <label className="mb-2 block text-xs font-medium text-gray-500">Describe your problem</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Example: My kitchen tap is leaking and needs repair"
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 bg-[#F9FAFA] px-4 py-3 text-sm outline-none focus:border-[#FF5A00]"
            />

            <div className="mt-4">
              <label className="mb-2 block text-xs font-medium text-gray-500">Service</label>
              <select
                value={service}
                onChange={(event) => setService(event.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-[#F9FAFA] px-4 py-3 text-sm font-medium outline-none focus:border-[#FF5A00]"
              >
                <option>Any Service</option>
                {services.map((item) => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-medium text-gray-500">Location</label>
              <button
                onClick={useCurrentLocation}
                disabled={locationLoading}
                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-[#F9FAFA] px-4 py-3 text-left disabled:opacity-70"
              >
                {locationLoading ? (
                  <Loader2 size={18} className="animate-spin text-[#FF5A00]" />
                ) : (
                  <MapPin size={18} className="text-[#FF5A00]" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{locationLabel}</p>
                  <p className="text-[11px] text-gray-400">Improves nearby-worker ranking</p>
                </div>
                <ChevronRight size={17} className="text-gray-400" />
              </button>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-medium text-gray-500">Budget</label>
              <div className="grid grid-cols-3 gap-2">
                {["Any Budget", "Under ₹300", "Under ₹500"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setBudget(item)}
                    className={`rounded-xl px-2 py-2.5 text-[11px] font-semibold transition ${
                      budget === item ? "bg-[#FF5A00] text-white" : "bg-[#F7F8F8] text-gray-600"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={findMatches}
              disabled={loading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A00] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#e84f00] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              {loading ? "Finding best matches..." : "Find AI Matches"}
            </button>

            {error && <p className="mt-3 text-xs leading-4 text-red-600">{error}</p>}
          </section>

          {showFilters && (
            <section className="mt-4 rounded-2xl bg-[#FFF7F2] p-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={17} className="text-[#FF5A00]" />
                <p className="text-sm font-bold">AI ranking factors</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-2 text-xs text-gray-600">⭐ Rating</span>
                <span className="rounded-full bg-white px-3 py-2 text-xs text-gray-600">📍 Distance</span>
                <span className="rounded-full bg-white px-3 py-2 text-xs text-gray-600">✓ Availability</span>
                <span className="rounded-full bg-white px-3 py-2 text-xs text-gray-600">₹ Price</span>
                <span className="rounded-full bg-white px-3 py-2 text-xs text-gray-600">🛠 Experience</span>
              </div>
            </section>
          )}

          {(detectedService || workers.length > 0) && (
            <section className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold">Recommended for you</h3>
                  <p className="mt-1 text-xs text-gray-500">{explanation}</p>
                </div>
                <span className="rounded-full bg-[#E9F7F6] px-3 py-1.5 text-[10px] font-bold text-[#087F7A]">
                  {workers.length} Matches
                </span>
              </div>

              {detectedService && (
                <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[#F0FAF9] p-3">
                  <Sparkles size={18} className="text-[#087F7A]" />
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#087F7A]">AI detected service</p>
                    <p className="text-sm font-bold">{detectedService}</p>
                  </div>
                  <span className="text-xs font-bold text-[#087F7A]">{confidence}%</span>
                </div>
              )}

              <div className="space-y-4">
                {workers.length > 0 ? workers.map((worker, index) => (
                  <button
                    key={`${worker.id}-${worker.service}`}
                    onClick={() => navigate(`/customer/worker/${worker.id}`, { state: { worker } })}
                    className="w-full rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:border-[#FF5A00]/30"
                  >
                    <div className="flex gap-3">
                      <div className="relative">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#FFF0E6] text-lg font-bold text-[#FF5A00]">
                          {worker.image ? (
                            <img src={worker.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            worker.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="absolute -right-1 -top-1 rounded-full bg-[#087F7A] px-1.5 py-0.5 text-[8px] font-bold text-white">
                          {index === 0 ? "BEST" : "AI"}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-bold">{worker.name}</h4>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {worker.service} • {worker.experience_years} years experience
                            </p>
                          </div>
                          <ChevronRight size={17} className="text-gray-400" />
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1 text-xs font-semibold">
                            <Star size={13} fill="currentColor" className="text-[#FFB000]" />
                            {worker.rating.toFixed(1)}
                            <span className="font-normal text-gray-400">({worker.reviews})</span>
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin size={13} /> {formatDistance(worker.distance_km)}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm font-bold">
                            <IndianRupee size={14} />{formatPrice(worker.price)}
                            <span className="text-[10px] font-normal text-gray-400">/hr</span>
                          </div>
                          <span className={`flex items-center gap-1 text-[10px] font-semibold ${worker.available ? "text-[#087F7A]" : "text-gray-400"}`}>
                            <Clock size={12} /> {worker.available ? "Available" : "Check availability"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[#F0FAF9] px-3 py-2">
                      <div className="flex min-w-0 flex-wrap gap-1.5">
                        {worker.match_reasons.map((reason) => (
                          <span key={reason} className="rounded-full bg-white px-2 py-1 text-[9px] font-medium text-[#087F7A]">
                            {reason}
                          </span>
                        ))}
                      </div>
                      <span className="shrink-0 text-sm font-extrabold text-[#087F7A]">{worker.match_score}%</span>
                    </div>
                  </button>
                )) : (
                  <div className="rounded-2xl bg-[#F7F8F8] p-8 text-center">
                    <Sparkles size={30} className="mx-auto text-[#087F7A]" />
                    <p className="mt-3 text-sm font-semibold">No suitable workers found</p>
                    <p className="mt-1 text-xs text-gray-500">Try a different service or increase your budget.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="mt-6 flex gap-3 rounded-2xl bg-[#FFF7F2] p-4">
            <Sparkles size={18} className="mt-0.5 shrink-0 text-[#FF5A00]" />
            <div>
              <p className="text-xs font-bold text-[#171717]">How the AI match works</p>
              <p className="mt-1 text-[11px] leading-4 text-gray-500">
                Your request is classified into a service, then eligible workers are ranked using service fit, availability, rating, experience, distance and price. It does not change worker prices automatically.
              </p>
            </div>
          </section>

          <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-gray-400">
            <CheckCircle2 size={12} className="text-[#087F7A]" />
            Recommendations use ShramiGo platform data
          </div>
        </main>
      </div>
    </div>
  );
}
