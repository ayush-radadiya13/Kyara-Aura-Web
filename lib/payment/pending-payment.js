"use client";

const PENDING_PAYMENT_KEY = "ka-pending-payment";

// Pending markers older than this are ignored so a stale, abandoned attempt
// never auto-redirects a user during an unrelated future visit.
const PENDING_PAYMENT_TTL_MS = 60 * 60 * 1000;

export function setPendingPayment(data) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      PENDING_PAYMENT_KEY,
      JSON.stringify({ ...data, savedAt: Date.now() }),
    );
  } catch {
    // Storage may be unavailable (private mode / quota). Recovery is best-effort.
  }
}

export function getPendingPayment() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(PENDING_PAYMENT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (parsed?.savedAt && Date.now() - parsed.savedAt > PENDING_PAYMENT_TTL_MS) {
      window.localStorage.removeItem(PENDING_PAYMENT_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingPayment() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(PENDING_PAYMENT_KEY);
  } catch {
    // Ignore – nothing actionable if removal fails.
  }
}
