export const BUY_TWO_GET_ONE_NEED_ONE_MORE_MESSAGE =
  'Add one more eligible product to get 1 product free.';

export const BUY_TWO_GET_ONE_SELECT_FREE_MESSAGE =
  'Select 1 free product to claim your offer.';

function toBoolean(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function getRawItem(item) {
  return item?.raw ?? item;
}

/**
 * @param {Record<string, unknown>} item
 */
export function isCartItemFree(item) {
  const raw = getRawItem(item);

  if (
    toBoolean(item?.isFree) ||
    toBoolean(raw?.is_free) ||
    toBoolean(raw?.is_free_product) ||
    toBoolean(raw?.isFree) ||
    toBoolean(raw?.isFreeProduct) ||
    toBoolean(raw?.is_buy_two_get_one_free)
  ) {
    return true;
  }

  const price = Number(item?.price ?? raw?.size_price ?? raw?.price ?? raw?.unit_price ?? 0);
  const quantity = getItemQuantity(item);
  const subtotal = Number(
    item?.subtotal ??
      item?.total ??
      item?.line_total ??
      raw?.subtotal ??
      raw?.total ??
      raw?.line_total ??
      price * quantity,
  );

  return price > 0 && subtotal === 0;
}

/**
 * @param {Record<string, unknown>} item
 */
export function getItemQuantity(item) {
  const quantity = Number(item?.quantity);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

/**
 * @param {Array<Record<string, unknown>>} items
 */
export function countEligibleProducts(items) {
  return items.reduce((count, item) => {
    if (isCartItemFree(item)) return count;
    return count + getItemQuantity(item);
  }, 0);
}

/**
 * @param {Array<Record<string, unknown>>} items
 * @param {number} [buyTwoGetOneDiscountAmount]
 */
export function hasFreeProductInCart(items, buyTwoGetOneDiscountAmount = 0) {
  if (Number(buyTwoGetOneDiscountAmount) > 0) return true;
  return items.some((item) => isCartItemFree(item));
}

/**
 * @param {{
 *   isEnabled?: boolean,
 *   items?: Array<Record<string, unknown>>,
 *   buyTwoGetOneDiscountAmount?: number,
 *   eligibleCount?: number | null,
 *   hasFreeProduct?: boolean | null,
 * }} params
 * @returns {string | null}
 */
export function getBuyTwoGetOneOfferMessage({
  isEnabled = false,
  items = [],
  buyTwoGetOneDiscountAmount = 0,
  eligibleCount = null,
  hasFreeProduct = null,
} = {}) {
  if (!isEnabled || items.length === 0) return null;

  const resolvedEligibleCount = eligibleCount ?? countEligibleProducts(items);
  const resolvedHasFreeProduct =
    hasFreeProduct ?? hasFreeProductInCart(items, buyTwoGetOneDiscountAmount);

  if (resolvedEligibleCount === 1) {
    return BUY_TWO_GET_ONE_NEED_ONE_MORE_MESSAGE;
  }

  if (resolvedEligibleCount >= 2 && !resolvedHasFreeProduct) {
    return BUY_TWO_GET_ONE_SELECT_FREE_MESSAGE;
  }

  return null;
}
