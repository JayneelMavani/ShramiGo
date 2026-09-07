import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  Star,
} from "lucide-react";
import {
  getWorker,
  type WorkerDetails as ApiWorkerDetails,
} from "../../services/worker";

export default function WorkerDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [worker, setWorker] = useState<ApiWorkerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWorker() {
      if (!id) {
        setError("Worker ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getWorker(Number(id));
        setWorker(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load worker details."
        );
      } finally {
        setLoading(false);
      }
    }

    loadWorker();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8F8] flex justify-center">
        <main className="w-full max-w-[430px] min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#087F7A] rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500 mt-4">
              Loading worker details...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="min-h-screen bg-[#F7F8F8] flex justify-center">
        <main className="w-full max-w-[430px] min-h-screen bg-white">
          <div className="h-16 px-5 flex items-center border-b border-gray-100">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <ArrowLeft size={20} className="text-gray-800" />
            </button>

            <h1 className="text-[17px] font-bold text-gray-900 ml-auto mr-auto">
              Worker Details
            </h1>

            <div className="w-10" />
          </div>

          <div className="px-5 pt-20 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <span className="text-2xl">!</span>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mt-4">
              Worker Not Found
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              {error || "Unable to load worker details."}
            </p>

            <button
              onClick={() => navigate(-1)}
              className="mt-6 px-6 py-3 rounded-xl bg-[#FF5A00] text-white font-semibold text-sm"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  const primaryService =
    worker.services.length > 0
      ? worker.services[0].name
      : "Professional Worker";

  const primaryPrice =
    worker.services.length > 0
      ? worker.services[0].price
      : 0;

  const experience = `${worker.profile.experience_years} years`;

  const availableText = worker.available
    ? "Available Today"
    : "Currently Unavailable";

  const distance = "Nearby";

  const skills = [
    ...worker.skills.map((skill) => skill.skill_name),
    ...worker.services.map((service) => service.name),
  ].filter(
    (value, index, array) => array.indexOf(value) === index
  );

  return (
    <div className="min-h-screen bg-[#F7F8F8] flex justify-center">
      <main className="w-full max-w-[430px] min-h-screen bg-white relative pb-28 shadow-sm">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-100">
          <div className="h-16 px-5 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition"
            >
              <ArrowLeft size={20} className="text-gray-800" />
            </button>

            <h1 className="text-[17px] font-bold text-gray-900">
              Worker Details
            </h1>

            <button
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              aria-label="Message worker"
            >
              <MessageCircle size={19} className="text-[#087F7A]" />
            </button>
          </div>
        </div>

        {/* Worker Profile */}
        <section className="px-5 pt-6">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              {worker.profile.profile_image ? (
                <img
                  src={worker.profile.profile_image}
                  alt={worker.name}
                  className="w-[92px] h-[92px] rounded-2xl object-cover"
                />
              ) : (
                <div className="w-[92px] h-[92px] rounded-2xl bg-[#EAF7F5] flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#087F7A]">
                    {worker.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {worker.verified && (
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow">
                  <BadgeCheck
                    size={23}
                    fill="#087F7A"
                    className="text-white"
                  />
                </div>
              )}
            </div>

            <div className="pt-1 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-bold text-gray-900">
                  {worker.name}
                </h2>
              </div>

              <p className="text-[#087F7A] font-medium text-sm mt-1">
                {primaryService}
              </p>

              <div className="flex items-center gap-1 mt-2">
                <Star
                  size={16}
                  fill="#FFB800"
                  className="text-[#FFB800]"
                />

                <span className="font-bold text-gray-900 text-sm">
                  {worker.rating > 0 ? worker.rating : "New"}
                </span>

                <span className="text-gray-500 text-sm">
                  ({worker.reviews} reviews)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Info */}
        <section className="px-5 mt-6">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#F8FAFA] rounded-xl p-3 text-center">
              <MapPin
                size={19}
                className="mx-auto text-[#087F7A]"
              />

              <p className="text-gray-900 text-sm font-semibold mt-1.5">
                {distance}
              </p>

              <p className="text-[11px] text-gray-500">
                Location
              </p>
            </div>

            <div className="bg-[#F8FAFA] rounded-xl p-3 text-center">
              <CalendarDays
                size={19}
                className="mx-auto text-[#087F7A]"
              />

              <p className="text-gray-900 text-sm font-semibold mt-1.5">
                {experience}
              </p>

              <p className="text-[11px] text-gray-500">
                Experience
              </p>
            </div>

            <div className="bg-[#FFF7F2] rounded-xl p-3 text-center">
              <Clock3
                size={19}
                className="mx-auto text-[#FF5A00]"
              />

              <p className="text-gray-900 text-sm font-semibold mt-1.5">
                ₹{primaryPrice}
              </p>

              <p className="text-[11px] text-gray-500">
                Per hour
              </p>
            </div>
          </div>
        </section>

        {/* Availability */}
        <section className="px-5 mt-6">
          <div
            className={`flex items-center justify-between rounded-xl px-4 py-3.5 ${
              worker.available
                ? "bg-[#EAF7F5] border border-[#D5EFEB]"
                : "bg-gray-50 border border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2
                size={20}
                className={
                  worker.available
                    ? "text-[#087F7A]"
                    : "text-gray-400"
                }
              />

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {availableText}
                </p>

                <p className="text-xs text-gray-500 mt-0.5">
                  {worker.available
                    ? "Usually responds within 10 minutes"
                    : "Check availability before booking"}
                </p>
              </div>
            </div>

            <span
              className={`w-2.5 h-2.5 rounded-full ${
                worker.available
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            />
          </div>
        </section>

        {/* About */}
        <section className="px-5 mt-7">
          <h3 className="text-[17px] font-bold text-gray-900">
            About
          </h3>

          <p className="text-sm leading-6 text-gray-600 mt-2">
            {worker.profile.bio ||
              `${worker.name} is a professional service worker offering reliable home services.`}
          </p>
        </section>

        {/* Location */}
        {(worker.profile.city || worker.profile.state) && (
          <section className="px-5 mt-7">
            <h3 className="text-[17px] font-bold text-gray-900">
              Service Location
            </h3>

            <div className="flex items-center gap-2 mt-3">
              <MapPin
                size={18}
                className="text-[#087F7A]"
              />

              <p className="text-sm text-gray-600">
                {[
                  worker.profile.city,
                  worker.profile.state,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </section>
        )}

        {/* Services & Skills */}
        <section className="px-5 mt-7">
          <h3 className="text-[17px] font-bold text-gray-900">
            Services & Skills
          </h3>

          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3.5 py-2 rounded-full bg-gray-100 text-gray-700 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-3">
              No skills added yet.
            </p>
          )}
        </section>

        {/* Services Pricing */}
        {worker.services.length > 0 && (
          <section className="px-5 mt-7">
            <h3 className="text-[17px] font-bold text-gray-900">
              Service Pricing
            </h3>

            <div className="mt-3 space-y-2">
              {worker.services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFA]"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {service.name}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {service.category}
                    </p>
                  </div>

                  <p className="text-sm font-bold text-[#FF5A00]">
                    ₹{service.price}/hr
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="px-5 mt-7">
          <div className="flex items-center justify-between">
            <h3 className="text-[17px] font-bold text-gray-900">
              Customer Reviews
            </h3>

            <button className="text-[#087F7A] text-sm font-semibold">
              View All
            </button>
          </div>

          {worker.reviews > 0 ? (
            <div className="mt-3 p-4 border border-gray-100 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    Customer Review
                  </p>

                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={13}
                        fill="#FFB800"
                        className="text-[#FFB800]"
                      />
                    ))}
                  </div>
                </div>

                <span className="text-xs text-gray-400">
                  Recent
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-5 mt-3">
                Customers have rated this worker's services.
              </p>
            </div>
          ) : (
            <div className="mt-3 p-4 border border-gray-100 rounded-2xl">
              <p className="text-sm font-semibold text-gray-900">
                No reviews yet
              </p>

              <p className="text-xs text-gray-500 leading-5 mt-2">
                Reviews will appear here after customers complete
                bookings and rate the worker.
              </p>
            </div>
          )}
        </section>

        {/* Sticky Bottom Booking */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200">
          <div className="max-w-[430px] mx-auto px-5 py-3 flex gap-3">
            <button
              onClick={() => {
                if (worker.phone) {
                  window.location.href = `tel:${worker.phone}`;
                }
              }}
              className="w-12 h-12 shrink-0 rounded-xl border border-[#087F7A] text-[#087F7A] flex items-center justify-center"
              aria-label="Call worker"
            >
              <Phone size={20} />
            </button>

            <button
              disabled={!worker.available}
              onClick={() =>
                navigate(
                  `/customer/book-service/${worker.id}`
                )
              }
              className={`flex-1 h-12 rounded-xl text-white font-bold text-sm shadow-lg active:scale-[0.98] transition ${
                worker.available
                  ? "bg-[#FF5A00] shadow-orange-100"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {worker.available
                ? `Book Now · ₹${primaryPrice}/hr`
                : "Currently Unavailable"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}