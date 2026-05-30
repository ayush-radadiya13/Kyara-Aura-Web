import { CATEGORY_API_ROUTES } from "@/lib/routes";
import { withoutTokenApi } from "@/utils/api";

export function normalizeCategory(category) {
  const id = category.id ?? category._id;

  return {
    ...category,
    _id: String(id),
    image: category.image_url || category.image || "",
  };
}

export async function getCategoriesApi() {
  const { data } = await withoutTokenApi.get(CATEGORY_API_ROUTES.LIST);
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
