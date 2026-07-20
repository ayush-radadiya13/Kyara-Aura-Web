export const defaultWebSettings = {
  email: "",
  address: "",
  footer_description: "",
  mobile_number: "",
  logo: "",
  logo_url: "",
  instagram_url: "",
  facebook_url: "",
  youtube_url: "",
  whatsapp_url: "",
  linkedin_url: "",
  buy_two_get_one_free_enabled: false,
  buy_two_get_one_discount_amount: 0,
  buy_qty: 2,
  get_qty: 1,
  offer_line1: "",
  offer_line2: "",
  offer_line3: "",
  offer_line4: "",
};

export function extractWebSettings(response) {
  return (
    response?.data?.data ||
    response?.data?.result ||
    response?.data?.settings ||
    response?.data?.web_settings ||
    response?.data ||
    response?.result ||
    response?.settings ||
    response?.web_settings ||
    response ||
    {}
  );
}

export function normalizeWebSettings(settings) {
  return {
    email: settings?.email || "",
    address: settings?.address || "",
    footer_description:
      settings?.footer_description || settings?.footerDescription || "",
    mobile_number:
      settings?.mobile_number ||
      settings?.mobileNumber ||
      settings?.phone ||
      settings?.mobile ||
      "",
    logo: settings?.logo || settings?.logo_url || settings?.logoUrl || "",
    logo_url: settings?.logo_url || settings?.logoUrl || settings?.logo || "",
    instagram_url: settings?.instagram_url || settings?.instagramUrl || "",
    facebook_url: settings?.facebook_url || settings?.facebookUrl || "",
    youtube_url: settings?.youtube_url || settings?.youtubeUrl || "",
    whatsapp_url: settings?.whatsapp_url || settings?.whatsappUrl || "",
    linkedin_url: settings?.linkedin_url || settings?.linkedinUrl || "",
    buy_two_get_one_free_enabled: Boolean(
      settings?.buy_two_get_one_free_enabled ?? settings?.buyTwoGetOneFreeEnabled,
    ),
    buy_two_get_one_discount_amount: Number(
      settings?.buy_two_get_one_discount_amount ?? settings?.buyTwoGetOneDiscountAmount ?? 0,
    ) || 0,
    buy_qty: normalizePositiveQty(
      settings?.buy_qty ?? settings?.buyQty,
      defaultWebSettings.buy_qty,
    ),
    get_qty: normalizePositiveQty(
      settings?.get_qty ?? settings?.getQty,
      defaultWebSettings.get_qty,
    ),
    offer_line1: String(settings?.offer_line1 ?? settings?.offerLine1 ?? "").trim(),
    offer_line2: String(settings?.offer_line2 ?? settings?.offerLine2 ?? "").trim(),
    offer_line3: String(settings?.offer_line3 ?? settings?.offerLine3 ?? "").trim(),
    offer_line4: String(settings?.offer_line4 ?? settings?.offerLine4 ?? "").trim(),
  };
}

function normalizePositiveQty(value, fallback) {
  const qty = Number(value);
  return Number.isFinite(qty) && qty > 0 ? qty : fallback;
}

/**
 * @param {Record<string, unknown> | null | undefined} settings
 * @returns {{ buyQty: number, getQty: number }}
 */
export function getBuyTwoGetOneQuantities(settings) {
  return {
    buyQty: normalizePositiveQty(settings?.buy_qty ?? settings?.buyQty, defaultWebSettings.buy_qty),
    getQty: normalizePositiveQty(settings?.get_qty ?? settings?.getQty, defaultWebSettings.get_qty),
  };
}

export function getOfferLines(settings) {
  return ["offer_line1", "offer_line2", "offer_line3", "offer_line4"]
    .map((key) => settings?.[key] ?? "")
    .filter(Boolean);
}

export function isBuyTwoGetOneFreeEnabled(settings) {
  return Boolean(settings?.buy_two_get_one_free_enabled);
}

import { apiUrl } from "@/lib/api-base";
import { serverFetch } from "@/lib/server-fetch";

export async function getWebSettings() {
  try {
    const response = await serverFetch(apiUrl("api/web-settings"), {
      cache: "no-store",
    });

    if (!response.ok) {
      return normalizeWebSettings(defaultWebSettings);
    }

    const data = await response.json();
    return normalizeWebSettings(extractWebSettings(data));
  } catch {
    return normalizeWebSettings(defaultWebSettings);
  }
}

export function getSocialLinks(settings) {
  const links = [
    { key: "instagram", label: "Instagram", href: settings?.instagram_url?.trim() },
    { key: "facebook", label: "Facebook", href: settings?.facebook_url?.trim() },
    { key: "youtube", label: "YouTube", href: settings?.youtube_url?.trim() },
    { key: "whatsapp", label: "WhatsApp", href: settings?.whatsapp_url?.trim() },
    { key: "linkedin", label: "LinkedIn", href: settings?.linkedin_url?.trim() },
  ];

  return links.filter((link) => Boolean(link.href));
}
