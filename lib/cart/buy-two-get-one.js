/**
 * Required products for a Buy X Get Y set.
 * @param {number} [buyQty]
 * @param {number} [getQty]
 * @returns {number}
 */
export function getBuyTwoGetOneRequiredProducts(buyQty = 2, getQty = 1) {
  const resolvedBuyQty = Number(buyQty) > 0 ? Number(buyQty) : 2;
  const resolvedGetQty = Number(getQty) > 0 ? Number(getQty) : 1;
  return resolvedBuyQty + resolvedGetQty;
}

/**
 * @param {number} [buyQty]
 * @param {number} [getQty]
 * @param {number} [selectedCount]
 * @returns {string | null}
 */
export function getBuyTwoGetOneNeedOneMoreMessage(buyQty = 2, getQty = 1, selectedCount = 0) {
  const resolvedBuyQty = Number(buyQty) > 0 ? Number(buyQty) : 2;
  const resolvedGetQty = Number(getQty) > 0 ? Number(getQty) : 1;
  const required = getBuyTwoGetOneRequiredProducts(resolvedBuyQty, resolvedGetQty);
  const remaining = required - Number(selectedCount);

  if (remaining <= 0) return null;

  const productWord = remaining === 1 ? 'product' : 'products';
  return `Add ${remaining} more ${productWord} to claim your Buy ${resolvedBuyQty} Get ${resolvedGetQty} offer.`;
}

/**
 * @param {number} [getQty]
 * @returns {string}
 */
export function getBuyTwoGetOneSelectFreeMessage(getQty = 1) {
  const freeQty = Number(getQty);

  if (freeQty > 1) {
    return `Your FREE products are ready. Please select them now!`;
  }

  return 'Your FREE product is ready. Please select it now!';
} 

/**
 * @param {number} [buyQty]
 * @param {number} [getQty]
 * @returns {string}
 */
export function getBuyTwoGetOneTicketDefaultMessage(buyQty = 2, getQty = 1) {
  return `Buy ${Number(buyQty)} Get ${Number(getQty)} Free!! See Offer Items`;
}

/**
 * @param {number} [buyQty]
 * @param {number} [getQty]
 * @returns {string}
 */
export function getBuyTwoGetOneDiscountLabel(buyQty = 2, getQty = 1) {
  return `Buy ${Number(buyQty)} Get ${Number(getQty)} Discount`;
}

/**
 * @param {number} [buyQty]
 * @param {number} [getQty]
 * @returns {string}
 */
export function getBuyTwoGetOneOfferTitle(buyQty = 2, getQty = 1) {
  return `Buy ${Number(buyQty)} Get ${Number(getQty)} Free`;
}

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
 * Paid (non-free) product quantity in the cart.
 * @param {Array<Record<string, unknown>>} items
 */
export function countEligibleProducts(items) {
  return items.reduce((count, item) => {
    if (isCartItemFree(item)) return count;
    return count + getItemQuantity(item);
  }, 0);
}

/**
 * Selected products toward the current Buy X Get Y offer (includes free/get items).
 * @param {Array<Record<string, unknown>>} items
 */
export function countSelectedOfferProducts(items) {
  return items.reduce((count, item) => count + getItemQuantity(item), 0);
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
 *   selectedCount?: number | null,
 *   hasFreeProduct?: boolean | null,
 *   buyQty?: number,
 *   getQty?: number,
 * }} params
 * @returns {string | null}
 */
export function getBuyTwoGetOneOfferMessage({
  isEnabled = false,
  items = [],
  buyTwoGetOneDiscountAmount = 0,
  eligibleCount = null,
  selectedCount = null,
  hasFreeProduct = null,
  buyQty = 2,
  getQty = 1,
} = {}) {
  if (!isEnabled || items.length === 0) return null;

  const resolvedBuyQty = Number(buyQty) > 0 ? Number(buyQty) : 2;
  const resolvedGetQty = Number(getQty) > 0 ? Number(getQty) : 1;
  const resolvedSelectedCount =
    selectedCount ?? eligibleCount ?? countSelectedOfferProducts(items);

  return getBuyTwoGetOneNeedOneMoreMessage(
    resolvedBuyQty,
    resolvedGetQty,
    resolvedSelectedCount,
  );
}

/**
 * @param {{
 *   isEnabled?: boolean,
 *   items?: Array<Record<string, unknown>>,
 *   buyTwoGetOneDiscountAmount?: number,
 *   eligibleCount?: number | null,
 *   selectedCount?: number | null,
 *   hasFreeProduct?: boolean | null,
 *   buyQty?: number,
 *   getQty?: number,
 *   defaultMessage?: string,
 * }} params
 * @returns {string | null}
 */
export function getBuyTwoGetOneTicketMessage({
  isEnabled = false,
  items = [],
  buyTwoGetOneDiscountAmount = 0,
  eligibleCount = null,
  selectedCount = null,
  hasFreeProduct = null,
  buyQty = 2,
  getQty = 1,
  defaultMessage,
} = {}) {
  if (!isEnabled) return null;

  const resolvedBuyQty = Number(buyQty) > 0 ? Number(buyQty) : 2;
  const resolvedGetQty = Number(getQty) > 0 ? Number(getQty) : 1;

  if (items.length === 0) {
    return (
      defaultMessage ??
      getBuyTwoGetOneTicketDefaultMessage(resolvedBuyQty, resolvedGetQty)
    );
  }

  // Hide when all required products are selected; otherwise show remaining message.
  return getBuyTwoGetOneOfferMessage({
    isEnabled,
    items,
    buyTwoGetOneDiscountAmount,
    eligibleCount,
    selectedCount,
    hasFreeProduct,
    buyQty: resolvedBuyQty,
    getQty: resolvedGetQty,
  });
}
