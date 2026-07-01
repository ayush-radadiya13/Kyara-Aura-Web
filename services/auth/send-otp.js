import { AUTH_API_ROUTES } from "@/lib/routes";
import { withoutTokenApi } from "@/utils/api";

/**
 * @param {Record<string, unknown>} payload
 */
export async function sendOtpApi(payload) {
  const { data } = await withoutTokenApi.post(AUTH_API_ROUTES.SEND_OTP, payload);
  return data?.data ?? data;
}
