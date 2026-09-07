import { apiRequest } from "./api";

export interface AuthUser {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  role: "customer" | "worker" | "admin";
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  if (!data.access_token) {
    throw new Error("Login succeeded but no access token was received.");
  }

  localStorage.setItem(
    "shramigo_token",
    data.access_token
  );

  localStorage.setItem(
    "shramigo_user",
    JSON.stringify(data.user)
  );
  localStorage.setItem("shramigo_refresh_token", data.refresh_token);

  return data;
}

export async function registerCustomer(data: {
  full_name: string;
  phone: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify({
        ...data,
        role: "customer",
      }),
    }
  );

  if (!response.access_token) {
    throw new Error(
      "Registration succeeded but no access token was received."
    );
  }

  localStorage.setItem(
    "shramigo_token",
    response.access_token
  );

  localStorage.setItem(
    "shramigo_user",
    JSON.stringify(response.user)
  );
  localStorage.setItem("shramigo_refresh_token", response.refresh_token);

  return response;
}

export async function registerWorker(data: {
  full_name: string;
  phone: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify({
        ...data,
        role: "worker",
      }),
    }
  );

  if (!response.access_token) {
    throw new Error(
      "Registration succeeded but no access token was received."
    );
  }

  localStorage.setItem(
    "shramigo_token",
    response.access_token
  );

  localStorage.setItem(
    "shramigo_user",
    JSON.stringify(response.user)
  );
  localStorage.setItem("shramigo_refresh_token", response.refresh_token);

  return response;
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("shramigo_user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem("shramigo_refresh_token");
  if (refreshToken) {
    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch {
      // Local state is still cleared if the server is unavailable.
    }
  }
  localStorage.removeItem("shramigo_token");
  localStorage.removeItem("shramigo_user");
  localStorage.removeItem("shramigo_refresh_token");
}
