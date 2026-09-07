import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  IndianRupee,
  MapPin,
  Printer,
  Share2,
  User,
} from "lucide-react";

import type { Booking } from "../../services/bookings";
import { getWorker, type WorkerDetails } from "../../services/worker";

export default function Invoice() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as {
    booking?: Booking;
    worker?: WorkerDetails;
  } | null;

  const booking = state?.booking;
  const [worker, setWorker] = useState<WorkerDetails | null>(
    state?.worker ?? null
  );

  useEffect(() => {
    if (booking?.worker_id && !worker) {
      getWorker(booking.worker_id)
        .then((data) => setWorker(data))
        .catch(() => {});
    }
  }, [booking?.worker_id, worker]);

  // Format helpers
  const formatDate = (dateStr: string) =>
    new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m);
    return d.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#F7F8F8] text-[#171717]">
        <div className="mx-auto min-h-screen max-w-[430px] bg-white shadow-sm flex items-center justify-center">
          <div className="text-center px-8">
            <p className="text-sm text-gray-500">
              Invoice data not available.
            </p>
            <button
              onClick={() => navigate("/customer/bookings")}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#FF5A00] text-white text-sm font-semibold"
            >
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const invoiceNumber = `INV-${String(booking.id).padStart(6, "0")}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ShramiGo Invoice ${invoiceNumber}`,
          text: `Invoice ${invoiceNumber} for Booking #${booking.id} - Total: ₹${booking.total_amount}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled or failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(
          `ShramiGo Invoice ${invoiceNumber}\nBooking #${booking.id}\nAmount: ₹${booking.total_amount}\nStatus: ${booking.payment_status}`
        );
        alert("Invoice details copied to clipboard!");
      } catch {
        alert(`Invoice: ${invoiceNumber} - Amount: ₹${booking.total_amount}`);
      }
    }
  };

  const isPaid = booking.payment_status === "paid";
  const isCash =
    booking.payment_status === "cash_pending" ||
    booking.payment_method === "cash";

  const workerName = worker?.name ?? `Worker #${booking.worker_id}`;
  const serviceName =
    worker?.services?.[0]?.name ??
    (booking.service_id ? `Service #${booking.service_id}` : "Professional Service");
  const workerInitial = workerName.trim()[0].toUpperCase();

  return (
    <div className="min-h-screen bg-[#F7F8F8] text-[#171717]">
      <div className="mx-auto min-h-screen max-w-[430px] bg-white shadow-sm">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F8F8] hover:bg-gray-100 transition"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="text-lg font-bold">Invoice</h1>

          <button
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F8F8] hover:bg-gray-100 transition"
            aria-label="Share invoice"
          >
            <Share2 size={18} />
          </button>
        </header>

        <main className="px-5 pb-8 pt-5">

          {/* Success / Status */}
          <section className="text-center">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
              isPaid ? "bg-[#E9F7F6]" : isCash ? "bg-blue-50" : "bg-amber-50"
            }`}>
              {isPaid ? (
                <CheckCircle2 size={34} className="text-[#087F7A]" />
              ) : isCash ? (
                <span className="text-2xl">💵</span>
              ) : (
                <Clock3 size={34} className="text-amber-600" />
              )}
            </div>

            <h2 className="mt-4 text-xl font-bold">
              {isPaid
                ? "Payment Successful"
                : isCash
                ? "Booking Confirmed (Cash on Completion)"
                : "Booking Confirmed"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {isPaid
                ? "Your payment and booking have been confirmed"
                : isCash
                ? `Pay ₹${booking.total_amount} in cash directly to ${workerName} after work is done`
                : "Payment is pending verification"}
            </p>
          </section>

          {/* Invoice Card */}
          <section className="mt-6 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

            {/* Invoice Header */}
            <div className="bg-[#087F7A] p-5 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-white/70 tracking-wider font-semibold">SHRAMIGO</p>
                  <h2 className="mt-1 text-xl font-bold">
                    Service Invoice
                  </h2>
                </div>

                <div className="rounded-xl bg-white/10 px-3 py-2 text-right">
                  <p className="text-[9px] text-white/70">Invoice No.</p>
                  <p className="mt-0.5 text-xs font-bold">
                    {invoiceNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">

              {/* Booking Info */}
              <div className="border-b border-dashed border-gray-200 pb-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">Booking ID</p>
                  <p className="text-xs font-bold">#{booking.id}</p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-400">Date & Time</p>
                  <p className="text-xs font-semibold">
                    {formatDate(String(booking.booking_date))} •{" "}
                    {formatTime(String(booking.booking_time))}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-400">Duration</p>
                  <p className="text-xs font-semibold">
                    {booking.hours} hour{booking.hours > 1 ? "s" : ""}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-400">Hourly Rate</p>
                  <p className="text-xs font-semibold">
                    ₹{booking.hourly_rate}/hr
                  </p>
                </div>
              </div>

              {/* Worker Details */}
              <div className="border-b border-dashed border-gray-200 py-5">
                <p className="mb-3 text-xs font-semibold text-gray-400">
                  SERVICE PROVIDER
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF1E8] text-[#FF5A00] font-bold text-base">
                    {workerInitial}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">
                      {workerName}
                    </p>

                    <p className="mt-0.5 text-xs text-[#087F7A] font-medium">
                      {serviceName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="border-b border-dashed border-gray-200 py-5">
                <p className="mb-3 text-xs font-semibold text-gray-400">
                  SERVICE LOCATION
                </p>

                <div className="flex gap-3">
                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0 text-[#FF5A00]"
                  />

                  <p className="text-xs leading-5 text-gray-600">
                    {booking.service_address}
                  </p>
                </div>
              </div>

              {/* Charges */}
              <div className="py-5">
                <p className="mb-4 text-xs font-semibold text-gray-400">
                  PAYMENT DETAILS
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      Service ({booking.hours} hr{booking.hours > 1 ? "s" : ""})
                    </span>

                    <span className="text-sm font-medium">
                      ₹{booking.subtotal}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      Service Charge
                    </span>

                    <span className="text-sm font-medium">
                      ₹{booking.service_charge}
                    </span>
                  </div>
                </div>

                <div className="my-4 border-t border-gray-200" />

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold text-gray-900 block">
                      {isPaid ? "Total Paid" : "Total Amount"}
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      {isPaid
                        ? "Paid via Online Gateway"
                        : isCash
                        ? "Due in cash upon completion"
                        : "Payment pending"}
                    </span>
                  </div>

                  <span className="flex items-center text-xl font-bold text-[#FF5A00]">
                    <IndianRupee size={18} />
                    {booking.total_amount}
                  </span>
                </div>
              </div>
            </div>

            {/* Paid / Pending Status Banner */}
            <div className={`px-5 py-4 ${isPaid ? "bg-[#F0FAF9]" : isCash ? "bg-blue-50" : "bg-amber-50"}`}>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 size={17} className={isPaid ? "text-[#087F7A]" : isCash ? "text-blue-600" : "text-amber-600"} />
                <p className={`text-xs font-bold ${isPaid ? "text-[#087F7A]" : isCash ? "text-blue-700" : "text-amber-700"}`}>
                  {isPaid
                    ? "Paid via ShramiGo"
                    : isCash
                    ? "Payment Method: Cash on Completion"
                    : "Payment Status: Pending"}
                </p>
              </div>
            </div>
          </section>

          {/* Print / Save Action */}
          <div className="mt-5 space-y-2.5">
            <button
              onClick={() => window.print()}
              className="w-full h-11 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition active:scale-[0.99]"
            >
              <Printer size={16} />
              Print / Save Receipt
            </button>

            <button
              onClick={() => navigate("/customer/bookings")}
              className="w-full h-11 rounded-xl bg-[#087F7A] text-white text-xs font-semibold flex items-center justify-center transition active:scale-[0.99]"
            >
              Back to My Bookings
            </button>
          </div>

          <p className="mt-5 text-center text-[10px] leading-4 text-gray-400">
            Thank you for choosing ShramiGo.
            <br />
            This is an official digitally generated service receipt.
          </p>
        </main>
      </div>
    </div>
  );
}