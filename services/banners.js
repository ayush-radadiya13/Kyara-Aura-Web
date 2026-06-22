import { BANNER_API_ROUTES } from "@/lib/routes";
import { withoutTokenApi } from "@/utils/api";
import {
  extractBannerSettings,
  normalizeBannerSettings,
} from "@/lib/banners";

export async function getBannerSettingsApi() {
  const { data } = await withoutTokenApi.get(BANNER_API_ROUTES.GET);
  return normalizeBannerSettings(extractBannerSettings(data));
}
