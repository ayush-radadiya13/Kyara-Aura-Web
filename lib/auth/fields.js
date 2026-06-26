/** @typedef {'login' | 'register'} AuthFormType */

export const DEFAULT_LOGIN_FIELD_KEYS = ['email', 'password'];

export const DEFAULT_REGISTER_FIELD_KEYS = [
  'name',
  'phone',
  'email',
  'gender',
  'password',
  'password_confirmation',
];

/** @type {Record<string, { label: string; type: string; placeholder?: string; autoComplete?: string; icon?: 'mail' | 'lock' | 'user' | 'phone'; options?: { value: string; label: string }[] }>} */
export const AUTH_FIELD_META = {
  name: {
    label: 'Name',
    type: 'text',
    placeholder: 'Enter your name',
    autoComplete: 'name',
    icon: 'user',
  },
  email: {
    label: 'Email',
    type: 'email',
    placeholder: 'name@gmail.com',
    autoComplete: 'email',
    icon: 'mail',
  },
  phone: {
    label: 'Mobile Number',
    type: 'tel',
    placeholder: '',
    autoComplete: 'tel-national',
    icon: 'phone',
  },
  gender: {
    label: 'Gender',
    type: 'radio',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
  },
  password: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    autoComplete: 'current-password',
    icon: 'lock',
  },
  password_confirmation: {
    label: 'Confirm Password',
    type: 'password',
    placeholder: 'Re-enter password',
    autoComplete: 'new-password',
    icon: 'lock',
  },
};

/**
 * @param {AuthFormType} formType
 * @param {string[]} keys
 */
export function resolveAuthFieldKeys(formType, keys) {
  const allowed = new Set(Object.keys(AUTH_FIELD_META));
  const filtered = keys.filter((key) => allowed.has(key));

  if (filtered.length > 0) return filtered;

  return formType === 'login' ? DEFAULT_LOGIN_FIELD_KEYS : DEFAULT_REGISTER_FIELD_KEYS;
}

export { INDIAN_PHONE_PATTERN, sanitizeIndianPhoneDigits } from '@/lib/phone';

/**
 * @param {Record<string, string>} values
 * @param {string[]} fieldKeys
 */
export function buildAuthPayload(values, fieldKeys) {
  /** @type {Record<string, string>} */
  const payload = {};

  for (const key of fieldKeys) {
    const value = values[key]?.trim() ?? '';
    if (value) payload[key] = value;
  }

  return payload;
}
