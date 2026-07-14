import { apiUrl } from "@/lib/api-base";
import { BANNER_API_ROUTES } from "@/lib/routes";
import { serverFetch } from "@/lib/server-fetch";

export const defaultBannerSettings = {
  image1: "",
  image2: "",
  image3: "",
  image4: "",
  video: "",
  video_url: "",
  banner_title: "",
  banner_description: "",
  video_title: "",
  video_description: "",
  sort_order: 1,
};

function resolveMediaUrl(value) {
  if (Array.isArray(value)) {
    return value.find((item) => typeof item === "string" && item.trim()) || "";
  }

  return typeof value === "string" ? value : "";
}

export function extractBannerSettings(response) {
  const data =
    response?.data?.data ||
    response?.data?.result ||
    response?.data?.banner ||
    response?.data ||
    response?.result ||
    response?.banner ||
    response ||
    {};

  if (Array.isArray(data)) {
    return data[0] || {};
  }

  return data;
}

export function normalizeBannerSettings(settings) {
  const imageArray = [
    ...(Array.isArray(settings?.image) ? settings.image : []),
    ...(Array.isArray(settings?.image_url) ? settings.image_url : []),
  ].filter(Boolean);

  const video =
    resolveMediaUrl(settings?.video) ||
    resolveMediaUrl(settings?.video_url) ||
    resolveMediaUrl(settings?.videoUrl);

  return {
    image1: settings?.image1 || imageArray[0] || "",
    image2: settings?.image2 || imageArray[1] || "",
    image3: settings?.image3 || imageArray[2] || "",
    image4: settings?.image4 || imageArray[3] || "",
    video,
    video_url: resolveMediaUrl(settings?.video_url) || video,
    banner_title: settings?.banner_title || "",
    banner_description: settings?.banner_description || "",
    video_title: settings?.video_title || "",
    video_description: settings?.video_description || "",
    sort_order: Number(settings?.sort_order) || 1,
    created_at: settings?.created_at || "",
    updated_at: settings?.updated_at || "",
  };
}

export function getBannerCarouselImages(settings) {
  return [
    settings?.image1,
    settings?.image2,
    settings?.image3,
    settings?.image4,
  ].filter(Boolean);
}

export async function getBannerSettings() {
  try {
    const response = await serverFetch(apiUrl(BANNER_API_ROUTES.GET), {
      cache: "no-store",
    });

    if (!response.ok) {
      return normalizeBannerSettings(defaultBannerSettings);
    }

    const data = await response.json();
    return normalizeBannerSettings(extractBannerSettings(data));
  } catch {
    return normalizeBannerSettings(defaultBannerSettings);
  }
}
