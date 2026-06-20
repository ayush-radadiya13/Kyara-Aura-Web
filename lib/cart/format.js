/**
 * @param {number} amount
 */
export function formatInr(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * @param {number} amount
 */
export function formatInrDiscount(amount) {
  return `-${formatInr(Math.abs(Number(amount) || 0))}`;
}
