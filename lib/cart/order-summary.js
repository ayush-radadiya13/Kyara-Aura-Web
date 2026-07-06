function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

/**
 * @param {Record<string, unknown> | null | undefined} raw
 * @returns {{
 *   itemsSubtotal: number,
 *   subtotal: number,
 *   taxAmount: number,
 *   shippingAmount: number,
 *   buyTwoGetOneDiscountAmount: number,
 *   firstOrderDiscountAmount: number,
 *   onlinePaymentDiscountAmount: number,
 *   discountAmount: number,
 *   discountPercent: number,
 *   codCharge: number,
 *   total: number,
 *   itemCount: number,
 * }}
 */
export function normalizeOrderSummary(raw) {
  const source = raw?.order_summary ?? raw?.orderSummary ?? raw;

  return {
    itemsSubtotal: toNumber(source?.items_subtotal ?? source?.itemsSubtotal ?? raw?.items_subtotal ?? raw?.itemsSubtotal),
    subtotal: toNumber(source?.subtotal ?? raw?.subtotal),
    taxAmount: toNumber(source?.tax_amount ?? source?.taxAmount ?? raw?.tax_amount ?? raw?.taxAmount),
    shippingAmount: toNumber(source?.shipping_amount ?? source?.shippingAmount ?? raw?.shipping_amount ?? raw?.shippingAmount),
    buyTwoGetOneDiscountAmount: toNumber(
      source?.buy_two_get_one_discount_amount ??
        source?.buyTwoGetOneDiscountAmount ??
        raw?.buy_two_get_one_discount_amount ??
        raw?.buyTwoGetOneDiscountAmount,
    ),
    firstOrderDiscountAmount: toNumber(
      source?.first_order_discount_amount ??
        source?.firstOrderDiscountAmount ??
        raw?.first_order_discount_amount ??
        raw?.firstOrderDiscountAmount,
    ),
    onlinePaymentDiscountAmount: toNumber(
      source?.online_payment_discount_amount ??
        source?.onlinePaymentDiscountAmount ??
        raw?.online_payment_discount_amount ??
        raw?.onlinePaymentDiscountAmount,
    ),
    discountAmount: toNumber(source?.discount_amount ?? source?.discountAmount ?? raw?.discount_amount ?? raw?.discountAmount),
    discountPercent: toNumber(source?.discount_percent ?? source?.discountPercent ?? raw?.discount_percent ?? raw?.discountPercent),
    codCharge: toNumber(source?.cod_charge ?? source?.codCharge ?? raw?.cod_charge ?? raw?.codCharge),
    total: toNumber(
      source?.total ?? source?.total_amount ?? source?.totalAmount ?? raw?.total ?? raw?.total_amount ?? raw?.totalAmount,
    ),
    itemCount: toNumber(source?.item_count ?? source?.itemCount ?? raw?.item_count ?? raw?.itemCount),
  };
}

/**
 * @param {ReturnType<typeof normalizeOrderSummary>} summary
 * @param {number} fallbackItemCount
 */
export function withOrderSummaryItemCount(summary, fallbackItemCount) {
  return {
    ...summary,
    itemCount: summary.itemCount || fallbackItemCount,
  };
}

/**
 * Roll COD charge into shipping for display (e.g. payment-method checkout).
 * @param {ReturnType<typeof normalizeOrderSummary>} summary
 * @param {boolean} [includeCod=false]
 */
export function withCodIncludedInShipping(summary, includeCod = false) {
  if (!summary || !includeCod || !summary.codCharge) {
    return summary;
  }

  return {
    ...summary,
    shippingAmount: summary.shippingAmount + summary.codCharge,
  };
}

/**
 * @param {{ items: Array<{ subtotal?: number, price: number, quantity: number }>, total?: number, itemCount?: number, buyTwoGetOneDiscountAmount?: number, orderSummary?: ReturnType<typeof normalizeOrderSummary> }} cart
 */
export function buildCartOrderSummary(cart) {
  const fromApi = cart.orderSummary ?? normalizeOrderSummary(cart);
  const items = Array.isArray(cart.items) ? cart.items : [];
  const computedItemsSubtotal = items.reduce(
    (sum, item) => sum + (item.subtotal ?? item.price * item.quantity),
    0,
  );
  const computedItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const buyTwoGetOneDiscountAmount =
    fromApi.buyTwoGetOneDiscountAmount || cart.buyTwoGetOneDiscountAmount || 0;

  return {
    itemsSubtotal: fromApi.itemsSubtotal || computedItemsSubtotal + buyTwoGetOneDiscountAmount,
    subtotal: fromApi.subtotal || cart.total || computedItemsSubtotal,
    taxAmount: fromApi.taxAmount,
    shippingAmount: fromApi.shippingAmount,
    buyTwoGetOneDiscountAmount,
    firstOrderDiscountAmount: fromApi.firstOrderDiscountAmount,
    onlinePaymentDiscountAmount: fromApi.onlinePaymentDiscountAmount,
    discountAmount: fromApi.discountAmount,
    discountPercent: fromApi.discountPercent,
    codCharge: fromApi.codCharge,
    total: fromApi.total || cart.total || computedItemsSubtotal,
    itemCount: fromApi.itemCount || cart.itemCount || computedItemCount,
  };
}
