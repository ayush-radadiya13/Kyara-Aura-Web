import { PRODUCT_API_ROUTES } from "@/lib/routes";
import { normalizeProduct, productsFromPayload } from "@/lib/products";
import { withoutTokenApi } from "@/utils/api";

function normalizeProductsPayload(payload) {
  return productsFromPayload(payload)
    .filter((product) => product?.is_active !== false)
    .map(normalizeProduct);
}

export async function getProductsApi() {
  const { data } = await withoutTokenApi.get(PRODUCT_API_ROUTES.LIST);
  return normalizeProductsPayload(data);
}

export async function getFeaturedProductsApi() {
  const { data } = await withoutTokenApi.get(PRODUCT_API_ROUTES.FEATURED);
  return normalizeProductsPayload(data);
}

export async function getProductsByCategoryApi(categoryId) {
  if (!categoryId) {
    return getProductsApi();
  }

  const { data } = await withoutTokenApi.get(
    PRODUCT_API_ROUTES.CATEGORY(encodeURIComponent(categoryId))
  );
  return normalizeProductsPayload(data);
}

export async function getProductBySlugApi(productSlug) {
  if (!productSlug) {
    return null;
  }

  const { data } = await withoutTokenApi.get(
    PRODUCT_API_ROUTES.DETAIL(encodeURIComponent(productSlug))
  );

  if (!data?.data || data.data.is_active === false) {
    return null;
  }

  return normalizeProduct(data.data);
}
