import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  CalendarDays,
  Clock3,
  MapPin,
  ArrowRight,
  Home,
} from "lucide-react";

import type { Booking } from "../../services/bookings";
import type { WorkerDetails } from "../../services/worker";

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as {
    booking?: Booking;
    worker?: WorkerDetails;
    selectedDate?: string;
    selectedTime?: string;
    hours?: number;
    address?: string;
    subtotal?: number;
    serviceCharge?: number;
    total?: number;
    paymentMethod?: string;
  } | null;

  // If someone lands here without booking data, redirect
  useEffect(() => {
    if (!state?.booking) {
      navigate("/customer/bookings", { replace: true });
    }
  }, [state, navigate]);

  if (!state?.booking) {
    return null;
  }

  const booking = state.booking;
  const worker = state.worker;

  const workerName = worker?.name ?? "Service Provider";
  const workerImage =
    worker?.profile?.profile_image ??
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80";
  const serviceName =
    worker?.services?.[0]?.name ?? "Professional Service";

  const bookingId = booking.id;
  const selectedDate = state.selectedDate ?? String(booking.booking_date);
  const selectedTime = state.selectedTime ?? String(booking.booking_time);
  const hours = state.hours ?? booking.hours;
  const address = state.address ?? booking.service_address;
  const subtotal = booking.subtotal;
  const serviceCharge = booking.service_charge;
  const total = booking.total_amount;

  return (
    <div className="min-h-screen bg-[#F7F8F8] flex justify-center">
      <main className="w-full max-w-[430px] min-h-screen bg-white shadow-sm">

        {/* Header */}
        <header className="h-16 px-5 flex items-center justify-center border-b border-gray-100">
          <h1 className="text-[17px] font-bold text-gray-900">
            Booking Confirmation
          </h1>
        </header>

        <div className="px-5 pt-8 pb-8">

          {/* Success */}
          <section className="text-center">
            <div className="w-[76px] h-[76px] rounded-full bg-[#EAF7F5] flex items-center justify-center mx-auto">
              <CheckCircle2
                size={48}
                className="text-[#087F7A]"
                strokeWidth={2}
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-5">
              Booking Confirmed!
            </h2>

            <p className="text-sm text-gray-500 mt-2 leading-5">
              Your service has been successfully booked.
              The worker has been notified.
            </p>
          </section>

          {/* Booking ID */}
          <div className="mt-6 rounded-xl bg-[#FFF5EF] border border-[#FFE2D1] px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gray-500">Booking ID</p>

              <p className="text-sm font-bold text-gray-900 mt-1">
                #{bookingId}
              </p>
            </div>

            <span className="px-3 py-1.5 rounded-full bg-[#FF5A00] text-white text-[11px] font-bold">
              Confirmed
            </span>
          </div>

          {/* Worker */}
          <section className="mt-7">
            <h3 className="text-[16px] font-bold text-gray-900">
              Service Provider
            </h3>

            <div className="mt-3 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <img
                  src={workerImage}
                  alt={workerName}
                  className="w-16 h-16 rounded-xl object-cover"
                />

                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-gray-900">
                      {workerName}
                    </h4>

                    {worker?.verified && (
                      <CheckCircle2
                        size={16}
                        className="text-[#087F7A]"
                      />
                    )}
                  </div>

                  <p className="text-sm text-[#087F7A] mt-1">
                    {serviceName}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Your trusted ShramiGo worker
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Appointment Details */}
          <section className="mt-7">
            <h3 className="text-[16px] font-bold text-gray-900">
              Appointment Details
            </h3>

            <div className="mt-3 space-y-3">
              <InfoRow
                icon={<CalendarDays size={19} />}
                title="Date"
                value={selectedDate}
              />

              <InfoRow
                icon={<Clock3 size={19} />}
                title="Time"
                value={selectedTime}
              />

              <InfoRow
                icon={<MapPin size={19} />}
                title="Service Address"
                value={address}
              />
            </div>
          </section>

          {/* Payment */}
          <section className="mt-7">
            <h3 className="text-[16px] font-bold text-gray-900">
              Payment Summary
            </h3>

            <div className="mt-3 rounded-2xl bg-[#F8FAFA] p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Service ({hours} hour{hours > 1 ? "s" : ""})
                </span>

                <span className="text-gray-900 font-medium">
                  ₹{subtotal}
                </span>
              </div>

              <div className="flex justify-between text-sm mt-3">
                <span className="text-gray-500">Service charge</span>

                <span className="text-gray-900 font-medium">
                  ₹{serviceCharge}
                </span>
              </div>

              <div className="border-t border-gray-200 my-4" />

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900 text-sm block">
                    {booking.payment_status === "paid"
                      ? "Total Paid"
                      : "Total Amount"}
                  </span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    {booking.payment_status === "paid"
                      ? "Payment completed"
                      : booking.payment_method === "cash"
                        ? "Pay cash after service completion"
                        : "Online payment pending"}
                  </span>
                </div>

                <span className="text-lg font-bold text-[#FF5A00]">
                  ₹{total}
                </span>
              </div>
            </div>
          </section>

          {/* Status */}
          <div className="mt-6 rounded-xl bg-[#EAF7F5] border border-[#D5EFEB] p-4">
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#087F7A] mt-1.5" />

              <div>
                <p className="text-sm font-bold text-gray-900">
                  Worker has been notified
                </p>

                <p className="text-xs text-gray-500 mt-1 leading-5">
                  You will receive an update when the worker
                  accepts your booking.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-7 space-y-3">
            <button
              onClick={() =>
                navigate("/customer/booking-tracking", {
                  state: { booking },
                })
              }
              className="w-full h-12 rounded-xl bg-[#FF5A00] text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              Track Booking
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => navigate("/customer")}
              className="w-full h-12 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              <Home size={17} />
              Back to Home
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoRow({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50">
      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#087F7A]">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-500">{title}</p>

        <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}