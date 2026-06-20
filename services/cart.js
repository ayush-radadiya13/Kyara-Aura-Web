import { isCartItemFree } from "@/lib/cart/buy-two-get-one";
import { normalizeOrderSummary } from "@/lib/cart/order-summary";
import { CART_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function imageUrlFromValue(value) {
  if (!value) return "";
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    const primaryImage = value.find((image) => image?.is_primary) ?? value[0];
    return imageUrlFromValue(primaryImage);
  }

  return value.image_url || value.image_path || value.url || value.src || "";
}

function getProductImage(product) {
  const imageSources = [
    product?.images,
    product?.image,
    product?.product_images,
    product?.productImages,
  ];
  const images = imageSources.find((source) => Array.isArray(source) && source.length) ?? [];
  const primaryImage = images.find((image) => image?.is_primary) ?? images[0];

  return (
    imageUrlFromValue(primaryImage) ||
    imageUrlFromValue(product?.image) ||
    product?.image_url ||
    product?.image_path ||
    "/images/product-placeholder.svg"
  );
}

export function getLineItemImageSrc(item, fallback = "/images/product-placeholder.svg") {
  const product = item?.product ?? {};
  const imageSources = [
    item?.image,
    item?.image_url,
    item?.image_path,
    item?.product_image,
    item?.productImage,
    product.image,
    product.image_url,
    product.image_path,
    product.images,
    product.product_images,
  ];

  for (const source of imageSources) {
    const imageValue = imageUrlFromValue(source);
    if (imageValue) return imageValue;
  }

  return fallback;
}

export function normalizeCartPayload(payload) {
  const cart = payload?.data ?? payload ?? {};
  const items = Array.isArray(cart.items) ? cart.items : [];
  const normalizedItems = items.map((item) => {
    const product = item.product ?? {};
    const productSize = item.product_size ?? {};
    const sizeText = item.size_text || productSize.size_text || "";
    const price = toNumber(item.size_price ?? productSize.price);
    const quantity = toNumber(item.quantity, 1);

    const normalizedItem = {
      id: String(item.id ?? `${product.slug ?? item.product_id}::${item.product_size_id}`),
      cartItemId: item.id,
      slug: product.slug ?? String(item.product_id ?? ""),
      title: product.name ?? "Product",
      image: getProductImage(product),
      size: sizeText,
      sizeLabel: sizeText,
      quantity,
      price,
      originalPrice: price,
      subtotal: toNumber(item.subtotal, price * quantity),
      productId: item.product_id ?? product.id,
      productSizeId: item.product_size_id ?? productSize.id,
      categoryId: product.category?.id,
      raw: item,
    };

    return {
      ...normalizedItem,
      isFree: isCartItemFree(normalizedItem),
    };
  });

  return {
    items: normalizedItems,
    total: toNumber(
      cart.total,
      normalizedItems.reduce((sum, item) => sum + item.subtotal, 0),
    ),
    itemCount: toNumber(
      cart.item_count,
      normalizedItems.reduce((sum, item) => sum + item.quantity, 0),
    ),
    buyTwoGetOneDiscountAmount: toNumber(
      cart.buy_two_get_one_discount_amount ?? cart.buyTwoGetOneDiscountAmount,
      0,
    ),
    orderSummary: normalizeOrderSummary(cart),
  };
}

export async function getCartApi() {
  const { data } = await customAxios.get(CART_API_ROUTES.LIST);
  return normalizeCartPayload(data);
}

export async function addCartItemApi(payload) {
  const { data } = await customAxios.post(CART_API_ROUTES.ADD, payload);
  return data;
}

export async function removeCartItemApi(itemId) {
  const { data } = await customAxios.delete(CART_API_ROUTES.REMOVE(itemId));
  return data;
}

export async function clearCartApi() {
  const { data } = await customAxios.delete(CART_API_ROUTES.CLEAR);
  return data;
}

export async function updateCartQuantityApi(payload) {
  const { data } = await customAxios.put(CART_API_ROUTES.UPDATE_QUANTITY, payload);
  return data;
}
