"use client";

import Image from "next/image";
import Link from "next/link";
import { LoaderBlock } from "@/components/ui/loader";
import { useCategories } from "@/hooks/use-categories";

function categoryImageSrc(image) {
  if (!image || typeof image !== "string") return "";
  if (image.startsWith("http")) return image;
  return image;
}

export default function CategoryGrid() {
  const { data: categories = [], isLoading, isError } = useCategories();

  if (isLoading) {
    return <LoaderBlock />;
  }

  if (isError || !categories.length) {
    return (
      <p className="text-gray-600 py-12 text-center">
        No categories available at the moment.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {categories.map((category) => {
        const src = categoryImageSrc(category.image);

        return (
          <Link
            key={category._id}
            href={`/categories/${category.slug}`}
            className="group relative aspect-square rounded-lg overflow-hidden glass-card hover:shadow-gold-glow-sm transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 focus:ring-offset-white"
          >
            {src ? (
              <Image
                src={src}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-gray-50 to-gray-100 flex items-center justify-center p-4">
                <span className="font-display text-sm sm:text-lg text-gray-600/80 text-center">
                  {category.name}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 font-medium text-white text-xs sm:text-sm text-center">
              {category.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
