import { apiRequest } from "./api";

export interface AdminStats {
  total_users: number;
  total_customers: number;
  total_workers: number;
  total_bookings: number;
  pending_bookings: number;
  completed_bookings: number;
  total_revenue: number;
  gross_booking_value: number;
  worker_payouts: number;
  platform_revenue: number;
}

export interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface AdminWorker {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  is_active: boolean;
  is_verified: boolean;
  city: string | null;
  state: string | null;
  experience_years: number;
  booking_count: number;
  created_at: string;
}

export interface AdminBooking {
  id: number;
  customer_id: number;
  customer_name: string;
  worker_id: number;
  worker_name: string;
  service_id: number | null;
  booking_date: string;
  booking_time: string;
  hours: number;
  service_address: string;
  hourly_rate: number;
  subtotal: number;
  service_charge: number;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export async function getAdminStats(): Promise<AdminStats> {
  return apiRequest<AdminStats>("/api/admin/stats");
}

export async function getAdminUsers(
  skip = 0,
  limit = 50
): Promise<AdminUser[]> {
  return apiRequest<AdminUser[]>(
    `/api/admin/users?skip=${skip}&limit=${limit}`
  );
}

export async function getAdminWorkers(
  skip = 0,
  limit = 50
): Promise<AdminWorker[]> {
  return apiRequest<AdminWorker[]>(
    `/api/admin/workers?skip=${skip}&limit=${limit}`
  );
}

export async function getAdminBookings(
  skip = 0,
  limit = 50,
  statusFilter?: string
): Promise<AdminBooking[]> {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });
  if (statusFilter) params.set("status", statusFilter);
  return apiRequest<AdminBooking[]>(`/api/admin/bookings?${params}`);
}

export async function toggleUserActive(
  userId: number
): Promise<{ message: string; is_active: boolean }> {
  return apiRequest<{ message: string; is_active: boolean }>(
    `/api/admin/users/${userId}/toggle-active`,
    { method: "PUT" }
  );
}

export async function deleteAdminUser(
  userId: number
): Promise<{ message: string; user_id: number }> {
  return apiRequest<{ message: string; user_id: number }>(
    `/api/admin/users/${userId}`,
    { method: "DELETE" }
  );
}

export async function toggleWorkerVerified(
  workerId: number
): Promise<{ message: string; is_verified: boolean }> {
  return apiRequest<{ message: string; is_verified: boolean }>(
    `/api/admin/workers/${workerId}/verify`,
    { method: "PUT" }
  );
}

// ── Services ──

export interface AdminService {
  id: number;
  name: string;
  category: string;
  description: string | null;
  base_price: number;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getAdminServices(
  skip = 0,
  limit = 100
): Promise<AdminService[]> {
  return apiRequest<AdminService[]>(
    `/api/admin/services?skip=${skip}&limit=${limit}`
  );
}

export async function createService(data: {
  name: string;
  category: string;
  description?: string;
  base_price: number;
  icon?: string;
}): Promise<AdminService> {
  return apiRequest<AdminService>("/api/services", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateService(
  serviceId: number,
  data: Partial<{ name: string; category: string; description: string; base_price: number; icon: string; is_active: boolean }>
): Promise<AdminService> {
  return apiRequest<AdminService>(`/api/services/${serviceId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteService(
  serviceId: number
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/services/${serviceId}`, {
    method: "DELETE",
  });
}

// ── Payments ──

export interface AdminPayment {
  id: number;
  booking_id: number;
  customer_id: number;
  customer_name: string;
  worker_id: number;
  worker_name: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  provider: string;
  paid_at: string | null;
  created_at: string;
}

export interface AdminPaymentSummary {
  total_collected: number;
  total_pending: number;
  cash_total: number;
  online_total: number;
  total_count: number;
  paid_count: number;
  pending_count: number;
  failed_count: number;
}

export async function getAdminPayments(
  skip = 0,
  limit = 50,
  statusFilter?: string
): Promise<AdminPayment[]> {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });
  if (statusFilter) params.set("status", statusFilter);
  return apiRequest<AdminPayment[]>(`/api/admin/payments?${params}`);
}

export async function getAdminPaymentSummary(): Promise<AdminPaymentSummary> {
  return apiRequest<AdminPaymentSummary>("/api/admin/payments/summary");
}

// ── Reviews ──

export interface AdminReview {
  id: number;
  booking_id: number;
  customer_id: number;
  customer_name: string;
  worker_id: number;
  worker_name: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

export interface AdminReviewSummary {
  total_reviews: number;
  avg_rating: number;
  rating_distribution: Record<string, number>;
}

export async function getAdminReviews(
  skip = 0,
  limit = 50,
  ratingFilter?: number
): Promise<AdminReview[]> {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });
  if (ratingFilter) params.set("rating", String(ratingFilter));
  return apiRequest<AdminReview[]>(`/api/admin/reviews?${params}`);
}

export async function getAdminReviewSummary(): Promise<AdminReviewSummary> {
  return apiRequest<AdminReviewSummary>("/api/admin/reviews/summary");
}

export async function deleteAdminReview(
  reviewId: number
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/admin/reviews/${reviewId}`, {
    method: "DELETE",
  });
}
