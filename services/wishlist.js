import { WISHLIST_API_ROUTES } from "@/lib/routes";
import { normalizeProduct } from "@/lib/products";
import { customAxios } from "@/utils/api";

function wishlistItemsFromPayload(payload) {
  const data = payload?.data ?? payload;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.wishlist)) return data.wishlist;
  if (Array.isArray(data?.wishlist_items)) return data.wishlist_items;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.wishlist)) return payload.wishlist;

  return [];
}

function productFromWishlistItem(item) {
  return (
    item?.product ||
    item?.product_data ||
    item?.productDetail ||
    item?.product_details ||
    item
  );
}

function getWishlistItemId(item, product) {
  return item?.id ?? item?._id ?? item?.wishlist_id ?? item?.wishlistId ?? product?.wishlist_id;
}

function getProductId(item, product) {
  return (
    item?.product_id ??
    item?.productId ??
    product?.id ??
    product?._id
  );
}

export function normalizeWishlistPayload(payload) {
  return wishlistItemsFromPayload(payload)
    .map((item) => {
      const productPayload = productFromWishlistItem(item);
      const productId = getProductId(item, productPayload);

      if (!productPayload || !productId) return null;

      const product = normalizeProduct({
        ...productPayload,
        id: productPayload.id ?? productPayload._id ?? productId,
        name: productPayload.name ?? 'Product',
      });
      const wishlistItemId = getWishlistItemId(item, productPayload);

      return {
        id: wishlistItemId ? String(wishlistItemId) : String(productId),
        wishlistItemId,
        productId,
        product,
        raw: item,
      };
    })
    .filter(Boolean);
}

export async function getWishlistApi() {
  const { data } = await customAxios.get(WISHLIST_API_ROUTES.LIST);
  return normalizeWishlistPayload(data);
}

export async function addWishlistItemApi(productId) {
  const { data } = await customAxios.post(WISHLIST_API_ROUTES.CREATE, {
    product_id: productId,
  });
  return data;
}

export async function getWishlistItemApi(wishlistId) {
  const { data } = await customAxios.get(WISHLIST_API_ROUTES.DETAIL(wishlistId));
  return data;
}

export async function updateWishlistItemApi(wishlistId, productId) {
  const { data } = await customAxios.put(WISHLIST_API_ROUTES.UPDATE(wishlistId), {
    product_id: productId,
  });
  return data;
}

export async function deleteWishlistItemApi(wishlistId) {
  const { data } = await customAxios.delete(WISHLIST_API_ROUTES.DELETE(wishlistId));
  return data;
}

export async function clearWishlistApi() {
  const { data } = await customAxios.delete(WISHLIST_API_ROUTES.CLEAR);
  return data;
}
