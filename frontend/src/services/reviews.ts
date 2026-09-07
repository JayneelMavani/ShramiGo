import { apiRequest } from "./api";

export interface Review {
  id: number;
  booking_id: number;
  customer_id: number;
  worker_id: number;
  rating: number;
  review_text: string | null;
  created_at: string;
}

export async function createReview(data: {
  booking_id: number;
  rating: number;
  review_text?: string;
}): Promise<Review> {
  return apiRequest<Review>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getBookingReview(
  bookingId: number
): Promise<Review | null> {
  return apiRequest<Review | null>(
    `/api/reviews/booking/${bookingId}`
  );
}

export async function getWorkerReviews(
  workerId: number
): Promise<Review[]> {
  return apiRequest<Review[]>(
    `/api/reviews/worker/${workerId}`
  );
}

export async function getWorkerReviewStats(
  workerId: number
): Promise<{ avg_rating: number; total_reviews: number }> {
  return apiRequest<{ avg_rating: number; total_reviews: number }>(
    `/api/reviews/worker/${workerId}/stats`
  );
}
