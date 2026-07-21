import {
  categoryProductsPath,
  categorySubcategoriesPath,
  resolveCategoryId,
} from "@/lib/category-seo";
import { getCategories } from "@/lib/categories";
import { getAllProducts } from "@/lib/products";
import { absoluteUrl } from "@/lib/seo";

const staticRoutes = [
  "/",
  "/products",
  "/categories",
  "/collections",
  "/about",
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

  const categoryEntries = categories.flatMap((category) => {
    const mainEntry = {
      url: absoluteUrl(categorySubcategoriesPath(category)),
      lastModified: new Date(category.updated_at ?? category.updatedAt ?? Date.now()),
      changeFrequency: "weekly",
      priority: 0.7,
    };

    const subEntries = (category.children ?? []).map((child) => {
      const childId = resolveCategoryId(child);

      return {
        url: absoluteUrl(categoryProductsPath(childId)),
        lastModified: new Date(child.updated_at ?? child.updatedAt ?? Date.now()),
        changeFrequency: "weekly",
        priority: 0.7,
      };
    });

    return [mainEntry, ...subEntries];
  });

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
