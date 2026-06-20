import { ADDRESS_API_ROUTES, CHECKOUT_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

function unwrapData(response) {
  return response?.data?.data ?? response?.data;
}

export async function getAddressesApi() {
  const response = await customAxios.get(ADDRESS_API_ROUTES.LIST);
  return unwrapData(response) ?? [];
}

export async function createAddressApi(payload) {
  const response = await customAxios.post(ADDRESS_API_ROUTES.CREATE, payload);
  return unwrapData(response);
}

export async function updateAddressApi(addressId, payload) {
  const response = await customAxios.put(ADDRESS_API_ROUTES.UPDATE(addressId), payload);
  return unwrapData(response);
}

export async function deleteAddressApi(addressId) {
  const response = await customAxios.delete(ADDRESS_API_ROUTES.DELETE(addressId));
  return unwrapData(response);
}

export async function setDefaultAddressApi(addressId) {
  const response = await customAxios.post(ADDRESS_API_ROUTES.SET_DEFAULT(addressId));
  return unwrapData(response);
}

export async function getCheckoutSummaryApi(payload) {
  const response = await customAxios.post(CHECKOUT_API_ROUTES.SUMMARY, payload);
  return unwrapData(response);
}

export async function createOrderApi(payload) {
  const response = await customAxios.post(CHECKOUT_API_ROUTES.CREATE_ORDER, payload);
  return unwrapData(response);
}

export async function sendCodOrderOtpApi(payload) {
  const response = await customAxios.post(CHECKOUT_API_ROUTES.SEND_COD_OTP, payload);
  return unwrapData(response);
}

export async function verifyRazorpayPaymentApi(payload) {
  const response = await customAxios.post(CHECKOUT_API_ROUTES.VERIFY_RAZORPAY_PAYMENT, payload);
  return unwrapData(response);
}

export async function getOrderDetailApi(orderId) {
  const response = await customAxios.get(CHECKOUT_API_ROUTES.ORDER_DETAIL(orderId));
  return unwrapData(response);
}

export async function getOrdersApi() {
  const response = await customAxios.get(CHECKOUT_API_ROUTES.ORDERS);
  const orders = unwrapData(response);
  return Array.isArray(orders) ? orders : orders?.data ?? [];
}

export async function cancelOrderApi(orderId, payload) {
  const response = await customAxios.post(CHECKOUT_API_ROUTES.CANCEL_ORDER(orderId), payload);
  return unwrapData(response);
}

export async function returnOrderApi(orderId, payload) {
  const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
  const response = await customAxios.post(
    CHECKOUT_API_ROUTES.RETURN_ORDER(orderId),
    payload,
    isFormData
      ? {
          transformRequest: [
            (data, headers) => {
              delete headers["Content-Type"];
              return data;
            },
          ],
        }
      : undefined,
  );
  return unwrapData(response);
}

function getInvoiceFilename(contentDisposition, fallbackName) {
  if (!contentDisposition) return fallbackName;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return filenameMatch?.[1] ?? fallbackName;
}

export async function downloadOrderInvoiceApi(order) {
  const orderId = order?.id;
  if (!orderId) {
    throw new Error("Order not found.");
  }

  let downloadUrl = order?.invoice_download_url;

  if (!downloadUrl) {
    const orderDetail = await getOrderDetailApi(orderId);
    downloadUrl = orderDetail?.invoice_download_url;
  }

  if (!downloadUrl) {
    downloadUrl = CHECKOUT_API_ROUTES.INVOICE_DOWNLOAD(orderId);
  }

  const response = await customAxios.get(downloadUrl, {
    responseType: "blob",
  });

  const fallbackName = `invoice-${order?.order_number ?? orderId}.pdf`;
  const filename = getInvoiceFilename(response.headers?.["content-disposition"], fallbackName);
  const objectUrl = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
