export function categorySeoDescription(category) {
  if (category?.description) return category.description;
  const name = category?.name || "jewellery";
  return `Explore Kayra Aura ${name.toLowerCase()} with elegant fashion jewellery pieces designed for daily wear, gifting, and special occasions.`;
}

export function categoryProductsPath(categoryId) {
  return `/products?category=${encodeURIComponent(categoryId)}`;
}

export function categorySubcategoriesPath(category) {
  if (category == null || category === "") return "/categories";

  if (typeof category === "string" || typeof category === "number") {
    return `/categories/${encodeURIComponent(String(category))}`;
  }

  const slug = category.slug ?? category._id ?? category.id;
  return slug ? `/categories/${encodeURIComponent(String(slug))}` : "/categories";
}

export function resolveCategoryId(category) {
  return category?._id ?? category?.id ?? category?.slug ?? "";
}

export function resolveCategorySlug(category) {
  return category?.slug ?? category?._id ?? category?.id ?? "";
}

function categoryMatchesParam(category, categoryId) {
  const values = [category._id, category.id, category.slug]
    .filter(Boolean)
    .map(String);
  return values.includes(String(categoryId));
}

export function findMainCategoryByParam(categories, categoryId) {
  if (!categoryId) return null;

  return (
    categories.find((category) => categoryMatchesParam(category, categoryId)) ??
    null
  );
}

export function findCategoryByParam(categories, categoryId) {
  if (!categoryId) return null;

  for (const category of categories) {
    if (categoryMatchesParam(category, categoryId)) {
      return category;
    }

    if (Array.isArray(category.children)) {
      const child = category.children.find((item) =>
        categoryMatchesParam(item, categoryId),
      );
      if (child) return child;
    }
  }

  return null;
}

export async function getSelectedCategoryFromParams(searchParams, getCategories) {
  const params = await searchParams;
  const categoryId = Array.isArray(params?.category)
    ? params.category[0]
    : params?.category;

  if (!categoryId || typeof categoryId !== "string") return null;

  const categories = await getCategories();
  return findCategoryByParam(categories, categoryId);
}
