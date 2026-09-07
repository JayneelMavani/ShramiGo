import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  LocateFixed,
  Minus,
  Plus,
  ShieldCheck,
} from "lucide-react";

import {
  getWorker,
  type WorkerDetails,
} from "../../services/worker";

import {
  createBooking,
} from "../../services/bookings";

type BookingDate = {
  day: string;
  date: string;
  value: string;
};

const times = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "04:00 PM",
];

function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDates(): BookingDate[] {
  const dates: BookingDate[] = [];

  for (let i = 0; i < 4; i++) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + i);

    dates.push({
      day: i === 0
        ? "Today"
        : date.toLocaleDateString("en-US", {
            weekday: "short",
          }),
      date: String(date.getDate()),
      value: formatDateForApi(date),
    });
  }

  return dates;
}

function convertTimeToApi(time: string): string {
  const [timePart, period] = time.split(" ");
  let hours = Number(timePart.split(":")[0]);
  const minutes = Number(timePart.split(":")[1]);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:00`;
}

export default function BookService() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [worker, setWorker] = useState<WorkerDetails | null>(null);

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");

  const dates = getDates();

  const [selectedDate, setSelectedDate] = useState(
    dates[0].value
  );

  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [hours, setHours] = useState(1);
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function loadWorker() {
      if (!id) {
        setError("Worker not found.");
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
            : "Failed to load worker."
        );
      } finally {
        setLoading(false);
      }
    }

    loadWorker();
  }, [id]);

  const selectedService = worker?.services?.find(
    (service) => service.service_id === selectedServiceId
  ) ?? null;

  const workerPrice = selectedService?.price ?? 0;

  const serviceCharge = 30;

  const subtotal = workerPrice * hours;

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Current location is not supported by this browser. Please enter your address manually.");
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=18&addressdetails=1&accept-language=en`
          );

          if (!response.ok) {
            throw new Error("Unable to find the address for your location.");
          }

          const data = await response.json();
          const addressParts = data.address ?? {};
          const line1 = [
            addressParts.house_number,
            addressParts.road,
          ].filter(Boolean).join(" ");

          const locality = [
            addressParts.neighbourhood,
            addressParts.suburb,
            addressParts.village || addressParts.town || addressParts.city,
          ].filter(Boolean).join(", ");

          const stateAndPin = [
            addressParts.state,
            addressParts.postcode,
          ].filter(Boolean).join(" - ");

          const formattedAddress = [
            line1,
            locality,
            stateAndPin,
            addressParts.country,
          ].filter(Boolean).join(", ");

          const finalAddress = formattedAddress || data.display_name;

          if (!finalAddress) {
            throw new Error("We could not determine a readable address. Please enter it manually.");
          }

          setAddress(finalAddress);
        } catch (reverseGeocodeError) {
          setError(
            reverseGeocodeError instanceof Error
              ? reverseGeocodeError.message
              : "Unable to convert your location into an address. Please enter it manually."
          );
        } finally {
          setLocationLoading(false);
        }
      },
      (geolocationError) => {
        let message = "Unable to access your current location. Please enter your address manually.";

        if (geolocationError.code === geolocationError.PERMISSION_DENIED) {
          message = "Location permission was denied. Please allow location access in your browser and try again.";
        } else if (geolocationError.code === geolocationError.POSITION_UNAVAILABLE) {
          message = "Your current location is unavailable. Please try again or enter the address manually.";
        } else if (geolocationError.code === geolocationError.TIMEOUT) {
          message = "Location request timed out. Please try again.";
        }

        setError(message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  const total = subtotal + serviceCharge;

  const handleContinue = async () => {
    if (!worker) {
      return;
    }

    if (!address.trim()) {
      return;
    }

    if (!selectedService) {
      setError("Select a service before continuing.");
      return;
    }

    try {
      setBookingLoading(true);
      setError("");

      const booking = await createBooking({
        worker_id: worker.id,
        service_id: selectedService.service_id,
        booking_date: selectedDate,
        booking_time: convertTimeToApi(selectedTime),
        hours,
        service_address: address.trim(),
        description: description.trim() || undefined,
      });

      navigate(`/customer/payment/${booking.id}`, {
        state: {
          booking,
          worker,
          selectedDate,
          selectedTime,
          hours,
          address,
          description,
          subtotal: booking.subtotal,
          serviceCharge: booking.service_charge,
          total: booking.total_amount,
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create booking."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8F8] flex justify-center">
        <main className="w-full max-w-[430px] min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#087F7A] border-t-transparent rounded-full animate-spin mx-auto" />

            <p className="text-sm text-gray-500 mt-3">
              Loading worker...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !worker) {
    return (
      <div className="min-h-screen bg-[#F7F8F8] flex justify-center">
        <main className="w-full max-w-[430px] min-h-screen bg-white">
          <header className="h-16 bg-white border-b border-gray-100">
            <div className="h-full px-5 flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <ArrowLeft size={20} />
              </button>

              <h1 className="text-[17px] font-bold text-gray-900 ml-4">
                Book Service
              </h1>
            </div>
          </header>

          <div className="px-5 pt-10 text-center">
            <p className="text-sm text-red-500">
              {error}
            </p>

            <button
              onClick={() => navigate(-1)}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#087F7A] text-white text-sm font-semibold"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!worker) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F7F8F8] flex justify-center">
      <main className="w-full max-w-[430px] min-h-screen bg-white relative pb-[190px] shadow-sm">

        {/* ================= HEADER ================= */}

        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-gray-100">
          <div className="h-full px-5 flex items-center justify-between">

            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition"
              aria-label="Go back"
            >
              <ArrowLeft
                size={20}
                className="text-gray-800"
              />
            </button>

            <h1 className="text-[17px] font-bold text-gray-900">
              Book Service
            </h1>

            <div className="w-10" />

          </div>
        </header>

        {/* ================= CONTENT ================= */}

        <div className="px-5 pt-5">

          <label className="mt-5 block text-sm font-semibold text-gray-800">
            Select service
            <select
              value={selectedServiceId ?? ""}
              onChange={(event) => setSelectedServiceId(Number(event.target.value) || null)}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
            >
              <option value="">Choose a service</option>
              {worker?.services?.map((service) => (
                <option key={service.service_id} value={service.service_id}>
                  {service.name} - ₹{service.price}/hr
                </option>
              ))}
            </select>
          </label>

          {/* ================= WORKER CARD ================= */}

          <section>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

              <div className="flex items-center gap-3">

                <img
                  src={
                    worker.profile.profile_image ||
                    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80"
                  }
                  alt={worker.name}
                  className="w-[68px] h-[68px] rounded-xl object-cover"
                />

                <div className="flex-1 min-w-0">

                  <div className="flex items-center gap-1.5">

                    <h2 className="text-[16px] font-bold text-gray-900 truncate">
                      {worker.name}
                    </h2>

                    {worker.verified && (
                      <CheckCircle2
                        size={17}
                        className="text-[#087F7A] shrink-0"
                      />
                    )}

                  </div>

                  <p className="text-sm text-[#087F7A] mt-1">
                    {selectedService?.name ||
                      worker.skills?.[0]?.skill_name ||
                      "Professional Service"}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5">

                    <span className="text-xs font-semibold text-gray-700">
                      ★ {worker.rating || 0}
                    </span>

                    <span className="text-xs text-gray-400">
                      ({worker.reviews || 0} reviews)
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* ================= DATE ================= */}

          <section className="mt-7">

            <div className="flex items-center gap-2">

              <CalendarDays
                size={19}
                className="text-[#FF5A00]"
              />

              <h3 className="text-[16px] font-bold text-gray-900">
                Select Date
              </h3>

            </div>

            <div className="grid grid-cols-4 gap-2.5 mt-3">

              {dates.map((item) => {

                const isSelected =
                  selectedDate === item.value;

                return (
                  <button
                    key={item.value}
                    onClick={() =>
                      setSelectedDate(item.value)
                    }
                    className={`rounded-xl py-3 border transition active:scale-[0.98] ${
                      isSelected
                        ? "bg-[#FF5A00] border-[#FF5A00] text-white shadow-sm"
                        : "bg-white border-gray-200 text-gray-700"
                    }`}
                  >

                    <p className="text-[11px] font-medium">
                      {item.day}
                    </p>

                    <p className="text-[19px] font-bold mt-0.5">
                      {item.date}
                    </p>

                  </button>
                );
              })}

            </div>

          </section>

          {/* ================= TIME ================= */}

          <section className="mt-7">

            <div className="flex items-center gap-2">

              <Clock3
                size={19}
                className="text-[#FF5A00]"
              />

              <h3 className="text-[16px] font-bold text-gray-900">
                Select Time
              </h3>

            </div>

            <div className="grid grid-cols-3 gap-2.5 mt-3">

              {times.map((time) => {

                const isSelected =
                  selectedTime === time;

                return (
                  <button
                    key={time}
                    onClick={() =>
                      setSelectedTime(time)
                    }
                    className={`py-2.5 rounded-xl border text-xs font-semibold transition active:scale-[0.98] ${
                      isSelected
                        ? "bg-[#087F7A] border-[#087F7A] text-white"
                        : "bg-white border-gray-200 text-gray-700"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}

            </div>

          </section>

          {/* ================= DURATION ================= */}

          <section className="mt-7">

            <h3 className="text-[16px] font-bold text-gray-900">
              Service Duration
            </h3>

            <div className="mt-3 rounded-xl border border-gray-200 px-4 py-3.5 flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold text-gray-900">
                  Number of hours
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  ₹{workerPrice} per hour
                </p>

              </div>

              <div className="flex items-center gap-3">

                <button
                  onClick={() =>
                    setHours((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center active:scale-95"
                >
                  <Minus size={15} />
                </button>

                <span className="w-5 text-center text-sm font-bold text-gray-900">
                  {hours}
                </span>

                <button
                  onClick={() =>
                    setHours((current) => current + 1)
                  }
                  className="w-8 h-8 rounded-lg bg-[#FFF1E9] text-[#FF5A00] flex items-center justify-center active:scale-95"
                >
                  <Plus size={15} />
                </button>

              </div>

            </div>

          </section>

          {/* ================= ADDRESS ================= */}

          <section className="mt-7">

            <div className="flex items-center gap-2">

              <MapPin
                size={19}
                className="text-[#FF5A00]"
              />

              <h3 className="text-[16px] font-bold text-gray-900">
                Service Address
              </h3>

            </div>

            <div className="relative mt-3">

              <textarea
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                placeholder="Enter your complete service address"
                rows={3}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none resize-none focus:border-[#087F7A] focus:ring-1 focus:ring-[#087F7A]"
              />

            </div>

            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={locationLoading}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#087F7A] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LocateFixed size={14} />
              {locationLoading ? "Getting your location..." : "Use current location"}
            </button>

          </section>

          {/* ================= REQUIREMENT ================= */}

          <section className="mt-7">

            <h3 className="text-[16px] font-bold text-gray-900">
              Describe Your Requirement

              <span className="ml-1 text-xs font-normal text-gray-400">
                (Optional)
              </span>

            </h3>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Tell the worker what you need help with..."
              rows={3}
              className="w-full mt-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none resize-none focus:border-[#087F7A] focus:ring-1 focus:ring-[#087F7A]"
            />

          </section>

          {/* ================= ERROR ================= */}

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-xs text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* ================= TRUST ================= */}

          <section className="mt-6">

            <div className="rounded-xl bg-[#EAF7F5] border border-[#D5EFEB] p-3.5 flex items-start gap-3">

              <ShieldCheck
                size={21}
                className="text-[#087F7A] shrink-0 mt-0.5"
              />

              <div>

                <p className="text-sm font-semibold text-gray-900">
                  Safe & Secure Booking
                </p>

                <p className="text-xs text-gray-500 leading-5 mt-0.5">
                  Your payment is protected until the service
                  is completed.
                </p>

              </div>

            </div>

          </section>

        </div>

        {/* ================= BOTTOM SUMMARY ================= */}

        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">

          <div className="max-w-[430px] mx-auto px-5 py-3">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[11px] text-gray-500">
                  Estimated Total
                </p>

                <p className="text-xl font-bold text-gray-900">
                  ₹{total}
                </p>

              </div>

              <div className="text-right">

                <p className="text-xs text-gray-600">
                  {hours} hour{hours > 1 ? "s" : ""}
                </p>

                <p className="text-[11px] text-gray-400 mt-0.5">
                  ₹{workerPrice}/hr + ₹{serviceCharge} service
                </p>

              </div>

            </div>

            <button
              onClick={handleContinue}
              disabled={
                !address.trim() ||
                bookingLoading ||
                !selectedService
              }
              className="w-full h-12 mt-3 rounded-xl bg-[#FF5A00] text-white text-sm font-bold shadow-lg shadow-orange-100 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed active:scale-[0.98] transition"
            >
              {bookingLoading
                ? "Creating Booking..."
                : "Continue to Payment"}
            </button>

          </div>

        </div>

      </main>
    </div>
  );
}