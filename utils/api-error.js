/**
 * @param {unknown} error
 * @param {string} [fallback]
 * @returns {string}
 */
export function getApiErrorMessage(error, fallback = "Something went wrong") {
  const axiosError = /** @type {{ response?: { data?: { error?: { message?: string; details?: unknown; errors?: unknown }; message?: string; details?: unknown; errors?: unknown }; errors?: unknown }; message?: string }} */ (
    error
  );
  const status = axiosError?.response?.status;
  const data = axiosError?.response?.data;

  const detailMessage = getFirstErrorMessage(data);
  if (detailMessage) {
    return detailMessage;
  }

  return (
    data?.error?.message ||
    data?.message ||
    getStatusFallback(status) ||
    axiosError?.message ||
    fallback
  );
}

function getFirstErrorMessage(data) {
  const candidates = [
    data?.error?.details,
    data?.details,
    data?.error?.errors,
    data?.errors,
  ];

  for (const candidate of candidates) {
    const flattened = flattenErrorMessages(candidate);
    if (flattened.length > 0) {
      return flattened[0];
    }
  }

  return "";
}

function flattenErrorMessages(value) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenErrorMessages(item)).filter(Boolean);
  }

  if (value && typeof value === "object") {
    return Object.values(value)
      .flatMap((item) => flattenErrorMessages(item))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  return [];
}

function getStatusFallback(status) {
  if (status === 400) return "Unable to complete this request. Please review your cart and try again.";
  if (status === 401) return "Please login to continue.";
  if (status === 409) return "Payment needs manual review. Please contact support with your order details.";
  if (status === 422) return "Please check the highlighted details and try again.";
  if (status >= 500) return "Server error. Please try again in a few minutes.";
  return "";
}
