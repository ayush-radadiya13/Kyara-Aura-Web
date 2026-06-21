"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import { LoaderBlock } from "@/components/ui/loader";
import { useCategoryBySlug } from "@/hooks/use-categories";
import { categoryProductsPath } from "@/lib/category-seo";

function categoryImageSrc(image) {
  if (!image || typeof image !== "string") return "";
  if (image.startsWith("http")) return image;
  return image;
}

export default function CategoryDetail({ slug }) {
  const { data: category, isLoading, isError } = useCategoryBySlug(slug);

  if (isLoading) {
    return (
      <div>
        <Header />
        <section className="max-w-7xl mx-auto px-4 py-16">
          <LoaderBlock className="py-0" />
        </section>
      </div>
    );
  }

  if (isError || !category) {
    return (
      <div>
        <Header />
        <section className="max-w-7xl mx-auto px-4 py-16">
          <Link href="/categories" className="text-sm text-gold hover:text-gold-light transition-colors">
            Back to categories
          </Link>
          <p className="mt-8 text-gray-600">Category not found.</p>
        </section>
      </div>
    );
  }

  const src = categoryImageSrc(category.image);

  return (
    <div>
      <Header />

      <section className="max-w-7xl mx-auto px-4 py-16">
        <Link href="/categories" className="text-sm text-gold hover:text-gold-light transition-colors">
          Back to categories
        </Link>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative aspect-square rounded-xl overflow-hidden glass-card bg-gradient-to-br from-gold/20 via-gray-50 to-gray-100">
            {src ? (
              <Image
                src={src}
                alt={category.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <span className="font-display text-3xl text-gray-600/80 text-center">
                  {category.name}
                </span>
              </div>
            )}
          </div>

          <div>
            <p className="text-gold text-xs tracking-[0.25em] uppercase mb-3">Category</p>
            <h1 className="font-display text-3xl md:text-5xl text-gray-900 mb-5">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8">
                {category.description}
              </p>
            )}

            <Link
              href={categoryProductsPath(category._id)}
              className="inline-flex items-center justify-center btn-gold px-6 py-3 text-sm font-medium"
            >
              Shop this category
            </Link>
          </div>
        </div>
      </section>

      {category.children?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <h2 className="font-display text-2xl md:text-3xl text-gray-900 mb-8">
            Subcategories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {category.children.map((child) => (
              <Link
                key={child.id ?? child._id ?? child.slug}
                href={`/categories/${child.slug}`}
                className="rounded-lg glass-card p-4 text-center text-sm font-medium text-gray-900 hover:text-gold hover:shadow-gold-glow-sm transition-all"
              >
                {child.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
