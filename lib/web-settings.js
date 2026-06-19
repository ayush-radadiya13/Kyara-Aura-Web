export const defaultWebSettings = {
  email: "",
  address: "",
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
  };
}

export function isBuyTwoGetOneFreeEnabled(settings) {
  return Boolean(settings?.buy_two_get_one_free_enabled);
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
