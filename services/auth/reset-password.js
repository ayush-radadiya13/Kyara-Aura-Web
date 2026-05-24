import { AUTH_API_ROUTES } from "@/lib/routes/auth-routes";
import { withoutTokenApi } from "@/utils/api";

/**
 * @param {Record<string, unknown>} payload
 */
export async function resetPasswordApi(payload) {
  const { data } = await withoutTokenApi.post(
    AUTH_API_ROUTES.RESET_PASSWORD,
    payload
  );
  return data;
}
