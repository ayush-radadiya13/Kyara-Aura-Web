"use client";

import Link from "next/link";
import { useCategories } from "@/hooks/use-categories";
import { categoryProductsPath } from "@/lib/category-seo";

export default function ProductCategoryNav({ activeCategoryId }) {
  const { data: categories = [] } = useCategories();
  const visibleCategories = categories.map((category) => ({
    id: category._id,
    name: category.name,
  }));

  return (
    <nav
      aria-label="Product categories"
      className=" -mx-4 flex snap-x snap-mandatory items-center justify-start gap-3 overflow-x-auto px-4 pb-2 text-[14px] font-semibold uppercase text-gray-950 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
      data-lenis-prevent-horizontal
    >
      <span className="flex shrink-0 snap-start items-center gap-3">
        <Link
          href="/products"
          aria-current={!activeCategoryId ? "page" : undefined}
          className={`transition hover:text-gray-950 ${
            !activeCategoryId ? "font-medium text-gray-950" : ""
          }`}
        >
          All
        </Link>
        {visibleCategories.length ? <span aria-hidden="true">|</span> : null}
      </span>
      {visibleCategories.map((category, index) => {
        const isActive = category.id && category.id === activeCategoryId;
        const href = category.id
          ? categoryProductsPath(category.id)
          : "/products";

        return (
          <span key={category.id || category.name} className="flex shrink-0 snap-start items-center gap-3">
            <Link
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`transition hover:text-gray-950 ${
                isActive ? "font-medium text-gray-950" : ""
              }`}
            >
              {category.name}
            </Link>
            {index < visibleCategories.length - 1 ? <span aria-hidden="true">|</span> : null}
          </span>
        );
      })}
    </nav>
  );
}
