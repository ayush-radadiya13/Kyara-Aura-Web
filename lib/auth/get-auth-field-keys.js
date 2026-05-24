import {
  DEFAULT_LOGIN_FIELD_KEYS,
  DEFAULT_REGISTER_FIELD_KEYS,
  resolveAuthFieldKeys,
} from './fields';

/**
 * Fetches auth form field keys from the API. The response should be an object
 * whose keys define which inputs to render (values are ignored).
 *
 * @param {'login' | 'register'} formType
 * @returns {Promise<string[]>}
 */
export async function getAuthFieldKeys(formType) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const envKey =
    formType === 'login'
      ? process.env.NEXT_PUBLIC_LOGIN_FIELD_KEYS
      : process.env.NEXT_PUBLIC_REGISTER_FIELD_KEYS;

  if (envKey) {
    const keys = envKey.split(',').map((k) => k.trim()).filter(Boolean);
    return resolveAuthFieldKeys(formType, keys);
  }

  if (!baseUrl) {
    return resolveAuthFieldKeys(
      formType,
      formType === 'login' ? DEFAULT_LOGIN_FIELD_KEYS : DEFAULT_REGISTER_FIELD_KEYS,
    );
  }

  const path =
    formType === 'login'
      ? process.env.NEXT_PUBLIC_LOGIN_FIELDS_PATH || '/auth/login/fields'
      : process.env.NEXT_PUBLIC_REGISTER_FIELDS_PATH || '/auth/register/fields';

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Failed to load ${formType} fields`);
    }

    const data = await res.json();
    const keys = Array.isArray(data)
      ? data
      : typeof data === 'object' && data !== null
        ? Object.keys(data)
        : [];

    return resolveAuthFieldKeys(formType, keys);
  } catch {
    return resolveAuthFieldKeys(
      formType,
      formType === 'login' ? DEFAULT_LOGIN_FIELD_KEYS : DEFAULT_REGISTER_FIELD_KEYS,
    );
  }
}
