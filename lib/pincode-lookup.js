import { isValidPincode, sanitizePincode } from '@/lib/address-validation';

/**
 * Normalize India Post office rows into unique state/city locations.
 * City is taken from District (standard for Indian shipping addresses).
 *
 * @param {Array<Record<string, unknown>>} postOffices
 * @returns {Array<{ id: string, state: string, city: string, label: string }>}
 */
export function normalizePincodeLocations(postOffices) {
  if (!Array.isArray(postOffices)) return [];

  const byKey = new Map();

  for (const office of postOffices) {
    const state = String(office?.State ?? '').trim();
    const city = String(office?.District ?? '').trim();
    if (!state || !city) continue;

    const id = `${state.toLowerCase()}::${city.toLowerCase()}`;
    if (byKey.has(id)) continue;

    byKey.set(id, {
      id,
      state,
      city,
      label: `${city}, ${state}`,
    });
  }

  return Array.from(byKey.values());
}

/**
 * Fetch unique state/city locations for a 6-digit Indian PIN code.
 * Uses the app API proxy to avoid CORS issues with the upstream postal API.
 *
 * @param {unknown} rawPincode
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<Array<{ id: string, state: string, city: string, label: string }>>}
 */
export async function lookupPincodeLocations(rawPincode, options = {}) {
  const pincode = sanitizePincode(rawPincode);
  if (!isValidPincode(pincode)) {
    throw new Error('Enter a valid 6-digit PIN code.');
  }

  const response = await fetch(`/api/pincode/${pincode}`, {
    method: 'GET',
    signal: options.signal,
    headers: { Accept: 'application/json' },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || 'Unable to look up this PIN code.');
  }

  const locations = Array.isArray(payload?.locations) ? payload.locations : [];
  if (locations.length === 0) {
    throw new Error('No location found for this PIN code.');
  }

  return locations;
}
