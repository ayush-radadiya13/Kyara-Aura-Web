"use client";

import Image from "next/image";
import Link from "next/link";
import { DotLoaderBlock, LoaderBlock } from "@/components/ui/loader";
import { shouldShowQueryLoader } from "@/lib/query-loading";
import { useCategories } from "@/hooks/use-categories";
import { categoryProductsPath } from "@/lib/category-seo";

function categoryImageSrc(image) {
  if (!image || typeof image !== "string") return "";
  if (image.startsWith("http")) return image;
  return image;
}

function categoryHref(category) {
  const categoryId = category?._id ?? category?.id ?? category?.slug;
  return categoryId ? categoryProductsPath(categoryId) : "/products";
}

export default function CategoryGrid({
  variant = "grid",
  limit,
  selectedCategoryId,
  onCategorySelect,
  stackOnMobile = false,
  initialCategories,
  dotLoader = false,
}) {
  const categoriesQuery = useCategories({
    initialData: initialCategories,
  });
  const { data: categories = [], isError } = categoriesQuery;
  const visibleCategories = limit ? categories.slice(0, limit) : categories;

  if (shouldShowQueryLoader(categoriesQuery)) {
    const GridLoader = dotLoader ? DotLoaderBlock : LoaderBlock;
    return <GridLoader />;
  }

  if (isError || !visibleCategories.length) {
    return (
      <p className="text-gray-600 py-12 text-center">
        No categories available at the moment.
      </p>
    );
  }

  if (variant === "strip") {
    // Do not set touch-action: pan-x here — that blocks vertical page scroll when
    // the finger is over the category strip (common on mobile when it sits mid-viewport).
    const wrapperClassName = stackOnMobile
      ? "flex flex-col gap-5 pb-3 sm:grid sm:grid-cols-2 sm:pb-0 lg:grid-cols-3"
      : "-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden";
    const mobileCardClassName = stackOnMobile
      ? "w-full"
      : "w-[78vw] max-w-[22rem] shrink-0 snap-start";

    return (
      <div
        className={wrapperClassName}
        data-lenis-prevent-horizontal
      >
        {visibleCategories.map((category) => {
          const src = categoryImageSrc(category.image);
          const isSelected = String(selectedCategoryId ?? "") === String(category._id ?? "");
          const interactiveClassName = `group relative aspect-[1.75] ${mobileCardClassName} overflow-hidden rounded-2xl bg-[#f7f3ed] text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-950/10 focus:outline-none focus:ring-2 focus:ring-gray-900/30 sm:w-auto sm:max-w-none ${
            isSelected ? "ring-2 ring-gray-950 ring-offset-2 ring-offset-white" : ""
          }`;
          const content = (
            <>
              {src ? (
                <Image
                  src={src}
                  alt={category.name}
                  fill
                  className="pointer-events-none object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  draggable={false}
                />
              ) : (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#fbf8f2] via-[#f4eee5] to-[#ece2d6]">
                  <span className="font-display text-5xl text-gray-300">
                    {category.name?.charAt(0)}
                  </span>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition duration-300 group-hover:from-black/75" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                <span className="font-display text-2xl font-light leading-none sm:text-3xl">
                  {category.name}
                </span>
              </div>
            </>
          );

          return onCategorySelect ? (
            <button
              key={category._id}
              type="button"
              onClick={() => onCategorySelect(category)}
              aria-pressed={isSelected}
              className={interactiveClassName}
            >
              {content}
            </button>
          ) : (
            <Link
              key={category._id}
              href={categoryHref(category)}
              className={interactiveClassName}
            >
              {content}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {visibleCategories.map((category) => {
        const src = categoryImageSrc(category.image);
        const isSelected = String(selectedCategoryId ?? "") === String(category._id ?? "");
        const interactiveClassName = `group relative aspect-square rounded-lg overflow-hidden glass-card transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 focus:ring-offset-white ${
          isSelected ? "shadow-gold-glow-sm ring-2 ring-gold/70 ring-offset-2 ring-offset-white" : "hover:shadow-gold-glow-sm"
        }`;
        const content = (
          <>
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
            <div className={`absolute inset-0 bg-gradient-to-t ${
              isSelected ? "from-black/75 via-black/10 to-transparent" : "from-black/60 via-transparent to-transparent"
            }`} />
            <span className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 font-medium text-white text-xs sm:text-sm text-center">
              {category.name}
            </span>
          </>
        );

        return onCategorySelect ? (
          <button
            key={category._id}
            type="button"
            onClick={() => onCategorySelect(category)}
            aria-pressed={isSelected}
            className={interactiveClassName}
          >
            {content}
          </button>
        ) : (
          <Link
            key={category._id}
            href={categoryHref(category)}
            className={interactiveClassName}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
