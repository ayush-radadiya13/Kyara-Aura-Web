import { isValidIndianPhone } from '@/lib/phone';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalize user input to at most 6 pincode digits.
 * @param {unknown} raw
 */
export function sanitizePincode(raw) {
  return String(raw ?? '').replace(/\D/g, '').slice(0, 6);
}

/**
 * @param {unknown} value
 */
export function isValidPincode(value) {
  return /^\d{6}$/.test(sanitizePincode(value));
}

/**
 * @param {Record<string, unknown>} form
 */
export function validateAddressForm(form) {
  const errors = {};

  if (!String(form.name ?? '').trim()) {
    errors.name = 'Name is required.';
  }

  const email = String(form.email ?? '').trim();
  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  const phone = String(form.phone ?? '').trim();
  if (!phone) {
    errors.phone = 'Mobile number is required.';
  } else if (!isValidIndianPhone(phone)) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
  }

  if (!String(form.address_line_1 ?? '').trim()) {
    errors.address_line_1 = 'Address line 1 is required.';
  }

  if (!String(form.address_line_2 ?? '').trim()) {
    errors.address_line_2 = 'Address line 2 is required.';
  }

  if (!String(form.city ?? '').trim()) {
    errors.city = 'City is required.';
  }

  if (!String(form.state ?? '').trim()) {
    errors.state = 'State is required.';
  }

  const postalCode = String(form.postal_code ?? '').trim();
  if (!postalCode) {
    errors.postal_code = 'Pincode is required.';
  } else if (!isValidPincode(postalCode)) {
    errors.postal_code = 'Pincode must be exactly 6 digits.';
  }

  if (!String(form.country ?? '').trim()) {
    errors.country = 'Country is required.';
  }

  if (!String(form.landmark ?? '').trim()) {
    errors.landmark = 'Landmark is required.';
  }

  if (!String(form.address_type ?? '').trim()) {
    errors.address_type = 'Address type is required.';
  }

  return errors;
}

/**
 * @param {Record<string, unknown>} form
 */
export function isAddressFormValid(form) {
  return Object.keys(validateAddressForm(form)).length === 0;
}
