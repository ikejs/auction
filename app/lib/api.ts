import type { AuctionState } from "./types";

export type Theme = "dark" | "light";

/** Theme from a request URL's ?theme= param. Defaults to dark. */
export function parseTheme(requestUrl: string): Theme {
  return new URL(requestUrl).searchParams.get("theme") === "light" ? "light" : "dark";
}

// Base URL of the DigitalOcean backend (REST + socket.io). Inlined by Vite at
// build time for the client and read from the same value during SSR.
export const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:4000";

/** Socket.io connects to the same host as the REST API. */
export const SOCKET_URL = API_URL;

export async function fetchCurrentAuction(): Promise<AuctionState> {
  const res = await fetch(`${API_URL}/api/auctions/current`);
  if (!res.ok) throw new Response("Failed to load auction", { status: 502 });
  const data = await res.json();
  return data.auction ? data : null;
}

export async function fetchAuction(slug: string): Promise<AuctionState> {
  const res = await fetch(`${API_URL}/api/auctions/${encodeURIComponent(slug)}`);
  if (res.status === 404) throw new Response("Not found", { status: 404 });
  if (!res.ok) throw new Response("Failed to load auction", { status: 502 });
  return res.json();
}

/** Resolve an image path (server-relative "/uploads/..") against the backend. */
export function imageUrl(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
