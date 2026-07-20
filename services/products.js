import { PRODUCT_API_ROUTES } from "@/lib/routes";
import {
  DEFAULT_PRODUCTS_PER_PAGE,
  normalizeProduct,
  paginationFromPayload,
  productsFromPayload,
} from "@/lib/products";
import { withoutTokenApi } from "@/utils/api";

function normalizeProductsPayload(payload) {
  return productsFromPayload(payload)
    .filter((product) => product?.is_active !== false)
    .map(normalizeProduct);
}

async function fetchProductsPage(path, { page = 1, perPage = DEFAULT_PRODUCTS_PER_PAGE } = {}) {
  const { data } = await withoutTokenApi.get(path, {
    params: {
      page,
      per_page: perPage,
    },
  });

  const products = normalizeProductsPayload(data);

  return {
    products,
    pagination: paginationFromPayload(data, {
      currentPage: page,
      lastPage: 1,
      perPage,
      total: products.length,
    }),
  };
}

export async function getProductsApi({
  page = 1,
  perPage = DEFAULT_PRODUCTS_PER_PAGE,
} = {}) {
  return fetchProductsPage(PRODUCT_API_ROUTES.LIST, { page, perPage });
}

export async function getFeaturedProductsApi() {
  const { products } = await fetchProductsPage(PRODUCT_API_ROUTES.FEATURED, {
    page: 1,
    perPage: DEFAULT_PRODUCTS_PER_PAGE,
  });
  return products;
}

export async function getCollectionProductsApi() {
  const { products } = await fetchProductsPage(PRODUCT_API_ROUTES.COLLECTION, {
    page: 1,
    perPage: DEFAULT_PRODUCTS_PER_PAGE,
  });
  return products;
}

export async function getProductsByCategoryApi(
  categoryId,
  { page = 1, perPage = DEFAULT_PRODUCTS_PER_PAGE } = {},
) {
  if (!categoryId) {
    return getProductsApi({ page, perPage });
  }

  return fetchProductsPage(
    PRODUCT_API_ROUTES.CATEGORY(encodeURIComponent(categoryId)),
    { page, perPage },
  );
}

export async function searchProductsByNameApi(name) {
  const trimmedName = String(name ?? "").trim();

  if (!trimmedName) {
    return [];
  }

  const { data } = await withoutTokenApi.get(PRODUCT_API_ROUTES.NAME_SEARCH, {
    params: {
      name: trimmedName,
    },
  });

  return normalizeProductsPayload(data);
}

export async function getProductBySlugApi(productSlug) {
  if (!productSlug) {
    return null;
  }

  const { data } = await withoutTokenApi.get(
    PRODUCT_API_ROUTES.DETAIL(encodeURIComponent(productSlug)),
  );

  if (!data?.data || data.data.is_active === false) {
    return null;
  }

  return normalizeProduct(data.data);
}

