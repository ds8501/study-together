/** Keep local frontend and API hosts aligned so session cookies stay same-site. */
export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  if (typeof window === "undefined") {
    return process.env.NODE_ENV === "production" ? "/api" : configured.replace(/\/+$/, "");
  }

  // Keep local browser requests same-origin. The Next.js rewrite proxies them
  // to the local Spring service, avoiding cross-port cookie and CORS issues.
  const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  if (localHosts.has(window.location.hostname)) return "/api";

  try {
    const apiUrl = new URL(configured, window.location.origin);
    if (process.env.NODE_ENV === "production") return "/api";
    return apiUrl.toString().replace(/\/+$/, "");
  } catch {
    if (process.env.NODE_ENV === "production") return "/api";
    return configured.replace(/\/+$/, "");
  }
}
