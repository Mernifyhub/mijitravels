// lib/api.ts

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://api.mijitravels.com/api/v1";

const forceLogout = (reason = "Session expired") => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("user");
  } catch {}

  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = `/login?reason=${encodeURIComponent(reason)}`;
  }
};

type ApiClientOptions = RequestInit & {
  skipAuthRedirect?: boolean;
  skipAuthToken?: boolean;
};

export const apiClient = async (
  endpoint: string,
  options: ApiClientOptions = {}
) => {
  const {
    skipAuthRedirect = false,
    skipAuthToken = false,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  const token =
    !skipAuthToken && typeof window !== "undefined"
      ? localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        ""
      : "";

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const isFormData = fetchOptions.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(customHeaders || {}),
  };

  let res: Response;

  try {
    res = await fetch(`${API_BASE}${normalizedEndpoint}`, {
      ...fetchOptions,
      method: fetchOptions.method || "GET",
      credentials: "include",
      headers,
      cache: "no-store",
    });
  } catch (networkError: any) {
    const error = new Error(
      networkError?.message || "Network error. Please check your connection."
    ) as Error & { status?: number; data?: any };
    error.status = 0;
    error.data = null;
    throw error;
  }

  if (res.ok) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  let errorData: any = null;

  try {
    errorData = await res.json();
  } catch {
    try {
      errorData = await res.text();
    } catch {
      errorData = "Unknown error";
    }
  }

  const message =
    typeof errorData === "string"
      ? errorData
      : Array.isArray(errorData?.message)
      ? errorData.message[0]
      : errorData?.message || `API Error ${res.status}`;

  if (res.status === 401 && !skipAuthRedirect) {
    forceLogout("Session expired");
  }

  if (!skipAuthRedirect) {
    const lower = String(message).toLowerCase();
    if (
      lower.includes("invalid or expired token") ||
      lower.includes("jwt expired") ||
      lower.includes("unauthorized")
    ) {
      forceLogout("Session expired");
    }
  }

  const error = new Error(message) as Error & {
    status?: number;
    data?: any;
  };
  error.status = res.status;
  error.data = errorData;
  throw error;
};

export { forceLogout };

// ============================================================
// ✅ API PROVIDER MANAGEMENT
// Admin dashboard থেকে provider on/off করার জন্য
// ============================================================

export type ApiProvider = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiProvidersResponse = {
  success: boolean;
  data: ApiProvider[];
};

export type ApiProviderToggleResponse = {
  success: boolean;
  message: string;
  data: ApiProvider;
};

// ── সব provider list আনো ──
// GET /api/v1/admin/api-providers
export const getApiProviders = async (): Promise<ApiProvidersResponse> => {
  return apiClient("/admin/api-providers");
};

// ── একটা provider on/off করো ──
// PATCH /api/v1/admin/api-providers/:slug/toggle
export const toggleApiProvider = async (
  slug: string,
  isActive: boolean
): Promise<ApiProviderToggleResponse> => {
  return apiClient(`/admin/api-providers/${slug}/toggle`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
};