import { apiUrl } from "@/lib/api-base";
import { normalizeProduct } from "@/lib/products";
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

function subcategoriesFromPayload(payload) {
  const data = payload?.data ?? payload;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { subcategories: [], products: [] };
  }

  const subCategories =
    Array.isArray(data.sub_category)
      ? data.sub_category
      : Array.isArray(data.sub_categories)
      ? data.sub_categories
      : Array.isArray(data.subcategories)
      ? data.subcategories
      : Array.isArray(data.children)
      ? data.children
      : [];

  const products =
    Array.isArray(data.product)
      ? data.product
      : Array.isArray(data.products)
      ? data.products
      : Array.isArray(data.items)
      ? data.items
      : [];

  return {
    subcategories: subCategories
      .filter((category) => category?.is_active !== false)
      .map(normalizeCategory),
    products: products
      .filter((product) => product?.is_active !== false)
      .map(normalizeProduct),
  };
}

export async function getCategorySubcategories(categoryId) {
  try {
    if (!categoryId) {
      return { subcategories: [], products: [] };
    }

    const payload = await fetchCategoryPayload(
      CATEGORY_API_ROUTES.SUBCATEGORIES(encodeURIComponent(categoryId)),
    );

    if (!payload) {
      return { subcategories: [], products: [] };
    }

    return subcategoriesFromPayload(payload);
  } catch {
    return { subcategories: [], products: [] };
  }
}
