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

/**
 * @param {object | null | undefined} user
 * @returns {string | number | null}
 */
export function getAuthUserId(user) {
  if (!user) return null;
  return user.id ?? user.user_id ?? user.userId ?? null;
}

/**
 * Stable per-user key for client-side storage when user id may be absent.
 * @param {object | null | undefined} user
 * @param {string | null | undefined} token
 * @returns {string | null}
 */
export function getAuthStorageKey(user, token) {
  const userId = getAuthUserId(user);
  if (userId != null && userId !== "") return String(userId);
  if (token) return `token:${token}`;
  return null;
}
