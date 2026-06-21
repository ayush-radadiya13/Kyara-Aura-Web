import { absoluteUrl } from "@/lib/seo";
import { getSocialLinks } from "@/lib/web-settings";

export const BRAND_NAME = "Kayra Aura";
export const ORGANIZATION_URL = "https://kayraaura.com";

function productDescription(product) {
  return String(product?.description ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

function productAvailability(product) {
  return product.sizes?.some((size) => Number(size.quantity) > 0)
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";
}

function productImages(product) {
  if (product.images?.length) {
    return product.images.map((image) => absoluteUrl(image));
  }

  return [absoluteUrl(product.image || "/images/product-placeholder.svg")];
}

function averageRatingFromReviews(reviews) {
  if (!reviews.length) return null;

  const total = reviews.reduce(
    (sum, review) => sum + Number(review.rating || 0),
    0,
  );
  const average = total / reviews.length;

  return Number.isFinite(average) ? Number(average.toFixed(1)) : null;
}

function reviewSchema(review) {
  const schema = {
    "@type": "Review",
    author: {
      "@type": "Person",
      name: review.customer_name || "Anonymous",
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: Number(review.rating) || 1,
      bestRating: 5,
      worstRating: 1,
    },
  };

  if (review.review) {
    schema.reviewBody = review.review;
  }

  if (review.created_at) {
    schema.datePublished = review.created_at;
  }

  return schema;
}

export function getSocialSameAs(settings) {
  return getSocialLinks(settings)
    .filter((link) => link.key !== "whatsapp")
    .map((link) => link.href);
}

export function buildOrganizationSchema({ sameAs = [], logo } = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: ORGANIZATION_URL,
    logo: absoluteUrl(logo || "/assets/ka1.png"),
    sameAs,
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    url: ORGANIZATION_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/products?search={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildProductSchema(product) {
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const reviewCount = product.reviews_count ?? reviews.length;
  const averageRating = averageRatingFromReviews(reviews);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: productDescription(product),
    image: productImages(product),
    sku: String(product.sku ?? product._id ?? product.id ?? product.slug),
    brand: {
      "@type": "Brand",
      name: BRAND_NAME,
    },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/products/${product.slug}`),
      priceCurrency: "INR",
      price: product.price,
      availability: productAvailability(product),
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  if (reviews.length > 0 && averageRating !== null) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: averageRating,
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
    schema.review = reviews.map(reviewSchema);
  }

  return schema;
}

export function buildBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
