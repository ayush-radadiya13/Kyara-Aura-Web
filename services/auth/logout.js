import { AUTH_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

export async function logoutApi() {
  const { data } = await customAxios.post(AUTH_API_ROUTES.LOGOUT);
  return data;
}
