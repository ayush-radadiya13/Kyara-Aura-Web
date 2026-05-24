import { AUTH_API_ROUTES } from "@/lib/routes/auth-routes";
import { withoutTokenApi } from "@/utils/api";

/**
 * @param {Record<string, unknown>} payload
 */
export async function verifyEmailApi(payload) {
  const { data } = await withoutTokenApi.post(
    AUTH_API_ROUTES.VERIFY_EMAIL,
    payload
  );
  return data;
}
