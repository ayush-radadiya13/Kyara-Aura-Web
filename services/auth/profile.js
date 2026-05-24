import { AUTH_API_ROUTES } from "@/lib/routes/auth-routes";
import { customAxios } from "@/utils/api";

export async function getProfileApi() {
  const { data } = await customAxios.get(AUTH_API_ROUTES.PROFILE);
  return data;
}
