import type { Bidder } from "./types";

const STORAGE_KEY = "auction.bidder";

const EMAIL_RE =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Validate the self-asserted bidder. Mirrors the authoritative server-side
 * checks — these are UX hints; the server re-validates every bid.
 */
export function validateBidder(input: Partial<Bidder>): { value?: Bidder; error?: string } {
  const name = (input.name || "").trim();
  const email = (input.email || "").trim().toLowerCase();
  const phoneDigits = (input.phone || "").replace(/\D/g, "");

  if (!name) return { error: "Please enter your name." };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  if (phoneDigits.length < 10) return { error: "Please enter a valid phone number." };

  return { value: { name, email, phone: phoneDigits } };
}

export function loadBidder(): Bidder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return validateBidder(parsed).value ?? null;
  } catch {
    return null;
  }
}

export function saveBidder(bidder: Bidder) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bidder));
  } catch {
    /* ignore quota / private-mode errors */
  }
}
