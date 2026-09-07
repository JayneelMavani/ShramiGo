export type BookingStatus = 'requested' | 'confirmed' | 'active' | 'completed'

export interface Booking {
  id: string
  serviceId: string
  workerId: string
  customerId: string
  status: BookingStatus
  scheduledFor: string
}
