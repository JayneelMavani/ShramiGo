import { apiRequest } from "./api";

export interface CustomerProfile {
  id: number;
  user_id: number;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  profile_image: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CustomerProfileUpdateData {
  full_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  profile_image?: string;
  bio?: string;
}

export async function getCustomerProfile(): Promise<CustomerProfile> {
  return apiRequest<CustomerProfile>("/api/profile/customer");
}

export async function updateCustomerProfile(
  data: CustomerProfileUpdateData
): Promise<CustomerProfile> {
  return apiRequest<CustomerProfile>("/api/profile/customer", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
