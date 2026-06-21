export const INDIAN_PHONE_PATTERN = /^[6-9]\d{9}$/;

/**
 * Normalize user input to at most 10 Indian mobile digits (without +91).
 * @param {unknown} raw
 */
export function sanitizeIndianPhoneDigits(raw) {
  let digits = String(raw ?? '').replace(/\D/g, '');

  if (digits.startsWith('91') && digits.length > 10) {
    digits = digits.slice(2);
  }

  if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  return digits.slice(0, 10);
}

/**
 * @param {unknown} value
 */
export function isValidIndianPhone(value) {
  return INDIAN_PHONE_PATTERN.test(sanitizeIndianPhoneDigits(value));
}
