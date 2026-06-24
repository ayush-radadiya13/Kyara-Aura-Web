"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

const ELLIPSIS = "ellipsis";

function getVisiblePages(currentPage, totalPages) {
  if (totalPages <= 1) return [];

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage]);

  if (currentPage > 2) pages.add(currentPage - 1);
  if (currentPage < totalPages - 1) pages.add(currentPage + 1);
  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
  }
  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
  }

  const sortedPages = [...pages].sort((a, b) => a - b);
  const items = [];

  for (let index = 0; index < sortedPages.length; index += 1) {
    const page = sortedPages[index];
    const previousPage = sortedPages[index - 1];

    if (index > 0 && page - previousPage > 1) {
      items.push(ELLIPSIS);
    }

    items.push(page);
  }

  return items;
}

const pageButtonClass =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950/20";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  ariaLabel = "Pagination",
  className = "",
}) {
  const visiblePages = useMemo(
    () => getVisiblePages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  if (totalPages <= 1) return null;

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  return (
    <nav
      className={`mt-12 flex justify-center px-2 ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-1 sm:gap-1.5">
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
          className={`${pageButtonClass} gap-1 border-gray-200 bg-white px-2.5 text-gray-700 hover:border-gray-950 hover:text-gray-950 disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-300 disabled:hover:border-gray-100 disabled:hover:text-gray-300 sm:px-3`}
        >
          <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
          {visiblePages.map((page, index) =>
            page === ELLIPSIS ? (
              <span
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className="inline-flex h-9 min-w-9 items-center justify-center px-1 text-sm text-gray-400"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
                className={`${pageButtonClass} ${
                  currentPage === page
                    ? "border-gray-950 bg-gray-950 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-950 hover:text-gray-950"
                }`}
              >
                {page}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
          className={`${pageButtonClass} gap-1 border-gray-200 bg-white px-2.5 text-gray-700 hover:border-gray-950 hover:text-gray-950 disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-300 disabled:hover:border-gray-100 disabled:hover:text-gray-300 sm:px-3`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
