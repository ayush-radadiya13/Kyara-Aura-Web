import { SCRATCH_CARD_API_ROUTES } from "@/lib/routes";
import { customAxios, withoutTokenApi } from "@/utils/api";

export const SCRATCH_COUPON_STORAGE_KEY = "kayra:scratch-coupon";

function unwrapData(response) {
  return response?.data?.data ?? response?.data;
}

export async function getScratchCardStatusApi() {
  const response = await withoutTokenApi.get(SCRATCH_CARD_API_ROUTES.STATUS);
  console.log();
  
  return unwrapData(response);
}

export async function scratchCardApi() {
  const response = await customAxios.get(SCRATCH_CARD_API_ROUTES.SCRATCH);
  return unwrapData(response);
}
