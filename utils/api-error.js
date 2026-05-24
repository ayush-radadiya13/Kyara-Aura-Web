/**
 * @param {unknown} error
 * @param {string} [fallback]
 * @returns {string}
 */
export function getApiErrorMessage(error, fallback = "Something went wrong") {
  const axiosError = /** @type {{ response?: { data?: { error?: { message?: string }; message?: string } }; message?: string }} */ (
    error
  );

  return (
    axiosError?.response?.data?.error?.message ||
    axiosError?.response?.data?.message ||
    axiosError?.message ||
    fallback
  );
}
