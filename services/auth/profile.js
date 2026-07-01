import { AUTH_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

export async function getProfileApi() {
  const { data } = await customAxios.get(AUTH_API_ROUTES.PROFILE);
  return data;
}

export async function updateProfileApi(payload) {
  const { data } = await customAxios.put(AUTH_API_ROUTES.PROFILE, payload);
  return data;
}
