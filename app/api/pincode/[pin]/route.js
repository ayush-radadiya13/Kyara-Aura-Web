import { isValidPincode, sanitizePincode } from '@/lib/address-validation';
import { normalizePincodeLocations } from '@/lib/pincode-lookup';

const POSTAL_PINCODE_API = 'https://api.postalpincode.in/pincode';

/**
 * Proxy India Post PIN lookup to avoid browser CORS restrictions.
 * @param {Request} _request
 * @param {{ params: Promise<{ pin: string }> }} context
 */
export async function GET(_request, context) {
  const { pin: rawPin } = await context.params;
  const pincode = sanitizePincode(rawPin);

  if (!isValidPincode(pincode)) {
    return Response.json(
      { message: 'PIN code must be exactly 6 digits.', locations: [] },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(`${POSTAL_PINCODE_API}/${pincode}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'force-cache',
    });

    if (!upstream.ok) {
      return Response.json(
        { message: 'Unable to look up this PIN code.', locations: [] },
        { status: 502 },
      );
    }

    const data = await upstream.json();
    const result = Array.isArray(data) ? data[0] : null;
    const status = String(result?.Status ?? '');
    const postOffices = Array.isArray(result?.PostOffice) ? result.PostOffice : [];

    if (status !== 'Success' || postOffices.length === 0) {
      return Response.json(
        { message: 'No location found for this PIN code.', locations: [], pincode },
        { status: 404 },
      );
    }

    const locations = normalizePincodeLocations(postOffices);

    if (locations.length === 0) {
      return Response.json(
        { message: 'No location found for this PIN code.', locations: [], pincode },
        { status: 404 },
      );
    }

    return Response.json({ pincode, locations });
  } catch {
    return Response.json(
      { message: 'Unable to look up this PIN code.', locations: [] },
      { status: 502 },
    );
  }
}
