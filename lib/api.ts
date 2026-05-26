const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

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
};

export const apiClient = async (
  endpoint: string,
  options: ApiClientOptions = {}
) => {
  const { skipAuthRedirect = false, ...fetchOptions } = options;

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        ""
      : "";

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const isFormData = fetchOptions.body instanceof FormData;

  const res = await fetch(`${API_BASE}${normalizedEndpoint}`, {
    method: fetchOptions.method || "GET",
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchOptions.headers || {}),
    },
    cache: "no-store",
    ...fetchOptions,
  });

  let errorData: any = null;

  if (!res.ok) {
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
        lower.includes("unauthorized") ||
        lower.includes("forbidden")
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
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
};

export { forceLogout };