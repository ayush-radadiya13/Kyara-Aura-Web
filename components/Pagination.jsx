"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

const ELLIPSIS = "ellipsis";

function getVisiblePages(currentPage, totalPages) {
  if (totalPages <= 1) return [];

  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage]);

  if (currentPage > 2) pages.add(currentPage - 1);
  if (currentPage < totalPages - 1) pages.add(currentPage + 1);
  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
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
  "inline-flex h-9 min-w-9 items-center justify-center rounded-xl border text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950/20 sm:h-10 sm:min-w-10";

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
      className={`mt-12 flex justify-center px-1 sm:mt-14 sm:px-2 ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <div className="inline-flex max-w-full items-center justify-center gap-1 rounded-2xl border border-gray-100 bg-white/90 p-1 shadow-sm shadow-gray-950/5 backdrop-blur-sm sm:gap-1.5 sm:p-1.5">
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
          className={`${pageButtonClass} gap-1 border-transparent bg-transparent px-2.5 text-gray-700 hover:bg-gray-50 hover:text-gray-950 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent disabled:hover:text-gray-300 sm:px-3.5`}
        >
          <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex max-w-[min(100%,16rem)] flex-wrap items-center justify-center gap-1 sm:max-w-none sm:gap-1.5">
          {visiblePages.map((page, index) =>
            page === ELLIPSIS ? (
              <span
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className="inline-flex h-9 min-w-7 items-center justify-center px-0.5 text-sm text-gray-400 sm:h-10 sm:min-w-9"
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
                    ? "border-gray-950 bg-gray-950 text-white shadow-sm"
                    : "border-transparent bg-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-950"
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
          className={`${pageButtonClass} gap-1 border-transparent bg-transparent px-2.5 text-gray-700 hover:bg-gray-50 hover:text-gray-950 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent disabled:hover:text-gray-300 sm:px-3.5`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
