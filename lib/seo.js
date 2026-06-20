export const SITE_NAME = "Kayra Aura";
export const DEFAULT_SEO_TITLE =
  "Kayra Aura | Fashion Jewellery & Gold Plated Bangles";
export const DEFAULT_SEO_DESCRIPTION =
  "Shop Kayra Aura jewellery for elegant gold plated bangles, earrings, necklaces, rings, and occasion-ready fashion jewellery for women.";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  "http://localhost:3000";

export function getSiteUrl() {
  const value = SITE_URL.startsWith("http") ? SITE_URL : `https://${SITE_URL}`;
  return new URL(value.replace(/\/$/, ""));
}

export function absoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}

export function metadataForPage({
  title,
  description = DEFAULT_SEO_DESCRIPTION,
  path = "/",
  images = ["/assets/home1.jpg"],
  type = "website",
} = {}) {
  const url = absoluteUrl(path);
  const resolvedTitle = title || DEFAULT_SEO_TITLE;

  return {
    title: resolvedTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: resolvedTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: images.map((image) => ({
        url: absoluteUrl(image),
        alt: resolvedTitle,
      })),
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: images.map((image) => absoluteUrl(image)),
    },
  };
}

export function jsonLd(data) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}
