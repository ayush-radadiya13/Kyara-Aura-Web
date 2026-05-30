import { AUTH_API_ROUTES } from "@/lib/routes";
import { withoutTokenApi } from "@/utils/api";

/**
 * @param {Record<string, unknown>} payload
 */
export async function registerApi(payload) {
  const { data } = await withoutTokenApi.post(AUTH_API_ROUTES.REGISTER, payload);
  return data;
}
