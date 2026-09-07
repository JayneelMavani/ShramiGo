import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Star,
  User,
} from "lucide-react";

import { createReview } from "../../services/reviews";
import type { Booking } from "../../services/bookings";

const ratingLabels = [
  "",
  "Poor",
  "Needs Improvement",
  "Good",
  "Very Good",
  "Excellent",
];

export default function Rating() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { booking?: Booking } | null;
  const booking = state?.booking;

  const workerName = "Service Provider";

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    if (!booking) {
      navigate("/customer/bookings");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await createReview({
        booking_id: booking.id,
        rating,
        review_text: review.trim() || undefined,
      });

      setSubmitted(true);

      // Navigate after brief success state
      setTimeout(() => {
        navigate("/customer/bookings");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F7F8F8] text-[#171717]">
        <div className="mx-auto min-h-screen max-w-[430px] bg-white shadow-sm flex items-center justify-center">
          <div className="text-center px-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E9F7F6]">
              <CheckCircle2 size={40} className="text-[#087F7A]" />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              Thank You!
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Your rating has been submitted successfully.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8F8] text-[#171717]">
      <div className="mx-auto min-h-screen max-w-[430px] bg-white shadow-sm">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F8F8]"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="text-lg font-bold">Rate Your Service</h1>

          <div className="w-10" />
        </header>

        <main className="px-5 pb-10 pt-7">

          {/* Completed Banner */}
          <div className="flex items-center gap-3 rounded-2xl bg-[#E9F7F6] p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
              <CheckCircle2 size={21} className="text-[#087F7A]" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#087F7A]">
                Service Completed
              </p>

              <p className="mt-0.5 text-[10px] text-gray-500">
                How was your experience?
              </p>
            </div>
          </div>

          {/* Worker */}
          <section className="mt-7 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF1E8] text-[#FF5A00]">
              <User size={34} />
            </div>

            <h2 className="mt-4 text-xl font-bold">{workerName}</h2>

            {booking && (
              <p className="mt-1 text-sm text-gray-500">
                Booking #{booking.id}
              </p>
            )}
          </section>

          {/* Rating Stars */}
          <section className="mt-8 text-center">
            <h3 className="text-base font-bold">
              How would you rate the service?
            </h3>

            <div className="mt-5 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoverRating || rating);

                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF7E6] transition-transform hover:scale-105"
                  >
                    <Star
                      size={27}
                      className={
                        active ? "text-[#FFB000]" : "text-gray-300"
                      }
                      fill={active ? "currentColor" : "none"}
                    />
                  </button>
                );
              })}
            </div>

            {rating > 0 && (
              <p className="mt-3 text-sm font-semibold text-[#FF5A00]">
                {ratingLabels[rating]}
              </p>
            )}
          </section>

          {/* Review Text */}
          <section className="mt-8">
            <label className="mb-2 block text-sm font-bold">
              Write a review
              <span className="ml-1 text-xs font-normal text-gray-400">
                (Optional)
              </span>
            </label>

            <div className="relative">
              <MessageSquare
                size={18}
                className="absolute left-4 top-4 text-[#087F7A]"
              />

              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={5}
                maxLength={2000}
                className="w-full resize-none rounded-2xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none placeholder:text-gray-400 focus:border-[#087F7A]"
              />

              <span className="absolute bottom-3 right-4 text-[10px] text-gray-400">
                {review.length}/2000
              </span>
            </div>
          </section>

          {/* Quick Tags */}
          <section className="mt-6">
            <p className="mb-3 text-xs font-semibold text-gray-500">
              What did you like?
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                "Professional",
                "On Time",
                "Good Quality",
                "Friendly",
                "Affordable",
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setReview((prev) =>
                      prev
                        ? `${prev}, ${tag}`
                        : tag
                    )
                  }
                  className="rounded-full border border-gray-200 bg-white px-3.5 py-2 text-[11px] font-medium text-gray-600 hover:border-[#FF5A00] hover:text-[#FF5A00]"
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className={`mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition ${
              rating > 0 && !submitting
                ? "bg-[#FF5A00] text-white"
                : "cursor-not-allowed bg-gray-200 text-gray-400"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Rating"
            )}
          </button>

          <button
            onClick={() => navigate("/customer/bookings")}
            className="mt-3 w-full py-3 text-xs font-semibold text-gray-500"
          >
            Skip for now
          </button>

          <div className="mt-5 rounded-2xl bg-[#F7F8F8] p-4 text-center">
            <p className="text-[11px] leading-4 text-gray-500">
              Your feedback helps ShramiGo maintain quality services
              and helps other customers make better choices.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}