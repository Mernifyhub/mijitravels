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

  // Get token only if not skipped
  const token =
    !skipAuthToken && typeof window !== "undefined"
      ? localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        ""
      : "";

  // Normalize endpoint
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const isFormData = fetchOptions.body instanceof FormData;

  // Build headers properly
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
    // Network error (no internet, server down, CORS, etc.)
    const error = new Error(
      networkError?.message || "Network error. Please check your connection."
    ) as Error & { status?: number; data?: any };
    error.status = 0;
    error.data = null;
    throw error;
  }

  // Success response
  if (res.ok) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  // Error response handling
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

  // Handle 401 - Unauthorized
  if (res.status === 401 && !skipAuthRedirect) {
    forceLogout("Session expired");
  }

  // Handle token-related errors
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