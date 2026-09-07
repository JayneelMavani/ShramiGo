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

export async function toggleWorkerVerified(
  workerId: number
): Promise<{ message: string; is_verified: boolean }> {
  return apiRequest<{ message: string; is_verified: boolean }>(
    `/api/admin/workers/${workerId}/verify`,
    { method: "PUT" }
  );
}
