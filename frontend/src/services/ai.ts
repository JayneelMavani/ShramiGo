import { apiRequest } from "./api";

export interface AIRecommendationWorker {
  id: number;
  name: string;
  service: string;
  rating: number;
  reviews: number;
  distance_km: number | null;
  price: number;
  experience_years: number;
  available: boolean;
  verified: boolean;
  image: string | null;
  city: string | null;
  state: string | null;
  match_score: number;
  match_reasons: string[];
}

export interface AIRecommendationResponse {
  detected_service: string | null;
  confidence: number;
  explanation: string;
  workers: AIRecommendationWorker[];
}

export async function getAIRecommendations(data: {
  description?: string;
  service?: string;
  max_price?: number;
  latitude?: number;
  longitude?: number;
  limit?: number;
}): Promise<AIRecommendationResponse> {
  return apiRequest<AIRecommendationResponse>("/api/ai/recommendations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
