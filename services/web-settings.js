import { WEB_SETTINGS_API_ROUTES } from "@/lib/routes";
import { withoutTokenApi } from "@/utils/api";
import {
  extractWebSettings,
  normalizeWebSettings,
} from "@/lib/web-settings";

export async function getWebSettingsApi() {
  const { data } = await withoutTokenApi.get(WEB_SETTINGS_API_ROUTES.GET);
  return normalizeWebSettings(extractWebSettings(data));
}
