/** Keep local frontend and API hosts aligned so session cookies stay same-site. */
export function getApiBaseUrl(): string {
  if (process.env.NODE_ENV === "production") return "/api";

  const configured = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  if (typeof window === "undefined") return configured.replace(/\/+$/, "");

  try {
    const apiUrl = new URL(configured, window.location.origin);
    const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
    if (localHosts.has(window.location.hostname) && localHosts.has(apiUrl.hostname)) {
      apiUrl.hostname = window.location.hostname;
    }
    return apiUrl.toString().replace(/\/+$/, "");
  } catch {
    return configured.replace(/\/+$/, "");
  }
}
