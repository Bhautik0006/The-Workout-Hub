const rawBase =
  import.meta.env.VITE_API_BASE_URL !== undefined && import.meta.env.VITE_API_BASE_URL !== ""
    ? import.meta.env.VITE_API_BASE_URL
    : import.meta.env.PROD
    ? ""
    : "http://localhost:5000";

export const API_URL = rawBase
  ? rawBase.endsWith("/api")
    ? rawBase
    : `${rawBase.replace(/\/$/, "")}/api`
  : "/api";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const url = `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "API Error";
    try {
      const data = await response.json();
      message = data.error || data.message || message;
    } catch {
      // Ignore JSON parse error
    }
    throw new Error(message);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
}
