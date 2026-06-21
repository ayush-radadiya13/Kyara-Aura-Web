export function categorySeoDescription(category) {
  if (category?.description) return category.description;
  const name = category?.name || "jewellery";
  return `Explore Kayra Aura ${name.toLowerCase()} with elegant fashion jewellery pieces designed for daily wear, gifting, and special occasions.`;
}

export function categoryProductsPath(categoryId) {
  return `/products?category=${encodeURIComponent(categoryId)}`;
}

export function resolveCategoryId(category) {
  return category?._id ?? category?.id ?? category?.slug ?? "";
}

export function findCategoryByParam(categories, categoryId) {
  if (!categoryId) return null;

  return (
    categories.find((category) => {
      const values = [category._id, category.id, category.slug]
        .filter(Boolean)
        .map(String);
      return values.includes(String(categoryId));
    }) ?? null
  );
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
