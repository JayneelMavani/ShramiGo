import { apiRequest } from "./api";

// ==================== WORKER SKILLS ====================

export interface WorkerSkill {
  id: number;
  worker_id: number;
  skill_name: string;
  category: string | null;
  description: string | null;
  created_at: string;
}

export async function getWorkerSkills(): Promise<WorkerSkill[]> {
  return apiRequest<WorkerSkill[]>(
    "/api/profile/worker/skills"
  );
}

export async function createWorkerSkill(data: {
  skill_name: string;
  category?: string;
  description?: string;
}): Promise<WorkerSkill> {
  return apiRequest<WorkerSkill>(
    "/api/profile/worker/skills",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteWorkerSkill(
  skillId: number
): Promise<void> {
  await apiRequest(
    `/api/profile/worker/skills/${skillId}`,
    {
      method: "DELETE",
    }
  );
}


// ==================== WORKER PROFILE ====================

export interface WorkerProfile {
  id: number;
  user_id: number;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  profile_image: string | null;
  bio: string | null;
  experience_years: number;
  latitude?: number | null;
  longitude?: number | null;
  service_radius_km?: number | null;
  created_at: string;
  updated_at: string;
}

export async function getWorkerProfile(): Promise<WorkerProfile> {
  return apiRequest<WorkerProfile>(
    "/api/profile/worker"
  );
}

export async function updateWorkerProfile(data: {
  full_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  profile_image?: string;
  bio?: string;
  experience_years?: number;
}): Promise<WorkerProfile> {
  return apiRequest<WorkerProfile>(
    "/api/profile/worker",
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}


// ==================== WORKER AVAILABILITY ====================

export interface WorkerAvailability {
  id: number;
  worker_id: number;
  day_of_week: string;
  start_time: string | null;
  end_time: string | null;
  is_available: boolean;
  created_at: string;
}

export async function getWorkerAvailability(): Promise<
  WorkerAvailability[]
> {
  return apiRequest<WorkerAvailability[]>(
    "/api/profile/worker/availability"
  );
}

export async function createWorkerAvailability(data: {
  day_of_week: string;
  start_time?: string;
  end_time?: string;
  is_available?: boolean;
}): Promise<WorkerAvailability> {
  return apiRequest<WorkerAvailability>(
    "/api/profile/worker/availability",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function updateWorkerAvailability(
  id: number,
  data: {
    day_of_week?: string;
    start_time?: string;
    end_time?: string;
    is_available?: boolean;
  }
): Promise<WorkerAvailability> {
  return apiRequest<WorkerAvailability>(
    `/api/profile/worker/availability/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteWorkerAvailability(
  id: number
): Promise<void> {
  await apiRequest(
    `/api/profile/worker/availability/${id}`,
    {
      method: "DELETE",
    }
  );
}


// ==================== SERVICE CATALOGUE ====================

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


// ==================== WORKER SERVICES ====================

export interface WorkerService {
  id: number;
  service_id: number;
  name: string;
  category: string;
  description: string | null;
  base_price: number;
  custom_price: number | null;
  service_charge: number | null;
  icon: string | null;
  is_active: boolean;
}

export async function getMyWorkerServices(): Promise<
  WorkerService[]
> {
  return apiRequest<WorkerService[]>(
    "/api/worker/services"
  );
}

export async function addWorkerService(
  serviceId: number,
  customPrice?: number
): Promise<{
  message: string;
  worker_service_id: number;
}> {
  return apiRequest<{
    message: string;
    worker_service_id: number;
  }>("/api/worker/services", {
    method: "POST",
    body: JSON.stringify({
      service_id: serviceId,
      custom_price: customPrice ?? null,
    }),
  });
}

export async function updateWorkerService(
  workerServiceId: number,
  data: {
    custom_price?: number | null;
    is_active?: boolean;
  }
): Promise<{
  message: string;
}> {
  return apiRequest<{
    message: string;
  }>(
    `/api/worker/services/${workerServiceId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteWorkerService(
  workerServiceId: number
): Promise<void> {
  await apiRequest(
    `/api/worker/services/${workerServiceId}`,
    {
      method: "DELETE",
    }
  );
}


// ==================== CUSTOMER WORKER DISCOVERY ====================

export interface Worker {
  id: number;
  name: string;
  service: string;
  experience: string;
  rating: number;
  reviews: number;
  distance: string | null;
  price: string;
  available: boolean;
  verified: boolean;
  image: string | null;
  city: string | null;
  state: string | null;
}

export async function getWorkers(
  service?: string,
  city?: string
): Promise<Worker[]> {
  const params = new URLSearchParams();

  if (service && service !== "All") {
    params.set("service", service);
  }

  if (city) {
    params.set("city", city);
  }

  const query = params.toString();

  return apiRequest<Worker[]>(
    `/api/workers${query ? `?${query}` : ""}`
  );
}


// ==================== CUSTOMER WORKER DETAILS ====================

export interface WorkerDetailsService {
  id: number;
  service_id: number;
  name: string;
  category: string;
  description: string | null;
  base_price: number;
  price: number;
  icon: string | null;
}

export interface WorkerDetailsSkill {
  id: number;
  skill_name: string;
  category: string | null;
  description: string | null;
}

export interface WorkerDetailsAvailability {
  id: number;
  day_of_week: string;
  start_time: string | null;
  end_time: string | null;
  is_available: boolean;
}

export interface WorkerDetails {
  id: number;
  name: string;
  phone: string;
  email: string;
  verified: boolean;
  is_active: boolean;

  profile: {
    id: number;
    address: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    profile_image: string | null;
    bio: string | null;
    experience_years: number;
  };

  skills: WorkerDetailsSkill[];

  services: WorkerDetailsService[];

  availability: WorkerDetailsAvailability[];

  available: boolean;

  rating: number;
  reviews: number;
}

export async function getWorker(
  workerId: number
): Promise<WorkerDetails> {
  return apiRequest<WorkerDetails>(
    `/api/workers/${workerId}`
  );
}