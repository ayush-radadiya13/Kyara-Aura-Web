import { CATEGORY_API_ROUTES } from "@/lib/routes";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://kayraaura.up.railway.app";

function apiUrl(path) {
  return `${API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

function normalizeCategory(category) {
  const id = category.id ?? category._id;

  return {
    ...category,
    _id: String(id),
    image: category.image_url || category.image || "",
  };
}

async function fetchCategoryPayload(path) {
  const response = await fetch(apiUrl(path), {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function getCategories() {
  try {
    const payload = await fetchCategoryPayload(CATEGORY_API_ROUTES.LIST);
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
