/**
 * Normalize token from common API response shapes.
 * @param {unknown} response
 * @returns {string | null}
 */
export function extractAuthToken(response) {
  const root = response?.data ?? response;
  const nested = root?.data ?? root;

  return (
    nested?.token ||
    nested?.access_token ||
    root?.token ||
    root?.access_token ||
    null
  );
}

/**
 * Normalize user from common API response shapes.
 * @param {unknown} response
 * @returns {object | null}
 */
export function extractAuthUser(response) {
  const root = response?.data ?? response;
  const nested = root?.data ?? root;

  return nested?.user || root?.user || nested?.profile || null;
}

/**
 * Normalize profile payload from GET profile.
 * @param {unknown} response
 * @returns {object | null}
 */
export function extractProfile(response) {
  const root = response?.data ?? response;
  return root?.data?.user || root?.data || root?.user || root || null;
}
