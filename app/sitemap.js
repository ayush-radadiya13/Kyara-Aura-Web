import { categoryProductsPath, resolveCategoryId } from "@/lib/category-seo";
import { getCategories } from "@/lib/categories";
import { getAllProducts } from "@/lib/products";
import { absoluteUrl } from "@/lib/seo";

const staticRoutes = [
  "/",
  "/products",
  "/categories",
  "/collections",
  "/terms",
  "/privacy",
  "/shipping-policy",
  "/return-policy",
  "/forgot-password",
];

export default async function sitemap() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories(),
  ]);

  const staticEntries = staticRoutes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date(),
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));

  const productEntries = products.map((product) => ({
    url: absoluteUrl(`/products/${product.slug}`),
    lastModified: new Date(product.updated_at ?? product.updatedAt ?? Date.now()),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryEntries = categories.map((category) => {
    const categoryId = resolveCategoryId(category);

    return {
      url: absoluteUrl(categoryProductsPath(categoryId)),
      lastModified: new Date(category.updated_at ?? category.updatedAt ?? Date.now()),
      changeFrequency: "weekly",
      priority: 0.7,
    };
  });

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
