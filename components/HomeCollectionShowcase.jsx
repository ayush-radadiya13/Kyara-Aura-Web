"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useCollectionProducts } from "@/hooks/use-products";
import { LoaderBlock } from "@/components/ui/loader";

function imageUrlFromValue(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.image_url || value.image_path || "";
}

function getProductImageSrc(product) {
  const imageSources = [product.images, product.image, product.product_images, product.productImages];
  const imageList = imageSources.find((source) => Array.isArray(source) && source.length);
  const primaryImage = imageList?.find((image) => image?.is_primary) ?? imageList?.[0];

  return (
    imageUrlFromValue(primaryImage) ||
    imageUrlFromValue(product.image) ||
    product.image_url ||
    product.image_path ||
    ""
  );
}

function getProductUpdatedTime(product) {
  const updatedValue =
    product.updated_at ??
    product.updatedAt ??
    product.modified_at ??
    product.modifiedAt ??
    product.created_at ??
    product.createdAt;
  const timestamp = new Date(updatedValue).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function ProductPrice({ product, className = "" }) {
  const originalPrice = product.oldPrice ?? product.originalPrice;
  const hasDiscount = originalPrice && originalPrice > product.price;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {hasDiscount ? (
        <span className="text-gray-400 line-through">
          Rs. {originalPrice.toLocaleString("en-IN")}
        </span>
      ) : null}
      <span className={hasDiscount ? "font-semibold text-gray-950" : "text-gray-600"}>
        Rs. {product.price?.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

function ProductImage({ product, imageSrc, sizes, className = "" }) {
  return imageSrc ? (
    <Image
      src={imageSrc}
      alt={product.name}
      fill
      className={`object-cover transition duration-500 group-hover:scale-105 ${className}`}
      sizes={sizes}
    />
  ) : (
    <span className="flex h-full items-center justify-center text-xs text-gray-400">
      No image
    </span>
  );
}

export default function HomeCollectionShowcase({
  limit = 4,
  emptyMessage = "No collection products available at the moment.",
}) {
  const { data: products = [], isLoading, isError } = useCollectionProducts();
  const latestProducts = useMemo(
    () =>
      [...products]
        .sort((first, second) => getProductUpdatedTime(second) - getProductUpdatedTime(first))
        .slice(0, limit),
    [limit, products],
  );

  if (isLoading) {
    return <LoaderBlock />;
  }

  if (isError || !latestProducts.length) {
    return <p className="py-12 text-center text-sm text-gray-600">{emptyMessage}</p>;
  }

  const [featuredProduct, ...sideProducts] = latestProducts;
  const featuredImageSrc = getProductImageSrc(featuredProduct);

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
      <Link
        href={`/products/${featuredProduct.slug}`}
        className="home-shine group relative block aspect-[1.1] overflow-hidden bg-[#f6f3ef]"
        aria-label={featuredProduct.name}
      >
        <ProductImage
          product={featuredProduct}
          imageSrc={featuredImageSrc}
          sizes="(max-width: 1024px) 100vw, 46vw"
        />
        <div className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-4 bg-white/90 px-2 py-2 shadow-lg shadow-gray-950/10 backdrop-blur">
          <h3 className="min-w-0 flex-1 text-lg font-semibold text-gray-950 transition group-hover:text-gray-600">
            {featuredProduct.name}
          </h3>
          <ProductPrice product={featuredProduct} className="shrink-0 justify-end text-right text-sm" />
        </div>
      </Link>

      <div className="home-reveal" style={{ "--home-delay": "180ms" }}>
        <p className="mb-3 text-[10px] uppercase tracking-[0.32em] text-gray-400">New story</p>
        <h2 className="font-display text-4xl font-light text-gray-950 transition duration-300 hover:tracking-[-0.02em] sm:text-5xl">
          EVE Collection
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
          Embrace the enchanting allure of the EVE Collection, a limited edition jewellery line
          that intertwines graceful symbolism with a modern golden glow.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {sideProducts.map((product, index) => {
        const imageSrc = getProductImageSrc(product);
        const href = `/products/${product.slug}`;

        return (
          <Link
            key={product._id ?? product.id ?? product.slug}
            href={href}
            className="home-reveal group block overflow-hidden bg-[#f4f4f3] transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-950/10"
            style={{ "--home-delay": `${220 + index * 70}ms` }}
          >
            <div className="relative aspect-[1.08] overflow-hidden bg-[#f7f7f5]">
              <ProductImage
                product={product}
                imageSrc={imageSrc}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 34vw, 18vw"
              />
            </div>

            <div className="bg-[#f4f4f3] px-4 py-4 sm:px-5">
              <h3 className="text-base font-semibold text-gray-950 transition group-hover:text-gray-600">
                {product.name}
              </h3>
              <ProductPrice product={product} className="mt-2 text-sm" />
            </div>
          </Link>
        );
          })}
        </div>
      </div>
    </div>
  );
}
