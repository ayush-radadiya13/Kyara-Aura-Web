"use client";

import ProductCard from "@/components/ProductCard";
import { LoaderBlock } from "@/components/ui/loader";
import {
  useFeaturedProducts,
  useProducts,
  useProductsByCategory,
} from "@/hooks/use-products";

export default function ProductList({
  categoryId,
  featured = false,
  limit,
  emptyMessage = "No products available at the moment.",
}) {
  const allProductsQuery = useProducts({
    enabled: !categoryId && !featured,
  });
  const categoryProductsQuery = useProductsByCategory(categoryId, {
    enabled: Boolean(categoryId),
  });
  const featuredProductsQuery = useFeaturedProducts({
    enabled: featured,
  });

  const query = featured
    ? featuredProductsQuery
    : categoryId
      ? categoryProductsQuery
      : allProductsQuery;
  const products = limit ? (query.data ?? []).slice(0, limit) : query.data ?? [];

  if (query.isLoading) {
    return <LoaderBlock />;
  }

  if (query.isError || !products.length) {
    return (
      <p className="text-gray-600 py-12 text-center">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
