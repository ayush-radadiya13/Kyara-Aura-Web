import { AUTH_API_ROUTES } from "@/lib/routes";
import { withoutTokenApi } from "@/utils/api";

/**
 * @param {Record<string, unknown>} payload
 */
export async function forgotPasswordApi(payload) {
  const { data } = await withoutTokenApi.post(
    AUTH_API_ROUTES.FORGOT_PASSWORD,
    payload
  );
  return data;
}
