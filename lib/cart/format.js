const inrCurrencyFormatter = (fractionDigits) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

/**
 * @param {number} amount
 */
export function formatInr(amount) {
  return inrCurrencyFormatter(0).format(amount);
}

/**
 * Fixed two-decimal INR format for order payment breakdowns.
 * @param {number} amount
 */
export function formatInrPayment(amount) {
  return inrCurrencyFormatter(2).format(Number(amount) || 0);
}

/**
 * @param {number} amount
 */
export function formatInrDiscount(amount) {
  return `-${formatInr(Math.abs(Number(amount) || 0))}`;
}

/**
 * @param {number} amount
 */
export function formatInrPaymentDiscount(amount) {
  return `-${formatInrPayment(Math.abs(Number(amount) || 0))}`;
}
