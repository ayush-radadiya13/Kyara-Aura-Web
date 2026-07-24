import { normalizeProduct } from "@/lib/products";
import { CATEGORY_API_ROUTES } from "@/lib/routes";
import { withoutTokenApi } from "@/utils/api";

export function normalizeCategory(category) {
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

export async function getCategoriesApi(type) {
  const { data } = await withoutTokenApi.get(CATEGORY_API_ROUTES.LIST, {
    params: type ? { type } : undefined,
  });
  const categories = Array.isArray(data?.data) ? data.data : [];

  return categories
    .filter((category) => category?.is_active !== false)
    .map(normalizeCategory);
}

export async function getCategoryBySlugApi(categorySlug) {
  if (!categorySlug) {
    return null;
  }

  const { data } = await withoutTokenApi.get(
    CATEGORY_API_ROUTES.DETAIL(encodeURIComponent(categorySlug))
  );

  if (!data?.data || data.data.is_active === false) {
    return null;
  }

  return normalizeCategory(data.data);
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

export async function getCategorySubcategoriesApi(categoryId) {
  if (!categoryId) {
    return { subcategories: [], products: [] };
  }

  const { data } = await withoutTokenApi.get(
    CATEGORY_API_ROUTES.SUBCATEGORIES(encodeURIComponent(categoryId)),
  );

  return subcategoriesFromPayload(data);
}
