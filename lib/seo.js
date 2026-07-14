export const SITE_NAME = "Kayra Aura";
export const DEFAULT_SEO_TITLE =
  "Kayra Aura | Premium Fashion Jewellery Collection";
export const DEFAULT_SEO_DESCRIPTION =
  "Discover Kayra Aura's premium fashion jewellery collection for men and women. Shop rings, bangles, earrings, necklaces, bracelets and more for every occasion.";

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

const NOINDEX_ROBOTS = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};

export function metadataForPage({
  title,
  description = DEFAULT_SEO_DESCRIPTION,
  path = "/",
  images = ["/assets/image.png"],
  type = "website",
  noIndex = false,
} = {}) {
  const url = absoluteUrl(path);
  const resolvedTitle = title || DEFAULT_SEO_TITLE;
  const isProductType = type === "product";

  return {
    title: resolvedTitle,
    description,
    ...(noIndex ? { robots: NOINDEX_ROBOTS } : {}),
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
      ...(isProductType ? {} : { type }),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: images.map((image) => absoluteUrl(image)),
    },
    ...(isProductType ? { other: { "og:type": "product" } } : {}),
  };
}

export function noIndexMetadata({ title, description, path }) {
  return metadataForPage({
    title,
    description,
    path,
    noIndex: true,
  });
}

export function jsonLd(data) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}
