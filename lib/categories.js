import { apiUrl } from "@/lib/api-base";
import { CATEGORY_API_ROUTES } from "@/lib/routes";
import { serverFetch } from "@/lib/server-fetch";

function normalizeCategory(category) {
  const id = category.id ?? category._id;
  const children = Array.isArray(category.children)
    ? category.children
        .filter((child) => child?.is_active !== false)
        .map(normalizeCategory)
    : category.children;

  return {
    ...category,
    _id: String(id),
    image: category.image_url || category.image || "",
    ...(children ? { children } : {}),
  };
}

async function fetchCategoryPayload(path) {
  const response = await serverFetch(apiUrl(path), {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function getCategories(type) {
  try {
    const path = type
      ? `${CATEGORY_API_ROUTES.LIST}?type=${encodeURIComponent(type)}`
      : CATEGORY_API_ROUTES.LIST;
    const payload = await fetchCategoryPayload(path);
    const categories = Array.isArray(payload?.data) ? payload.data : [];

    return categories
      .filter((category) => category?.is_active !== false)
      .map(normalizeCategory);
  } catch {
    return [];
  }
}

export async function getCategoryBySlug(categorySlug) {
  try {
    if (!categorySlug) {
      return null;
    }

    const payload = await fetchCategoryPayload(
      CATEGORY_API_ROUTES.DETAIL(encodeURIComponent(categorySlug))
    );

    if (!payload?.data || payload.data.is_active === false) {
      return null;
    }

    return normalizeCategory(payload.data);
  } catch {
    return null;
  }
}
