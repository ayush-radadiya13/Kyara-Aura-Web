"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Grid2X2, List, X } from "lucide-react";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { DotLoaderBlock, LoaderBlock } from "@/components/ui/loader";
import {
  useCollectionProducts,
  useFeaturedProducts,
  useProducts,
} from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useSizes } from "@/hooks/use-sizes";
import {
  useAddWishlistItem,
  useDeleteWishlistItem,
  useWishlist,
} from "@/hooks/use-wishlist";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useAuthStore } from "@/store/auth-store";

const PRICE_FILTER_MIN = 0;
const PRICE_FILTER_MAX = 5000;

function normalizeFilterValue(value) {
  return String(value ?? "").trim().toLowerCase();
}

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getCategoryKeys(product) {
  return [
    product.category_id,
    product.categoryId,
    product.category?.id,
    product.category?._id,
    product.category?.slug,
  ]
    .filter((value) => value !== undefined && value !== null && value !== "")
    .map((value) => String(value));
}

function getProductPrices(product) {
  const sizePrices = Array.isArray(product?.sizes)
    ? product.sizes.map((size) => toFiniteNumber(size.price)).filter((price) => price > 0)
    : [];
  const productPrice = toFiniteNumber(product?.price);

  return productPrice > 0 ? [productPrice, ...sizePrices] : sizePrices;
}

function getProductSizeKeys(product) {
  if (!Array.isArray(product?.sizes)) return [];

  return product.sizes.flatMap((size) => [
    size.masterSizeId,
    size.size_id,
    size.master_size_id,
    size.sizeId,
    normalizeFilterValue(size.label),
    normalizeFilterValue(size.value),
    normalizeFilterValue(size.size_text),
    normalizeFilterValue(size.name),
  ]).filter(Boolean).map(String);
}

