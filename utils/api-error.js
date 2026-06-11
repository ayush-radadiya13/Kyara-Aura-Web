/**
 * @param {unknown} error
 * @param {string} [fallback]
 * @returns {string}
 */
export function getApiErrorMessage(error, fallback = "Something went wrong") {
  const axiosError = /** @type {{ response?: { data?: { error?: { message?: string }; message?: string } }; message?: string }} */ (
    error
  );
  const status = axiosError?.response?.status;
  const data = axiosError?.response?.data;
  const validationErrors = data?.errors;

  if (status === 422 && validationErrors && typeof validationErrors === "object") {
    const firstMessage = Object.values(validationErrors)
      .flat()
      .find(Boolean);

    if (firstMessage) return String(firstMessage);
  }

  return (
    data?.error?.message ||
    data?.message ||
    getStatusFallback(status) ||
    axiosError?.message ||
    fallback
  );
}

function getStatusFallback(status) {
  if (status === 400) return "Unable to complete this request. Please review your cart and try again.";
  if (status === 401) return "Please login to continue.";
  if (status === 409) return "Payment needs manual review. Please contact support with your order details.";
  if (status === 422) return "Please check the highlighted details and try again.";
  if (status >= 500) return "Server error. Please try again in a few minutes.";
  return "";
}
