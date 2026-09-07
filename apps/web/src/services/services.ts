import { apiRequest } from "./api";

export interface Service {
  id: number;
  name: string;
  category: string;
  description: string | null;
  base_price: number;
  icon: string | null;
  is_active: boolean;
}

export async function getServices(): Promise<Service[]> {
  return apiRequest<Service[]>("/api/services");
}

export async function getService(
  serviceId: number
): Promise<Service> {
  return apiRequest<Service>(
    `/api/services/${serviceId}`
  );
}