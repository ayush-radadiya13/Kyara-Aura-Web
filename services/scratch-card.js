import { SCRATCH_CARD_API_ROUTES } from "@/lib/routes";
import { customAxios, withoutTokenApi } from "@/utils/api";

/** @deprecated Legacy global key — cleared on read/logout; use per-user keys instead. */
export const SCRATCH_COUPON_STORAGE_KEY = "kayra:scratch-coupon";

const SCRATCH_COUPON_STORAGE_KEY_PREFIX = "kayra:scratch-coupon";

function unwrapData(response) {
  return response?.data?.data ?? response?.data;
}

/**
 * @param {string | number | null | undefined} userId
 * @returns {string | null}
 */
export function getScratchCouponStorageKey(userId) {
  if (userId == null || userId === "") return null;
  return `${SCRATCH_COUPON_STORAGE_KEY_PREFIX}:${userId}`;
}

/**
 * @param {string | number | null | undefined} userId
 * @returns {object | null}
 */
export function getStoredScratchCoupon(userId) {
  if (typeof window === "undefined" || userId == null || userId === "") return null;

  try {
    const key = getScratchCouponStorageKey(userId);
    const storedValue = window.sessionStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : null;
  } catch {
    return null;
  }
}

/**
 * @param {object | null} coupon
 * @param {string | number | null | undefined} userId
 */
export function writeStoredScratchCoupon(coupon, userId) {
  if (typeof window === "undefined" || userId == null || userId === "") return;

  const key = getScratchCouponStorageKey(userId);
  if (!key) return;

  if (!coupon?.coupon_code) {
    window.sessionStorage.removeItem(key);
    return;
  }

  window.sessionStorage.setItem(key, JSON.stringify(coupon));
}

/**
 * @param {string | number | null | undefined} [userId]
 */
export function clearStoredScratchCoupon(userId) {
  if (typeof window === "undefined") return;

  if (userId != null && userId !== "") {
    const key = getScratchCouponStorageKey(userId);
    if (key) window.sessionStorage.removeItem(key);
  }

  window.sessionStorage.removeItem(SCRATCH_COUPON_STORAGE_KEY);
}

export function clearLegacyScratchCouponStorage() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SCRATCH_COUPON_STORAGE_KEY);
}

export async function getScratchCardStatusApi() {
  const response = await withoutTokenApi.get(SCRATCH_CARD_API_ROUTES.STATUS);
  return unwrapData(response);
}

export async function scratchCardApi() {
  const response = await customAxios.get(SCRATCH_CARD_API_ROUTES.SCRATCH);
  return unwrapData(response);
}
