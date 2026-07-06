import { SCRATCH_CARD_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

/** @deprecated Legacy global key — cleared on logout/checkout; no longer written. */
export const SCRATCH_COUPON_STORAGE_KEY = "kayra:scratch-coupon";

const SCRATCH_COUPON_STORAGE_KEY_PREFIX = "kayra:scratch-coupon";

function unwrapData(response) {
  return response?.data?.data ?? response?.data;
}

/**
 * @param {Record<string, unknown> | null | undefined} source
 * @returns {{ coupon_code: string, discount_percent: number } | null}
 */
export function normalizeScratchCoupon(source) {
  const couponCode = source?.scratch_coupon_code ?? source?.coupon_code;
  if (couponCode == null || couponCode === "") return null;

  return {
    coupon_code: String(couponCode),
    discount_percent: Number(source?.discount_percent ?? 0),
  };
}

/**
 * @param {string | number | null | undefined} userId
 * @returns {string | null}
 */
function getScratchCouponStorageKey(userId) {
  if (userId == null || userId === "") return null;
  return `${SCRATCH_COUPON_STORAGE_KEY_PREFIX}:${userId}`;
}

/**
 * Removes any scratch-coupon keys left in sessionStorage from older versions.
 * @param {string | number | null | undefined} [userId]
 */
export function clearStoredScratchCoupon(userId) {
  if (typeof window === "undefined") return;

  const keysToRemove = new Set([SCRATCH_COUPON_STORAGE_KEY]);

  if (userId != null && userId !== "") {
    const key = getScratchCouponStorageKey(userId);
    if (key) keysToRemove.add(key);
  }

  for (let index = 0; index < window.sessionStorage.length; index += 1) {
    const key = window.sessionStorage.key(index);
    if (key?.startsWith(`${SCRATCH_COUPON_STORAGE_KEY_PREFIX}:`)) {
      keysToRemove.add(key);
    }
  }

  keysToRemove.forEach((key) => window.sessionStorage.removeItem(key));
}

export async function getScratchCardStatusApi() {
  const response = await customAxios.get(SCRATCH_CARD_API_ROUTES.STATUS);
  return unwrapData(response);
}

export async function scratchCardApi() {
  const response = await customAxios.get(SCRATCH_CARD_API_ROUTES.SCRATCH);
  return unwrapData(response);
}
