import { apiRequest } from "./api";

export interface Booking {
  id: number;
  customer_id: number;
  worker_id: number;
  service_id: number | null;
  booking_date: string;
  booking_time: string;
  hours: number;
  service_address: string;
  description: string | null;
  hourly_rate: number;
  subtotal: number;
  service_charge: number;
  total_amount: number;
  worker_payout: number;
  status: string;
  payment_method?: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CreateBookingData {
  worker_id: number;
  service_id?: number;
  booking_date: string;
  booking_time: string;
  hours: number;
  service_address: string;
  description?: string;
  payment_method?: string;
}

export async function createBooking(
  data: CreateBookingData
): Promise<Booking> {
  return apiRequest<Booking>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMyBookings(): Promise<Booking[]> {
  return apiRequest<Booking[]>("/api/bookings/my");
}

/** Worker: get all bookings assigned to the logged-in worker */
export async function getWorkerBookings(): Promise<Booking[]> {
  return apiRequest<Booking[]>("/api/bookings/worker");
}

export async function getBooking(
  bookingId: number
): Promise<Booking> {
  return apiRequest<Booking>(`/api/bookings/${bookingId}`);
}

/** Customer: mark payment as paid */
export async function updateBookingPayment(
  bookingId: number
): Promise<Booking> {
  return apiRequest<Booking>(
    `/api/bookings/${bookingId}/payment`,
    {
      method: "PUT",
    }
  );
}

/** Customer: update booking payment method (cash or online) */
export async function updateBookingPaymentMethod(
  bookingId: number,
  paymentMethod: "cash" | "razorpay"
): Promise<Booking> {
  return apiRequest<Booking>(
    `/api/bookings/${bookingId}/payment-method`,
    {
      method: "PUT",
      body: JSON.stringify({ payment_method: paymentMethod }),
    }
  );
}


/** Customer: cancel a pending booking */
export async function cancelBooking(
  bookingId: number
): Promise<Booking> {
  return apiRequest<Booking>(
    `/api/bookings/${bookingId}/cancel`,
    {
      method: "PUT",
    }
  );
}

/** Worker: update booking status (accept/reject/in-progress/complete) */
export async function updateBookingStatus(
  bookingId: number,
  newStatus: string
): Promise<Booking> {
  return apiRequest<Booking>(
    `/api/bookings/${bookingId}/status`,
    {
      method: "PUT",
      body: JSON.stringify({ status: newStatus }),
    }
  );
}

export async function markCashReceived(bookingId: number): Promise<Booking> {
  return apiRequest<Booking>(`/api/bookings/${bookingId}/cash-received`, {
    method: "PUT",
  });
}

export interface PaymentOrder {
  payment_id: number;
  order_id: string;
  key_id: string;
  amount: number;
  currency: string;
}

export async function createPaymentOrder(bookingId: number): Promise<PaymentOrder> {
  return apiRequest<PaymentOrder>(`/api/payments/bookings/${bookingId}/order`, { method: "POST" });
}

export async function verifyPayment(
  bookingId: number,
  response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(`/api/payments/bookings/${bookingId}/verify`, {
    method: "POST",
    body: JSON.stringify(response),
  });
}