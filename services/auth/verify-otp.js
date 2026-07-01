import { AUTH_API_ROUTES } from "@/lib/routes";
import { customAxios, withoutTokenApi } from "@/utils/api";

/**
 * @param {{ purpose: string; phone?: string; otp: string; address_id?: number }} payload
 * @param {{ useAuth?: boolean }} [options]
 */
export async function verifyOtpApi(payload, options = {}) {
  const client = options?.useAuth ? customAxios : withoutTokenApi;
  const { data } = await client.post(AUTH_API_ROUTES.VERIFY_OTP, payload);
  return data?.data ?? data;
}