function PriceRangeSlider({ value, onChange }) {
  const [minValue, maxValue] = value;
  const minPercent = ((minValue - PRICE_FILTER_MIN) / (PRICE_FILTER_MAX - PRICE_FILTER_MIN)) * 100;
  const maxPercent = ((maxValue - PRICE_FILTER_MIN) / (PRICE_FILTER_MAX - PRICE_FILTER_MIN)) * 100;
  const rangeStyle = {
    left: `${minPercent}%`,
    width: `${Math.max(maxPercent - minPercent, 0)}%`,
  };

  const updateMin = (event) => {
    const nextMin = Math.min(toFiniteNumber(event.target.value), maxValue);
    onChange([nextMin, maxValue]);
  };

  const updateMax = (event) => {
    const nextMax = Math.max(toFiniteNumber(event.target.value), minValue);
    onChange([minValue, nextMax]);
  };

  return (
    <div className="pt-7">
      <div className="relative h-10">
        <div className="absolute top-5 h-1 w-full rounded-full bg-gray-200" />
        <div className="absolute top-5 h-1 rounded-full bg-gray-950" style={rangeStyle} />
        <span
          className="absolute top-0 -translate-x-1/2 rounded-md bg-gray-950 px-2 py-1 text-xs font-semibold text-white"
          style={{ left: `${minPercent}%` }}
        >
          {minValue}
        </span>
        <span
          className="absolute top-0 -translate-x-1/2 rounded-md bg-gray-950 px-2 py-1 text-xs font-semibold text-white"
          style={{ left: `${maxPercent}%` }}
        >
          {maxValue}
        </span>
        <input
          type="range"
          min={PRICE_FILTER_MIN}
          max={PRICE_FILTER_MAX}
          step="50"
          value={minValue}
          onChange={updateMin}
          aria-label="Minimum price"
          className="pointer-events-none absolute top-4 z-20 h-2 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-gray-950 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-gray-950"
        />
        <input
          type="range"
          min={PRICE_FILTER_MIN}
          max={PRICE_FILTER_MAX}
          step="50"
          value={maxValue}
          onChange={updateMax}
          aria-label="Maximum price"
          className="pointer-events-none absolute top-4 z-30 h-2 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-gray-950 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-gray-950"
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>₹{PRICE_FILTER_MIN.toLocaleString("en-IN")}</span>
        <span>₹{PRICE_FILTER_MAX.toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}

function FilterDropdown({ label, displayLabel, openFilter, onToggle, children, panelClassName = "w-72" }) {
  const isOpen = openFilter === label;
  const triggerLabel = displayLabel ?? label;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onToggle(label)}
        aria-expanded={isOpen}
        className="flex items-center gap-8 text-[14px] text-gray-800 transition hover:text-gray-950"
      >
        <span className="max-w-32 truncate">{triggerLabel}</span>
        <ChevronDown className={`h-3 w-3 text-gray-400 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen ? (
        <div
          className={`absolute left-0 top-full z-30 mt-4 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-100 bg-white p-3 text-left shadow-xl shadow-gray-950/10 ${panelClassName}`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export default function ProductList({
  categoryId,
  collection = false,
  featured = false,
  gridClassName,
  limit,
  offset = 0,
  emptyMessage = "No products available at the moment.",
  variant = "default",
  pageSize = 12,
  initialProducts,
}) {
  const isCatalog = variant === "catalog";
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId ?? "");
  const [selectedSizeKeys, setSelectedSizeKeys] = useState([]);
  const [priceRange, setPriceRange] = useState([PRICE_FILTER_MIN, PRICE_FILTER_MAX]);
  const [openFilter, setOpenFilter] = useState("");
  const [wishlistActionProductId, setWishlistActionProductId] = useState(null);
  const { requireAuth } = useAuthRedirect();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const wishlistQuery = useWishlist({
    enabled: isHydrated && isAuthenticated,
  });
  const addWishlistItem = useAddWishlistItem();
  const deleteWishlistItem = useDeleteWishlistItem();
  const allProductsQuery = useProducts({
    enabled: !featured && !collection,
    ...(initialProducts && !featured && !collection
      ? { initialData: initialProducts }
      : {}),
  });
  const featuredProductsQuery = useFeaturedProducts({
    enabled: featured && !collection,
    ...(initialProducts && featured && !collection
      ? { initialData: initialProducts }
      : {}),
  });
  const collectionProductsQuery = useCollectionProducts({
    enabled: collection,
    ...(initialProducts && collection ? { initialData: initialProducts } : {}),
  });
  const { data: categories = [], isLoading: categoriesLoading } = useCategories({
    enabled: isCatalog,
  });
  const { data: sizes = [], isLoading: sizesLoading } = useSizes({
    enabled: isCatalog,
  });

  const query = collection
    ? collectionProductsQuery
    : featured
    ? featuredProductsQuery
    : allProductsQuery;
  const rawProducts = useMemo(() => query.data ?? [], [query.data]);
  const filteredProducts = useMemo(() => {
    if (!isCatalog) return rawProducts;

    const selectedCategory = String(selectedCategoryId ?? "");
    const selectedSizeSet = new Set(selectedSizeKeys.map(String));
    const [minPrice, maxPrice] = priceRange;

    return rawProducts.filter((product) => {
      const categoryMatches =
        !selectedCategory || getCategoryKeys(product).includes(selectedCategory);
      const sizeMatches =
        !selectedSizeSet.size ||
        getProductSizeKeys(product).some((sizeKey) => selectedSizeSet.has(sizeKey));
      const productPrices = getProductPrices(product);
      const priceMatches =
        !productPrices.length ||
        productPrices.some((price) => price >= minPrice && price <= maxPrice);

      return categoryMatches && sizeMatches && priceMatches;
    });
  }, [isCatalog, priceRange, rawProducts, selectedCategoryId, selectedSizeKeys]);
  const products = limit
    ? filteredProducts.slice(offset, offset + limit)
    : offset
      ? filteredProducts.slice(offset)
      : filteredProducts;
  const shouldPaginate = !limit && products.length > pageSize;
  const totalPages = shouldPaginate ? Math.ceil(products.length / pageSize) : 1;
  const activePage = Math.min(currentPage, totalPages);
  const visibleProducts = shouldPaginate
    ? products.slice((activePage - 1) * pageSize, activePage * pageSize)
    : products;
  const resultStart = products.length ? (activePage - 1) * pageSize + 1 : 0;
  const resultEnd = Math.min(activePage * pageSize, products.length);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const selectedSizeSet = useMemo(() => new Set(selectedSizeKeys), [selectedSizeKeys]);
  const selectedCategoryLabel = useMemo(() => {
    if (!selectedCategoryId) return "";

    return categories.find((category) => String(category._id) === String(selectedCategoryId))?.name ?? "";
  }, [categories, selectedCategoryId]);
  const selectedSizeLabel = useMemo(() => {
    if (!selectedSizeKeys.length) return "";

    return sizes.find((size) => {
      const sizeKeys = [String(size._id), normalizeFilterValue(size.name)].filter(Boolean);

      return sizeKeys.some((sizeKey) => selectedSizeSet.has(sizeKey));
    })?.name ?? "";
  }, [selectedSizeKeys.length, selectedSizeSet, sizes]);
  const hasActiveFilters =
    Boolean(selectedCategoryId) ||
    selectedSizeKeys.length > 0 ||
    priceRange[0] !== PRICE_FILTER_MIN ||
    priceRange[1] !== PRICE_FILTER_MAX;

  const wishlistByProductId = useMemo(() => {
    const map = new Map();

    for (const item of wishlistQuery.data ?? []) {
      const productId =
        item.productId ?? item.product?._id ?? item.product?.id;

      if (productId) {
        map.set(String(productId), item);
      }
    }

    return map;
  }, [wishlistQuery.data]);

  const getProductId = (product) => String(product?._id ?? product?.id ?? "");

  const handleWishlistClick = async (product) => {
    if (!requireAuth()) return;

    const productId = getProductId(product);
    if (!productId) return;

    const existingItem = wishlistByProductId.get(productId);
    setWishlistActionProductId(productId);

    try {
      if (existingItem) {
        await deleteWishlistItem.mutateAsync(
          existingItem.wishlistItemId ?? existingItem.id,
        );
        return;
      }

      await addWishlistItem.mutateAsync(productId);
    } catch (error) {
      console.error(error);
    } finally {
      setWishlistActionProductId(null);
    }
  };

  const handlePriceRangeChange = (nextRange) => {
    setPriceRange(nextRange);
    setCurrentPage(1);
  };

  const handleCategoryChange = (nextCategoryId) => {
    setSelectedCategoryId(nextCategoryId);
    setCurrentPage(1);
  };

  const toggleFilter = (filterName) => {
    setOpenFilter((currentFilter) => (currentFilter === filterName ? "" : filterName));
  };

  const toggleSize = (size) => {
    const sizeKeys = [String(size._id), normalizeFilterValue(size.name)].filter(Boolean);

    setSelectedSizeKeys((currentKeys) => {
      const hasSize = sizeKeys.some((sizeKey) => currentKeys.includes(sizeKey));

      if (hasSize) {
        return [];
      }

      return sizeKeys;
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedCategoryId("");
    setSelectedSizeKeys([]);
    setPriceRange([PRICE_FILTER_MIN, PRICE_FILTER_MAX]);
    setOpenFilter("");
    setCurrentPage(1);
  };

  if (query.isLoading && !query.data?.length) {
    const ListLoader = isCatalog ? DotLoaderBlock : LoaderBlock;
    return <ListLoader />;
  }

  if (query.isError || !rawProducts.length) {
    return (
      <p className="text-gray-600 py-12 text-center">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div >
      {isCatalog && (
        <div className="mb-10 max-w-6xl flex flex-col gap-5 border-y border-gray-100 py-5 text-[14px] text-gray-800 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
          <p>
            Showing {resultStart}-{resultEnd} of {products.length} results.
          </p>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between lg:gap-9">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <FilterDropdown
                label="Price"
                openFilter={openFilter}
                onToggle={toggleFilter}
                panelClassName="w-80"
              >
                <PriceRangeSlider value={priceRange} onChange={handlePriceRangeChange} />
                <p className="mt-3 text-xs text-gray-500">
                  Filtering products between ₹{priceRange[0].toLocaleString("en-IN")} and ₹{priceRange[1].toLocaleString("en-IN")}.
                </p>
              </FilterDropdown>

              <FilterDropdown
                label="Category"
                displayLabel={selectedCategoryLabel || undefined}
                openFilter={openFilter}
                onToggle={toggleFilter}
                panelClassName="w-40"
              >
                <div className="flex max-h-72 flex-col overflow-y-auto" data-lenis-prevent>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange("")}
                    className={`rounded-xl px-3 py-2 text-left text-sm transition ${
                      !selectedCategoryId
                        ? "bg-gray-950 font-semibold text-white"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-950"
                    }`}
                  >
                    All Categories
                  </button>
                  {categoriesLoading ? (
                    <span className="px-4 py-2 text-xs text-gray-500">Loading categories...</span>
                  ) : (
                    categories.map((category) => (
                      <button
                        key={category._id}
                        type="button"
                        onClick={() => handleCategoryChange(String(category._id))}
                        className={`rounded-xl px-3 py-2 text-left text-sm transition ${
                          String(selectedCategoryId) === String(category._id)
                            ? "bg-gray-950 font-semibold text-white"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-950"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))
                  )}
                </div>
              </FilterDropdown>

              <FilterDropdown
                label="Size"
                displayLabel={selectedSizeLabel || undefined}
                openFilter={openFilter}
                onToggle={toggleFilter}
                panelClassName="w-36"
              >
                <div className="flex max-h-72 flex-col overflow-y-auto" data-lenis-prevent>
                  {sizesLoading ? (
                    <span className="px-3 py-2 text-xs text-gray-500">Loading sizes...</span>
                  ) : sizes.length ? (
                    sizes.map((size) => {
                      const sizeKeys = [String(size._id), normalizeFilterValue(size.name)].filter(Boolean);
                      const isSelected = sizeKeys.some((sizeKey) => selectedSizeSet.has(sizeKey));

                      return (
                        <button
                          key={size._id}
                          type="button"
                          onClick={() => toggleSize(size)}
                          aria-pressed={isSelected}
                          className={`rounded-xl px-3 py-2 text-left text-sm transition ${
                            isSelected
                              ? "bg-gray-950 font-semibold text-white"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-950"
                          }`}
                        >
                          {size.name}
                        </button>
                      );
                    })
                  ) : (
                    <span className="px-3 py-2 text-xs text-gray-500">No sizes available.</span>
                  )}
                </div>
              </FilterDropdown>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  aria-label="Clear filters"
                  title="Clear filters"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-950 text-white transition hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

        </div>
      )}

      {!products.length ? (
        <p className="py-12 text-center text-gray-600">
          No products match the selected filters.
        </p>
      ) : null}

      {products.length ? (
        <div
          className={
            gridClassName ??
            (isCatalog
              ? "grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 lg:grid-cols-4"
              : variant === "editorial"
              ? "grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
              : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6")
          }
        >
          {visibleProducts.map((product) => {
            const productId = getProductId(product);
            const wishlistItem = wishlistByProductId.get(productId);
            const isWishlistBusy =
              wishlistActionProductId === productId &&
              (addWishlistItem.isPending || deleteWishlistItem.isPending);

            return (
              <ProductCard
                key={product._id}
                product={product}
                variant={isCatalog ? "editorial" : variant}
                wishlistActive={Boolean(wishlistItem)}
                wishlistItemId={wishlistItem?.wishlistItemId ?? wishlistItem?.id}
                onWishlistClick={handleWishlistClick}
                wishlistBusy={isWishlistBusy}
              />
            );
          })}
        </div>
      ) : null}

      {shouldPaginate ? (
        <Pagination
          currentPage={activePage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          ariaLabel={collection ? "Collections pagination" : "Products pagination"}
        />
      ) : null}
    </div>
  );
}
