function resolveApiBaseUrl(): string {
  const configured = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

  // If running in browser and accessed via external host/IP (not localhost/127.0.0.1)
  if (
    typeof window !== "undefined" &&
    window.location.hostname &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    // If configured to localhost/127.0.0.1, rewrite host to current hostname so remote devices reach the backend
    if (configured) {
      try {
        const url = new URL(configured);
        if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
          url.hostname = window.location.hostname;
          return url.toString().replace(/\/$/, "");
        }
      } catch {
        return configured
          .replace("localhost", window.location.hostname)
          .replace("127.0.0.1", window.location.hostname)
          .replace(/\/$/, "");
      }
      return configured.replace(/\/$/, "");
    }

    // Default to empty string so requests use relative path (e.g. Vite dev proxy /api)
    return "";
  }

  return configured ? configured.replace(/\/$/, "") : "";
}

const API_BASE_URL = resolveApiBaseUrl();

/**
 * Converts any FastAPI error shape into a human-readable string.
 *
 * FastAPI can return:
 *   { "detail": "message" }
 *   { "detail": { "message": "..." } }
 *   { "detail": [{ "loc": [...], "msg": "...", "type": "..." }] }
 *
 * Never returns "[object Object]".
 */
function formatApiError(data: unknown): string {
  if (!data || typeof data !== "object") {
    return typeof data === "string" && data.trim()
      ? data
      : "Something went wrong.";
  }

  const obj = data as Record<string, unknown>;
  const detail = obj.detail;

  // No detail field at all
  if (detail === undefined || detail === null) {
    return "Something went wrong.";
  }

  // detail is a plain string
  if (typeof detail === "string") {
    return detail.trim() || "Something went wrong.";
  }

  // detail is an array (FastAPI validation errors)
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const validationItem = item as Record<string, unknown>;
          const msg =
            typeof validationItem.msg === "string"
              ? validationItem.msg
              : "";
          const loc = Array.isArray(validationItem.loc)
            ? (validationItem.loc as unknown[])
                .filter((l) => l !== "body")
                .join(" → ")
            : "";
          return loc ? `${loc}: ${msg}` : msg;
        }
        return String(item);
      })
      .filter(Boolean);

    return messages.length > 0
      ? messages.join("; ")
      : "Validation error.";
  }

  // detail is an object (non-standard)
  if (typeof detail === "object") {
    const detailObj = detail as Record<string, unknown>;
    if (typeof detailObj.message === "string") {
      return detailObj.message;
    }
    // Last resort: stringify safely
    try {
      return JSON.stringify(detail);
    } catch {
      return "Something went wrong.";
    }
  }

  return String(detail) || "Something went wrong.";
}

export class ApiError extends Error {
  public status: number;
  public detail: unknown;

  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("shramigo_token");

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkError) {
    throw new ApiError(
      "Unable to reach the server. Please check your connection.",
      0,
      null
    );
  }

  // Handle empty responses (e.g., 204 No Content)
  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return undefined as T;
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    // Response body is not valid JSON
    if (!response.ok) {
      throw new ApiError(
        `Request failed (${response.status})`,
        response.status,
        null
      );
    }
    return undefined as T;
  }

  if (!response.ok) {
    const message = formatApiError(data);

    // On 401 Unauthorized – clear stale auth state
    if (response.status === 401) {
      localStorage.removeItem("shramigo_token");
      localStorage.removeItem("shramigo_user");
      localStorage.removeItem("shramigo_refresh_token");
    }

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}