  'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  LocateFixed,
  PackageCheck,
  Plane,
  ScrollText,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import { LoaderBlock, LoadingLabel } from '@/components/ui/loader';
import IndianPhoneInput from '@/components/ui/indian-phone-input';
import OrderTrackingModal from '@/components/order/OrderTrackingModal';
import { useScrollLock } from '@/hooks/use-scroll-lock';
import { INDIAN_PHONE_PATTERN, sanitizeIndianPhoneDigits } from '@/lib/phone';
import { APP_ROUTES } from '@/lib/routes';
import { cancelOrderApi, downloadOrderInvoiceApi, getOrderDetailApi, getOrdersApi, returnOrderApi, returnOrderPreviewApi } from '@/services/checkout';
import { clearStoredScratchCoupon, scratchCardApi } from '@/services/scratch-card';
import { useAuthStore } from '@/store/auth-store';
import { getApiErrorMessage } from '@/utils/api-error';
import { getAuthStorageKey } from '@/utils/auth-response';
import { formatInrPayment, formatInrPaymentDiscount } from '@/lib/cart/format';
import { getBuyTwoGetOneDiscountLabel } from '@/lib/cart/buy-two-get-one';
import { normalizeOrderSummary } from '@/lib/cart/order-summary';
import { useWebSettings } from '@/hooks/use-web-settings';
import { getBuyTwoGetOneQuantities } from '@/lib/web-settings';

const RETURN_TERMS = [
 'Returns are accepted only within the eligible return period shown for the product.',
  'Please upload clear images of the product while submitting your return request.',
  'The same product shown in the uploaded images must be returned. If a different product, damaged item, or missing accessories are received, the return request may be rejected.',
  'The refund amount will be based on the product and quantity selected in your return request.',
  'Returned items will be inspected after they are received. Refunds will be processed only after successful verification.',
  'Approved refunds are usually credited to the original payment method within 8–10 business days after the return has been approved.',
  'Products that are used, damaged by the customer, or returned without original packaging may not be eligible for a refund.',
  'If the return does not meet our return policy, the refund request may be declined.',
  'For any questions regarding your return or refund, please contact our support team with your Order ID.',
];

const CANCELLATION_POLICY = [
  'Orders can be cancelled only before they are shipped.',
  'If your cancellation is approved, your refund will be processed to the original payment method.',
  'Refunds are usually credited within 5–7 business days. Bank processing times may vary.',
  'Please select the correct cancellation reason to help us process your request quickly.',
  'Providing false or incorrect reasons may delay or reject your refund request.',
  'Once an order has been shipped, it cannot be cancelled.',
  "If you haven't received your refund after the expected time, please contact your bank first, then reach out to our support team with your Order ID.",
];

const RETURN_POLICY = [
  'Returns are accepted only within the eligible return period shown for the product.',
  'Please upload clear images of the product while submitting your return request.',
  'The same product shown in the uploaded images must be returned. If a different product, damaged item, or missing accessories are received, the return request may be rejected.',
  'The refund amount will be based on the product and quantity selected in your return request.',
  'Returned items will be inspected after they are received. Refunds will be processed only after successful verification.',
  'Approved refunds are usually credited to the original payment method within 8–10 business days after the return has been approved.',
  'Products that are used, damaged by the customer, or returned without original packaging may not be eligible for a refund.',
  'If the return does not meet our return policy, the refund request may be declined.',
  'For any questions regarding your return or refund, please contact our support team with your Order ID.',
];

const RETURN_IMAGE_GUIDELINES = [
  'Upload clear images of the product from all required angles.',
  'Ensure the product, packaging, and any accessories are clearly visible.',
  'The product you return must exactly match the product shown in the uploaded images.',
  'Mismatched, incomplete, or incorrect items will not be eligible for a refund.',
];

const EMPTY_RETURN_FORM = { 
  reason: '',
  full_name: '',
  email: '',
  mobile: '',
  upi_id: '',
  product_images: [null, null, null],
};

const RETURN_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
const RETURN_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

function validateReturnImageFile(file, label) {
  if (!file) return null;
  if (!RETURN_IMAGE_TYPES.has(file.type)) {
    return `${label}: use JPG, PNG, or WebP only.`;
  }
  if (file.size > RETURN_IMAGE_MAX_BYTES) {
    return `${label}: must be 2 MB or smaller.`;
  }
  return null;
}

function mapReturnApiErrors(apiErrors) {
  if (!apiErrors || typeof apiErrors !== 'object') return {};

  const formErrors = {};

  Object.entries(apiErrors).forEach(([key, messages]) => {
    const message = Array.isArray(messages) ? messages[0] : messages;
    if (!message) return;

    if (key === 'product_images' || key.startsWith('product_images.')) {
      formErrors.product_images = String(message);
      return;
    }

    if (key in EMPTY_RETURN_FORM) {
      formErrors[key] = String(message);
    }

    if (key === 'items' || key.startsWith('items.')) {
      formErrors.items = String(message);
    }
  });

  return formErrors;
}

export default function MyOrders() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const storageUserKey = getAuthStorageKey(user, token);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionOrderId, setActionOrderId] = useState(null);
  const [invoiceDownloadOrderId, setInvoiceDownloadOrderId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonError, setCancelReasonError] = useState('');
  const [returnOrder, setReturnOrder] = useState(null);
  const [returnStep, setReturnStep] = useState(null);
  const [returnForm, setReturnForm] = useState(EMPTY_RETURN_FORM);
  const [returnFormErrors, setReturnFormErrors] = useState({});
  const [returnItemSelections, setReturnItemSelections] = useState([]);
  const [returnDetailLoading, setReturnDetailLoading] = useState(false);
  const [returnPreviewLoading, setReturnPreviewLoading] = useState(false);
  const [returnPreview, setReturnPreview] = useState(null);
  const [returnItemsError, setReturnItemsError] = useState('');
  const [trackOrder, setTrackOrder] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [policiesOpen, setPoliciesOpen] = useState(false);

  async function loadOrderDetail(orderId) {
    setDetailLoading(true);
    setError('');

    try {
      const orderDetail = await getOrderDetailApi(orderId);
      setSelectedOrder(orderDetail);
    } catch (detailError) {
      setError(getApiErrorMessage(detailError, 'Unable to load order details.'));
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    if (!isHydrated) return undefined;

    if (!isAuthenticated) {
      setOrders([]);
      setSelectedOrder(null);
      setLoading(false);
      return undefined;
    }

    let isCurrent = true;

    async function loadOrders() {
      setLoading(true);
      setError('');

      try {
        const orderList = await getOrdersApi();
        const normalizedOrders = Array.isArray(orderList) ? orderList : [];

        if (isCurrent) setOrders(normalizedOrders);

        if (isCurrent && normalizedOrders[0]?.id) {
          await loadOrderDetail(normalizedOrders[0].id);
        }
      } catch (ordersError) {
        if (isCurrent) setError(getApiErrorMessage(ordersError, 'Unable to load orders.'));
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      isCurrent = false;
    };
  }, [isAuthenticated, isHydrated]);

  const handleTrackOrder = async (order) => {
    if (!order?.id) return;

    setTrackOrder(order);
    setTrackLoading(true);

    try {
      const orderDetail = await getOrderDetailApi(order.id);
      setTrackOrder((current) => (current?.id === order.id ? orderDetail : current));
    } catch {
      // Keep the order data we already have if the refresh fails.
    } finally {
      setTrackLoading(false);
    }
  };

  const closeTrackModal = () => {
    setTrackOrder(null);
    setTrackLoading(false);
  };

  const handleCancelOrder = (orderId) => {
    setCancelOrderId(orderId);
    setCancelReason('');
    setCancelReasonError('');
    setError('');
    setNotice('');
  };

  const closeCancelDialog = () => {
    if (actionOrderId === cancelOrderId) return;
    setCancelOrderId(null);
    setCancelReason('');
    setCancelReasonError('');
  };

  const refreshScratchCouponAfterCancellation = async () => {
    // Always clear the consumed coupon first so checkout never resends the old code,
    // even if fetching the replacement fails.
    clearStoredScratchCoupon(storageUserKey);

    try {
      await scratchCardApi();
    } catch {
      // A fresh coupon may not be available (e.g. campaign inactive). Clearing the old
      // code is the important part; checkout will request a coupon-free summary.
    }
  };

  const submitCancelOrder = async () => {
    const reason = cancelReason.trim();
    if (!reason) {
      setCancelReasonError('Please enter a reason for cancellation.');
      return;
    }

    const orderId = cancelOrderId;
    if (!orderId) return;

    setActionOrderId(orderId);
    setError('');
    setNotice('');
    setCancelReasonError('');

    try {
      await cancelOrderApi(orderId, { reason });

      // Cancelling consumes the coupon that was attached to this order, and the backend
      // issues a fresh one at this point. Drop the now-stale code so the next checkout
      // summary stops sending it, then pull the new coupon for the upcoming checkout.
      await refreshScratchCouponAfterCancellation();

      const orderList = await getOrdersApi();
      setOrders(Array.isArray(orderList) ? orderList : []);
      if (selectedOrder?.id === orderId) await loadOrderDetail(orderId);
      setNotice('Order cancellation request submitted.');
      setCancelOrderId(null);
      setCancelReason('');
    } catch (cancelError) {
      setError(getApiErrorMessage(cancelError, 'Unable to cancel this order.'));
    } finally {
      setActionOrderId(null);
    }
  };

  const handleDownloadInvoice = async (order) => {
    if (!order?.id) return;

    setInvoiceDownloadOrderId(order.id);
    setError('');
    setNotice('');

    try {
      await downloadOrderInvoiceApi(order);
    } catch (invoiceError) {
      setError(getApiErrorMessage(invoiceError, 'Unable to download invoice.'));
    } finally {
      setInvoiceDownloadOrderId(null);
    }
  };

  const handleReturnOrder = async (order) => {
    if (!order?.id) return;

    const deliveryDetails = getDeliveryDetails(order);
    setReturnOrder(order);
    setReturnStep('terms');
    setReturnItemSelections(buildReturnItemSelections(order));
    setReturnForm({
      ...EMPTY_RETURN_FORM,
      full_name: deliveryDetails.name,
      email: deliveryDetails.email,
      mobile: sanitizeIndianPhoneDigits(deliveryDetails.phone),
    });
    setReturnFormErrors({});
    setReturnItemsError('');
    setError('');
    setNotice('');

    setReturnDetailLoading(true);

    try {
      const orderDetail = await getOrderDetailApi(order.id);
      const detailDelivery = getDeliveryDetails(orderDetail);
      setReturnOrder(orderDetail);
      setReturnItemSelections(buildReturnItemSelections(orderDetail));
      setReturnForm({
        ...EMPTY_RETURN_FORM,
        full_name: detailDelivery.name,
        email: detailDelivery.email,
        mobile: sanitizeIndianPhoneDigits(detailDelivery.phone),
      });
    } catch (detailError) {
      setError(getApiErrorMessage(detailError, 'Unable to load order details for return.'));
      setReturnOrder(null);
      setReturnStep(null);
      setReturnItemSelections([]);
    } finally {
      setReturnDetailLoading(false);
    }
  };

  const closeReturnFlow = () => {
    if (actionOrderId === returnOrder?.id || returnDetailLoading || returnPreviewLoading) return;
    setReturnOrder(null);
    setReturnStep(null);
    setReturnForm(EMPTY_RETURN_FORM);
    setReturnFormErrors({});
    setReturnItemSelections([]);
    setReturnItemsError('');
    setReturnPreview(null);
  };

  const openReturnItems = () => {
    setReturnStep('items');
    setReturnItemsError('');
  };

  const updateReturnItemQuantity = (orderItemId, quantity) => {
    setReturnItemSelections((current) =>
      current.map((item) =>
        item.order_item_id === orderItemId
          ? { ...item, quantity: Math.max(0, Math.min(item.maxQuantity, Number(quantity) || 0)) }
          : item,
      ),
    );
    if (returnItemsError) setReturnItemsError('');
  };

  const validateReturnItems = () => {
    const selectedItems = buildReturnItemsPayload(returnItemSelections);
    if (!selectedItems.length) {
      return 'Select at least one item with a return quantity.';
    }

    const invalidItem = returnItemSelections.find(
      (item) => item.quantity > 0 && (item.quantity < 1 || item.quantity > item.maxQuantity),
    );
    if (invalidItem) {
      return `Enter a valid quantity for ${invalidItem.name}.`;
    }

    return '';
  };

  const continueFromReturnItems = async () => {
    const itemsError = validateReturnItems();
    if (itemsError) {
      setReturnItemsError(itemsError);
      return;
    }

    const orderId = returnOrder?.id;
    if (!orderId) return;

    const items = buildReturnItemsPayload(returnItemSelections);
    setReturnPreviewLoading(true);
    setReturnItemsError('');

    try {
      const preview = await returnOrderPreviewApi(orderId, { items });
      setReturnPreview(normalizeReturnPreview(preview));
      setReturnStep('form');
      setReturnFormErrors({});
    } catch (previewError) {
      const apiFieldErrors = mapReturnApiErrors(previewError?.response?.data?.errors);
      if (apiFieldErrors.items) {
        setReturnItemsError(apiFieldErrors.items);
      } else {
        setReturnItemsError(getApiErrorMessage(previewError, 'Unable to preview this return request.'));
      }
    } finally {
      setReturnPreviewLoading(false);
    }
  };

  const updateReturnFormField = (field, value) => {
    setReturnForm((current) => ({ ...current, [field]: value }));
    if (returnFormErrors[field]) {
      setReturnFormErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  };

  const updateReturnProductImage = (index, file) => {
    setReturnForm((current) => {
      const productImages = [...current.product_images];
      productImages[index] = file;
      return { ...current, product_images: productImages };
    });
    if (returnFormErrors.product_images) {
      setReturnFormErrors((current) => {
        const next = { ...current };
        delete next.product_images;
        return next;
      });
    }
  };

  const validateReturnForm = (order) => {
    const errors = {};

    if (!returnForm.reason.trim()) errors.reason = 'Please enter a reason for return.';
    if (!returnForm.product_images[0]) errors.product_images = 'At least one product image is required.';

    returnForm.product_images.forEach((file, index) => {
      if (!file) return;
      const imageError = validateReturnImageFile(file, `Image ${index + 1}`);
      if (imageError) errors.product_images = imageError;
    });

    if (isCodOrder(order)) {
      if (!returnForm.full_name.trim()) errors.full_name = 'Full name is required.';
      if (!returnForm.email.trim()) errors.email = 'Email is required.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(returnForm.email.trim())) {
        errors.email = 'Enter a valid email address.';
      }
      if (!returnForm.mobile.trim()) errors.mobile = 'Mobile number is required.';
      else if (!INDIAN_PHONE_PATTERN.test(returnForm.mobile.trim())) {
        errors.mobile = 'Enter a valid 10-digit Indian mobile number.';
      }
      if (!returnForm.upi_id.trim()) errors.upi_id = 'UPI ID is required for COD refunds.';
    }

    return errors;
  };

  const submitReturnOrder = async () => {
    const orderId = returnOrder?.id;
    if (!orderId) return;

    const errors = validateReturnForm(returnOrder);
    if (Object.keys(errors).length) {
      setReturnFormErrors(errors);
      return;
    }

    setActionOrderId(orderId);
    setReturnFormErrors({});

    try {
      const items = buildReturnItemsPayload(returnItemSelections);
      const formData = new FormData();
      formData.append('reason', returnForm.reason.trim());

      items.forEach((item, index) => {
        formData.append(`items[${index}][order_item_id]`, String(item.order_item_id));
        formData.append(`items[${index}][quantity]`, String(item.quantity));
      });

      if (isCodOrder(returnOrder)) {
        formData.append('full_name', returnForm.full_name.trim());
        formData.append('email', returnForm.email.trim());
        formData.append('mobile', returnForm.mobile.trim());
        formData.append('upi_id', returnForm.upi_id.trim());
      }

      returnForm.product_images.forEach((file, index) => {
        if (file) formData.append(`product_images[${index}]`, file, file.name);
      });

      await returnOrderApi(orderId, formData);
      const orderList = await getOrdersApi();
      setOrders(Array.isArray(orderList) ? orderList : []);
      if (selectedOrder?.id === orderId) await loadOrderDetail(orderId);
      setNotice('Order return request submitted.');
      setReturnOrder(null);
      setReturnStep(null);
      setReturnForm(EMPTY_RETURN_FORM);
      setReturnItemSelections([]);
      setReturnPreview(null);
    } catch (returnError) {
      const apiFieldErrors = mapReturnApiErrors(returnError?.response?.data?.errors);
      if (Object.keys(apiFieldErrors).length) {
        setReturnFormErrors(apiFieldErrors);
      } else {
        setError(getApiErrorMessage(returnError, 'Unable to return this order.'));
      }
    } finally {
      setActionOrderId(null);
    }
  };

  if (!isHydrated || (isAuthenticated && loading)) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12">
        <LoaderBlock />
      </section>
    );
  }

  const isEmpty = orders.length === 0;

  return (
    <section
      className={`flex flex-col ${
        isEmpty
          ? 'fixed inset-0 z-30 w-full items-center justify-center bg-white px-4'
          : 'mx-auto w-full max-w-7xl px-3 py-2 sm:px-4 lg:h-[calc(100vh-5rem)] lg:overflow-hidden lg:px-6'
      }`}
    >
      {error ? <Message tone="error" message={error} /> : null}
      {notice ? <Message tone="success" message={notice} /> : null}

      {orders.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-4 text-center sm:p-4">
          <Image
            src="/assets/orders.png"
            alt="No orders found"
            width={220}
            height={220}
            className="h-auto w-40 max-w-[55vw] sm:w-52"
          />
          <h2 className="mt-5 text-xl font-bold text-gray-950 sm:text-2xl">No orders yet.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600">
            Once you place an order, it will appear here so you can track it anytime.
          </p>
          <Link href={APP_ROUTES.PRODUCTS} className="mt-4 inline-flex h-11 items-center justify-center rounded-full border border-gray-950 bg-transparent px-8 text-sm font-semibold text-gray-950 transition hover:bg-gray-950 hover:text-white">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid min-w-0 gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)] lg:items-stretch lg:overflow-hidden">
          <aside className="min-w-0 space-y-2 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden">
            <div className="shrink-0 rounded-[1.25rem]  p-3 ">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-2xl font-bold text-gray-950">My Orders</h2>
                <button
                  type="button"
                  onClick={() => setPoliciesOpen(true)}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 text-xs font-bold text-gray-700 transition hover:border-gray-950 hover:text-gray-950"
                >
                  <ScrollText className="h-4 w-4" aria-hidden="true" />
                  Policies
                </button>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">Select an order to preview details.</p>
            </div>
            <div className="-mx-3 flex min-w-0 gap-3 overflow-x-auto px-3 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:block lg:min-h-0 lg:flex-1 lg:space-y-2 lg:overflow-y-auto lg:pb-0 lg:pr-2" data-lenis-prevent>
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  selected={selectedOrder?.id === order.id}
                  loading={actionOrderId === order.id}
                  invoiceLoading={invoiceDownloadOrderId === order.id}
                  onView={() => loadOrderDetail(order.id)}
                  onTrack={() => handleTrackOrder(order)}
                  onDownloadInvoice={() => handleDownloadInvoice(order)}
                  onCancel={() => handleCancelOrder(order.id)}
                  onReturn={() => handleReturnOrder(order)}
                />
              ))}
            </div>
          </aside>

          <div className="mb-4 min-w-0 rounded-[1.35rem] border border-gray-100 bg-white p-3 shadow-[0_14px_40px_rgba(17,24,39,0.06)] sm:p-4 lg:mb-0 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:overflow-hidden">
            {detailLoading ? (
              <LoaderBlock className="min-h-[360px] rounded-[1.25rem] border border-gray-100 py-0" />
            ) : selectedOrder ? (
              <OrderDetailScrollContainer>
                <OrderDetail order={selectedOrder} onTrack={() => handleTrackOrder(selectedOrder)} />
              </OrderDetailScrollContainer>
            ) : (
              <div className="flex min-h-[360px] items-center justify-center rounded-[1.25rem] border border-dashed border-gray-200 text-center">
                <div>
                  <PackageCheck className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-3 text-sm font-semibold text-gray-500">Select an order to view details.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <CancelOrderDialog
        open={Boolean(cancelOrderId)}
        loading={actionOrderId === cancelOrderId}
        reason={cancelReason}
        error={cancelReasonError}
        onReasonChange={(value) => {
          setCancelReason(value);
          if (cancelReasonError) setCancelReasonError('');
        }}
        onClose={closeCancelDialog}
        onSubmit={submitCancelOrder}
      />
      <ReturnTermsDialog
        open={returnStep === 'terms'}
        loading={returnDetailLoading}
        orderNumber={returnOrder ? getOrderNumber(returnOrder) : ''}
        onClose={closeReturnFlow}
        onContinue={openReturnItems}
      />
      <ReturnItemsDialog
        open={returnStep === 'items'}
        loading={returnPreviewLoading}
        items={returnItemSelections}
        error={returnItemsError}
        orderNumber={returnOrder ? getOrderNumber(returnOrder) : ''}
        onQuantityChange={updateReturnItemQuantity}
        onClose={closeReturnFlow}
        onContinue={continueFromReturnItems}
      />
      <ReturnOrderFormDialog
        open={returnStep === 'form'}
        loading={actionOrderId === returnOrder?.id}
        order={returnOrder}
        preview={returnPreview}
        form={returnForm}
        errors={returnFormErrors}
        onFieldChange={updateReturnFormField}
        onProductImageChange={updateReturnProductImage}
        onClose={closeReturnFlow}
        onSubmit={submitReturnOrder}
      />
      <OrderTrackingModal
        open={Boolean(trackOrder)}
        loading={trackLoading}
        order={trackOrder}
        onClose={closeTrackModal}
      />
      <PoliciesDialog open={policiesOpen} onClose={() => setPoliciesOpen(false)} />
    </section>
  );
}

function PolicySection({ icon, title, items }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          {icon}
        </span>
        <h3 className="text-base font-bold text-gray-950 sm:text-lg">{title}</h3>
      </div>
      <ul className="mt-3.5 space-y-2.5 text-sm leading-6 text-gray-700">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PoliciesDialog({ open, onClose }) {
  useScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policies-title"
    >
      <button type="button" className="absolute inset-0" aria-label="Close policies dialog" onClick={onClose} />

      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:px-6">
          <div>
            <h2 id="policies-title" className="text-lg font-bold text-gray-950 sm:text-xl">
              Policies
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              Cancellation, return &amp; refund information
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:text-gray-950"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6" data-lenis-prevent>
          <PolicySection
            icon={<XCircle className="h-5 w-5" />}
            title="Cancellation & Refund Policy"
            items={CANCELLATION_POLICY}
          />
          <PolicySection
            icon={<PackageCheck className="h-5 w-5" />}
            title="Return & Refund Policy"
            items={RETURN_POLICY}
          />
          <PolicySection
            icon={<ShieldCheck className="h-5 w-5" />}
            title="📷 Return Image Guidelines"
            items={RETURN_IMAGE_GUIDELINES}
          />
        </div>

        <div className="border-t border-gray-100 px-4 py-3.5 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-gray-950 px-4 text-sm font-bold text-white transition hover:bg-gray-800"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function ReturnTermsDialog({ open, loading, orderNumber, onClose, onContinue }) {
  useScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="return-terms-title"
    >
      <button type="button" className="absolute inset-0" aria-label="Close return terms dialog" onClick={onClose} />

      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.25rem] border border-gray-100 bg-white p-4 shadow-2xl sm:p-5" data-lenis-prevent>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="return-terms-title" className="text-lg font-bold text-gray-950">
              Return Terms &amp; Conditions
            </h2>
            {orderNumber ? (
              <p className="mt-1 text-sm font-medium text-gray-500">
                Order {orderNumber}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:text-gray-950"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ul className="mt-4 space-y-3 text-sm font-medium leading-6 text-gray-700">
          {RETURN_TERMS.map((term) => (
            <li key={term} className="flex gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
              <span>{term}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-gray-200 px-4 text-xs font-bold text-gray-700 transition hover:border-gray-950"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onContinue}
            disabled={loading}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-gray-950 px-4 text-xs font-bold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? (
              <LoadingLabel>
                Loading order...
              </LoadingLabel>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReturnItemsDialog({
  open,
  loading,
  items,
  error,
  orderNumber,
  onQuantityChange,
  onClose,
  onContinue,
}) {
  useScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape' && !loading) onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="return-items-title"
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close return items dialog"
        onClick={onClose}
        disabled={loading}
      />

      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.25rem] border border-gray-100 bg-white p-4 shadow-2xl sm:p-5" data-lenis-prevent>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="return-items-title" className="text-lg font-bold text-gray-950">
              Select items to return
            </h2>
            {orderNumber ? (
              <p className="mt-1 text-sm font-medium text-gray-500">
                Order {orderNumber}
              </p>
            ) : null}
            <p className="mt-1 text-sm font-medium text-gray-500">
              Enter the quantity you want to return for each item.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:text-gray-950 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {items.length ? (
            items.map((item) => (
              <div
                key={item.order_item_id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-gray-800">{item.name}</p>
                  <p className="mt-0.5 text-xs font-medium text-gray-400">
                    Ordered qty: {item.maxQuantity}
                  </p>
                </div>
                <div className="shrink-0">
                  <label htmlFor={`return-qty-${item.order_item_id}`} className="sr-only">
                    Return quantity for {item.name}
                  </label>
                  <input
                    id={`return-qty-${item.order_item_id}`}
                    type="number"
                    min={0}
                    max={item.maxQuantity}
                    value={item.quantity}
                    disabled={loading}
                    onChange={(event) => onQuantityChange(item.order_item_id, event.target.value)}
                    className="h-10 w-20 rounded-xl border border-gray-200 bg-white px-2 text-center text-sm font-semibold text-gray-800 outline-none transition focus:border-gray-950 disabled:opacity-50"
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-gray-200 px-3 py-6 text-center text-sm font-semibold text-gray-400">
              No items found for this order.
            </p>
          )}
        </div>

        {error ? <p className="mt-3 text-xs font-semibold text-red-600">{error}</p> : null}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-gray-200 px-4 text-xs font-bold text-gray-700 transition hover:border-gray-950 disabled:opacity-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onContinue}
            disabled={loading || !items.length}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-gray-950 px-4 text-xs font-bold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? (
              <LoadingLabel>
                Checking...
              </LoadingLabel>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReturnOrderFormDialog({
  open,
  loading,
  order,
  preview,
  form,
  errors,
  onFieldChange,
  onProductImageChange,
  onClose,
  onSubmit,
}) {
  useScrollLock(open);
  const isCod = isCodOrder(order);

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape' && !loading) onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="return-order-title"
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close return order dialog"
        onClick={onClose}
        disabled={loading}
      />

      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.25rem] border border-gray-100 bg-white p-4 shadow-2xl sm:p-5" data-lenis-prevent>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="return-order-title" className="text-lg font-bold text-gray-950">
              Request Refund
            </h2>
            <p className="mt-1 text-sm font-medium text-gray-500">
              {isCod
                ? 'Provide your refund details for this Cash on Delivery order.'
                : 'Provide return details for this online payment order.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:text-gray-950 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {preview?.refund_amount > 0 ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-semibold text-emerald-900">
              You will receive a refund of {formatRefundAmount(preview.refund_amount)}
              {preview.is_partial ? ' for the selected items' : ''}.
            </p>
            {preview.items.length > 0 ? (
              <ul className="mt-2 space-y-1.5">
                {preview.items.map((item) => (
                  <li
                    key={item.order_item_id}
                    className="flex items-start justify-between gap-3 text-xs font-medium text-emerald-800"
                  >
                    <span className="min-w-0 break-words">
                      {item.product_name}
                      {item.size_text ? ` · ${item.size_text}` : ''}
                      {item.quantity > 1 ? ` × ${item.quantity}` : ''}
                    </span>
                    <span className="shrink-0 font-semibold">
                      {formatRefundAmount(item.refund_amount)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 space-y-4">
          <ReturnFormField
            id="return-reason"
            label="Reason"
            error={errors.reason}
          >
            <textarea
              id="return-reason"
              value={form.reason}
              onChange={(event) => onFieldChange('reason', event.target.value)}
              rows={3}
              disabled={loading}
              className="mt-2 w-full resize-none rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none transition placeholder:text-gray-300 focus:border-gray-950 disabled:opacity-50"
              placeholder="e.g. Received wrong color"
            />
          </ReturnFormField>

          {isCod ? (
            <>
              <ReturnFormField id="return-full-name" label="Full name" error={errors.full_name}>
                <input
                  id="return-full-name"
                  type="text"
                  value={form.full_name}
                  onChange={(event) => onFieldChange('full_name', event.target.value)}
                  disabled={loading}
                  className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 outline-none transition placeholder:text-gray-300 focus:border-gray-950 disabled:opacity-50"
                  placeholder="Aayush Savliya"
                />
              </ReturnFormField>

              <ReturnFormField id="return-email" label="Email" error={errors.email}>
                <input
                  id="return-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => onFieldChange('email', event.target.value)}
                  disabled={loading}
                  className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 outline-none transition placeholder:text-gray-300 focus:border-gray-950 disabled:opacity-50"
                  placeholder="aayush@example.com"
                />
              </ReturnFormField>

              <ReturnFormField id="return-mobile" label="Mobile" error={errors.mobile}>
                <IndianPhoneInput
                  id="return-mobile"
                  value={form.mobile}
                  onChange={(value) => onFieldChange('mobile', value)}
                  disabled={loading}
                  className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-800 outline-none transition placeholder:text-gray-300 focus-within:border-gray-950 disabled:opacity-50"
                />
              </ReturnFormField>

              <ReturnFormField id="return-upi-id" label="UPI ID" error={errors.upi_id}>
                <input
                  id="return-upi-id"
                  type="text"
                  value={form.upi_id}
                  onChange={(event) => onFieldChange('upi_id', event.target.value)}
                  disabled={loading}
                  className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 outline-none transition placeholder:text-gray-300 focus:border-gray-950 disabled:opacity-50"
                  placeholder="aayush@upi"
                />
              </ReturnFormField>
            </>
          ) : null}

          <ReturnFormField
            label="Please upload the image of the product you want to return"
            error={errors.product_images}
            sentenceLabel
          >
            <div className="mt-2 space-y-2">
              {form.product_images.map((file, index) => (
                <label
                  key={`return-image-${index}`}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-3 py-2.5 transition hover:border-gray-400"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      Image {index + 1} {index === 0 ? '(required)' : '(optional)'}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-gray-700">
                      {file?.name ?? 'Choose a file'}
                    </p>
                    <p className="mt-0.5 text-[0.68rem] font-medium text-gray-400">JPG, PNG, or WebP · max 2 MB</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-700 ring-1 ring-gray-200">
                    Browse
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={loading}
                    onChange={(event) => onProductImageChange(index, event.target.files?.[0] ?? null)}
                  />
                </label>
              ))}
            </div>
          </ReturnFormField>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-gray-200 px-4 text-xs font-bold text-gray-700 transition hover:border-gray-950 disabled:opacity-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-gray-950 px-4 text-xs font-bold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? (
              <LoadingLabel>
                Submitting...
              </LoadingLabel>
            ) : (
              'Submit return request'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReturnFormField({ id, label, error, sentenceLabel = false, children }) {
  const labelClassName = sentenceLabel
    ? 'text-sm font-semibold normal-case tracking-normal text-gray-700'
    : 'text-xs font-bold uppercase tracking-wide text-gray-400';

  return (
    <div>
      {id ? (
        <label htmlFor={id} className={`block ${labelClassName}`}>
          {label}
        </label>
      ) : (
        <p className={labelClassName}>{label}</p>
      )}
      {children}
      {error ? <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}

function CancelOrderDialog({ open, loading, reason, error, onReasonChange, onClose, onSubmit }) {
  useScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-order-title"
    >
      <button type="button" className="absolute inset-0" aria-label="Close cancel order dialog" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-[1.25rem] border border-gray-100 bg-white p-4 shadow-2xl sm:p-5" data-lenis-prevent>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="cancel-order-title" className="text-lg font-bold text-gray-950">
              Cancel Order
            </h2>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Please enter the reason for cancellation.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:text-gray-950 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label htmlFor="cancel-order-reason" className="mt-4 block text-xs font-bold uppercase tracking-wide text-gray-400">
          Reason
        </label>
        <textarea
          id="cancel-order-reason"
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          rows={4}
          className="mt-2 w-full resize-none rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none transition placeholder:text-gray-300 focus:border-gray-950"
          placeholder="Enter cancellation reason"
          disabled={loading}
          autoFocus
        />
        {error ? <p className="mt-2 text-xs font-semibold text-red-600">{error}</p> : null}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-gray-200 px-4 text-xs font-bold text-gray-700 transition hover:border-gray-950 disabled:opacity-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-gray-950 px-4 text-xs font-bold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? (
              <LoadingLabel>
                Submitting...
              </LoadingLabel>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function canCancelOrder(order) {
  if (typeof order?.can_be_cancelled === 'boolean') {
    return order.can_be_cancelled;
  }

  const status = String(order?.status ?? '').toLowerCase();
  return !['cancelled', 'delivered', 'returned'].includes(status);
}

function canReturnOrder(order) {
  if (typeof order?.can_be_returned === 'boolean') {
    return order.can_be_returned;
  }

  return String(order?.status ?? '').toLowerCase() === 'delivered';
}

function isDeliveredOrder(order) {
  const status = String(order?.status ?? '').toLowerCase();
  const shipmentStatus = String(order?.shipment?.shipment_status ?? '').toLowerCase();
  const rawStatus = String(order?.shipment?.raw_status ?? '').toLowerCase();

  return ['delivered'].includes(status) || ['delivered'].includes(shipmentStatus) || ['delivered'].includes(rawStatus);
}

function canPayRefund(order) {
  if (typeof order?.can_pay_refund === 'boolean') {
    return order.can_pay_refund;
  }

  if (typeof order?.canPayRefund === 'boolean') {
    return order.canPayRefund;
  }

  return false;
}

function normalizeStatusValue(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '_');
}

function getReturnDisplayStatus(order) {
  const returnStatus = normalizeStatusValue(order?.shipment?.return?.status);
  const orderStatus = normalizeStatusValue(order?.status);

  if (['returned', 'return_completed', 'return_complete'].includes(orderStatus) || ['returned', 'return_completed', 'return_complete', 'delivered'].includes(returnStatus)) {
    return 'delivered';
  }

  if (returnStatus === 'out_for_delivery') {
    return 'out_for_delivery';
  }

  if (returnStatus === 'in_transit') {
    return 'in_transit';
  }

  if (['picked_up', 'pickup_pending'].includes(returnStatus)) {
    return 'picked_up';
  }

  if (['return_requested', 'requested'].includes(returnStatus) || orderStatus === 'return_requested') {
    return 'return_requested';
  }

  if (returnStatus === 'return_processing' || orderStatus === 'return_processing') {
    return 'return_processing';
  }

  return null;
}

function formatReturnDisplayStatus(status) {
  const labels = {
    return_requested: 'Return Requested',
    return_processing: 'Return Processing',
    picked_up: 'Package Picked Up',
    in_transit: 'Return In Transit',
    out_for_delivery: 'Arriving at Warehouse',
    delivered: 'Return Completed',
  };

  return labels[status] ?? formatShipmentStatus(status);
}

function getReturnStatusTone(status) {
  const normalized = normalizeStatusValue(status);

  if (['delivered', 'returned'].includes(normalized)) {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
  }

  if (
    ['return_requested', 'return_processing', 'picked_up', 'pickup_pending', 'in_transit', 'out_for_delivery'].includes(
      normalized,
    )
  ) {
    return 'bg-amber-50 text-amber-700 ring-amber-100';
  }

  return 'bg-gray-100 text-gray-700 ring-gray-200';
}

function getOrderStatusMode(order) {
  if (getReturnDisplayStatus(order) !== null) return 'returned';
  if (isDeliveredOrder(order)) return 'delivered';
  return 'default';
}

function OrderCard({ order, selected, loading, invoiceLoading, onView, onTrack, onDownloadInvoice, onCancel, onReturn }) {
  const cancelled = isCancelledOrder(order);
  const canCancel = !cancelled && canCancelOrder(order);
  const canReturn = !cancelled && canReturnOrder(order);
  const showRefundIndicator = canPayRefund(order);
  const shipmentStatus = order?.shipment?.shipment_status;
  const returnDisplayStatus = getReturnDisplayStatus(order);
  const delivered = isDeliveredOrder(order);
  const isReturnTracking = returnDisplayStatus !== null;
  const isReturnCompleted = returnDisplayStatus === 'delivered';
  const statusMode = getOrderStatusMode(order);
  const shouldShowTrackingButton =
    !cancelled && !isReturnCompleted && (!delivered || returnDisplayStatus !== null);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onView}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onView();
        }
      }}
      className={`w-[calc(100vw-2.25rem)] min-w-[calc(100vw-2.25rem)] cursor-pointer rounded-[1.25rem] border bg-white p-2.5 shadow-[0_12px_34px_rgba(17,24,39,0.05)] transition hover:border-gray-300 sm:w-auto sm:min-w-0 sm:p-3 ${selected ? 'border-gray-950 ring-2 ring-gray-950/10' : 'border-gray-100'}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Order number</p>
          <h2 className="mt-0.5 break-words text-[0.82rem] font-bold text-gray-950 sm:text-sm">{getOrderNumber(order)}</h2>
          <div className="mt-1.5 space-y-1 text-[0.65rem] font-semibold text-gray-500 sm:text-[0.68rem]">
            {statusMode === 'default' ? (
              <StatusLine label="Order Status" value={formatOrderStatus(order.status ?? 'pending')} />
            ) : null}
            {statusMode === 'delivered' ? (
              <StatusLine label="Delivery Status" value={formatOrderStatus(order.status ?? 'pending')} />
            ) : null}
            <StatusLine label="Payment status" value={formatPaymentStatus(order.payment_status ?? 'pending')} />
            {shipmentStatus && statusMode !== 'returned' ? (
              <StatusLine label="Shipment" value={formatShipmentStatus(shipmentStatus)} />
            ) : null}
            {returnDisplayStatus ? (
              <StatusLine label="Return" value={formatReturnDisplayStatus(returnDisplayStatus)} />
            ) : null}
          </div>
        </div>
        <p className="shrink-0 text-sm font-bold text-gray-950 sm:text-base">{formatMoney(order.total_amount)}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onView} className="h-8 rounded-full bg-gray-950 px-3 text-[0.68rem] font-bold text-white transition hover:bg-gray-800 sm:h-9 sm:px-3.5 sm:text-xs">
          View details
        </button>
        {!cancelled ? (
          <button
            type="button"
            onClick={onDownloadInvoice}
            disabled={invoiceLoading}
            className="h-8 rounded-full border border-gray-200 px-3 text-[0.68rem] font-bold text-gray-700 transition hover:border-gray-950 disabled:opacity-50 sm:h-9 sm:px-3.5 sm:text-xs"
          >
            {invoiceLoading ? (
              <LoadingLabel>
                Downloading...
              </LoadingLabel>
            ) : (
              'Download Invoice'
            )}
          </button>
        ) : null}
        {shouldShowTrackingButton ? (
          <button
            type="button"
            onClick={onTrack}
            className="inline-flex h-8 items-center justify-center rounded-full border border-gray-200 px-3 text-[0.68rem] font-bold text-gray-700 transition hover:border-gray-950 sm:h-9 sm:px-3.5 sm:text-xs"
          >
            {isReturnTracking ? 'Return Tracking' : 'Track Order'}
          </button>
        ) : null}
        {canCancel ? (
          <button type="button" onClick={onCancel} disabled={loading} className="h-8 rounded-full border border-red-100 px-3 text-[0.68rem] font-bold text-red-700 transition hover:border-red-300 disabled:opacity-50 sm:h-9 sm:px-3.5 sm:text-xs">
            {loading ? (
              <LoadingLabel>
                Cancelling...
              </LoadingLabel>
            ) : (
              'Cancel order'
            )}
          </button>
        ) : null}
        {showRefundIndicator ? (
          <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 text-[0.68rem] font-bold text-emerald-700 sm:h-9 sm:px-3.5 sm:text-xs">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Refund
          </span>
        ) : null}
        {canReturn ? (
          <button type="button" onClick={onReturn} disabled={loading} className="h-8 rounded-full border border-amber-100 px-3 text-[0.68rem] font-bold text-amber-700 transition hover:border-amber-300 disabled:opacity-50 sm:h-9 sm:px-3.5 sm:text-xs">
            {loading ? (
              <LoadingLabel>
                Returning...
              </LoadingLabel>
            ) : (
              'Return order'
            )}
          </button>
        ) : null}
      </div>
    </article>
  );
}

function StatusLine({ label, value }) {
  const tone = getStatusTone(value);

  return (
    <p>
      <span className="text-gray-400">{label}: </span>
      <span className={`rounded-full px-1.5 py-0.5 capitalize ${tone}`}>{value}</span>
    </p>
  );
}

function StatusBadge({ label, value }) {
  const tone = getStatusTone(value);

  return (
    <span className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[0.68rem] font-bold ring-1 ${tone}`}>
      <span className="opacity-70">{label}: </span>
      <span className="ml-1 min-w-0 break-words capitalize">{value}</span>
    </span>
  );
}

function getStatusTone(value) {
  const status = String(value ?? '').toLowerCase();

  if (['paid', 'delivered', 'completed', 'success'].includes(status)) {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
  }

  if (['pending', 'processing', 'return_requested', 'return requested', 'return processing'].includes(status)) {
    return 'bg-amber-50 text-amber-700 ring-amber-100';
  }

  if (['cancelled', 'failed', 'rejected', 'returned'].includes(status)) {
    return 'bg-red-50 text-red-700 ring-red-100';
  }

  return 'bg-gray-100 text-gray-700 ring-gray-200';
}

function OrderDetailScrollContainer({ children }) {
  const scrollRef = useRef(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const checkOverflow = () => {
      setHasOverflow(scrollEl.scrollHeight > scrollEl.clientHeight);
    };

    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(scrollEl);

    const contentEl = scrollEl.firstElementChild;
    if (contentEl) {
      resizeObserver.observe(contentEl);
    }

    return () => resizeObserver.disconnect();
  }, [children]);

  return (
    <div
      ref={scrollRef}
      className={`min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${hasOverflow ? 'pb-8' : ''}`}
      data-lenis-prevent
    >
      {children}
    </div>
  );
}

function OrderDetail({ order, onTrack }) {
  const { data: settings } = useWebSettings();
  const { buyQty, getQty } = getBuyTwoGetOneQuantities(settings);
  const buyTwoGetOneDiscountLabel = getBuyTwoGetOneDiscountLabel(buyQty, getQty);
  const items = getOrderItems(order);
  const orderDate = formatDate(order.order_date ?? order.created_at ?? order.createdAt);
  const estimatedDelivery = formatEstimatedDeliveryDate(order?.shipment?.estimated_delivery_at);
  const returnDate = formatDate(getReturnRequestedDate(order));
  const deliveryDetails = getDeliveryDetails(order);
  const shipment = order?.shipment;
  const returnDisplayStatus = getReturnDisplayStatus(order);
  const cancelled = isCancelledOrder(order);
  const delivered = isDeliveredOrder(order);
  const isReturnTracking = returnDisplayStatus !== null;
  const isReturnCompleted = returnDisplayStatus === 'delivered';
  const statusMode = getOrderStatusMode(order);
  const shouldShowTrackingButton =
    !cancelled && !isReturnCompleted && (!delivered || returnDisplayStatus !== null);
  const showEstimatedDelivery = !cancelled && !isReturnTracking && (delivered || Boolean(estimatedDelivery));
  const amounts = normalizeOrderSummary(order);

  return (
    <div className="space-y-3">
      <div className="rounded-[1.1rem] bg-[#fbfaf7] p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-gray-500">Order details</p>
            <h2 className="mt-1 break-words text-xl font-bold tracking-tight text-gray-950">
              {getOrderNumber(order)}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {isReturnTracking ? (
                <span className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[0.68rem] font-bold ring-1 ${getReturnStatusTone(returnDisplayStatus)}`}>
                  <span className="opacity-70">Return Status: </span>
                  <span className="ml-1 min-w-0 break-words capitalize">{formatReturnDisplayStatus(returnDisplayStatus)}</span>
                </span>
              ) : statusMode === 'delivered' ? (
                <StatusBadge label="Delivery Status" value={formatOrderStatus(order.status ?? 'pending')} />
              ) : (
                <StatusBadge label="Order Status" value={formatOrderStatus(order.status ?? 'pending')} />
              )}
              <StatusBadge label="Payment status" value={formatPaymentStatus(order.payment_status ?? 'pending')} />
              {statusMode === 'delivered' && shipment?.shipment_status ? (
                <StatusBadge label="Shipment Status" value={formatShipmentStatus(shipment.shipment_status, shipment.raw_status)} />
              ) : null}
            </div>
          </div>

          {shouldShowTrackingButton ? (
            <div className="flex flex-row gap-2 lg:shrink-0">
              <button
                type="button"
                onClick={onTrack}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-gray-950 px-3.5 text-xs font-bold text-white transition hover:bg-gray-800"
              >
                {isReturnTracking ? 'Return Tracking' : 'Track order'}
                <LocateFixed className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>

        <div className={`mt-3 grid gap-3 ${showEstimatedDelivery ? 'sm:grid-cols-2' : ''}`}>
          <div className="rounded-xl bg-white p-2.5 ring-1 ring-gray-100">
            <p className="text-[0.68rem] font-bold uppercase tracking-wide text-gray-400">
              {isReturnTracking ? 'Return date' : 'Order date'}
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-800">{isReturnTracking ? returnDate : orderDate}</p>
          </div>
          {showEstimatedDelivery ? (
            <div className="rounded-xl bg-white p-2.5 ring-1 ring-gray-100">
              <p className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-wide text-gray-400">
                <Plane className="h-4 w-4 text-gray-950" />
                Estimated delivery
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-800">{delivered ? 'Delivered' : estimatedDelivery}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="divide-y divide-gray-100 rounded-[1.1rem] border border-gray-200 px-3">
        {items.length ? (
          items.map((item, index) => (
            <OrderItemRow key={`${item.id ?? getItemName(item)}-${index}`} item={item} />
          ))
        ) : (
          <div className="py-8 text-center text-sm font-semibold text-gray-400">No items found for this order.</div>
        )}
      </div>

      {(shipment?.shipment_status && statusMode === 'default') || shipment?.waybill || shipment?.provider ? (
        <div className="rounded-[1.1rem] border border-gray-200 p-3">
          <h3 className="text-base font-bold text-gray-950">Shipment</h3>
          <div className="mt-3 space-y-1.5 text-sm">
            {shipment?.shipment_status && statusMode === 'default' ? (
              <DeliveryField
                label="Status"
                value={formatShipmentStatus(shipment.shipment_status, shipment.raw_status)}
              />
            ) : null}
            {shipment?.waybill ? <DeliveryField label="Waybill" value={shipment.waybill} /> : null}
            {shipment?.provider ? (
              <DeliveryField label="Courier" value={shipment.provider} />
            ) : null}
          </div>
        </div>
      ) : null}

      <div className={`grid gap-3 ${isReturnTracking ? '' : 'md:grid-cols-2'}`}>
        <div className="rounded-[1.1rem] border border-gray-200 p-3">
          <h3 className="text-base font-bold text-gray-950">Payment</h3>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-gray-500">Method</span>
              <span className="break-words text-right font-semibold text-gray-700">{getPaymentLabel(order)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-gray-500">Status</span>
              <span className="break-words text-right font-semibold capitalize text-gray-700">{formatPaymentStatus(order.payment_status ?? 'pending')}</span>
            </div>
          </div>
          <dl className="mt-4 space-y-1.5 text-xs">
            {amounts.itemsSubtotal > 0 ? <Amount label="Items Total" value={amounts.itemsSubtotal} /> : null}
            <Amount label="Subtotal" value={amounts.subtotal || order.subtotal} />
            <Amount label="Tax (GST)" value={amounts.taxAmount} />
            <Amount label="Shipping" value={amounts.shippingAmount} />
            {amounts.buyTwoGetOneDiscountAmount > 0 ? (
              <Amount label={buyTwoGetOneDiscountLabel} value={amounts.buyTwoGetOneDiscountAmount} discount />
            ) : null}
            {amounts.firstOrderDiscountAmount > 0 ? (
              <Amount label="First Order Discount" value={amounts.firstOrderDiscountAmount} discount />
            ) : null}
            {amounts.onlinePaymentDiscountAmount > 0 ? (
              <Amount label={`${settings?.online_payment_discount_percent ?? 0}% Online Payment Discount`} value={amounts.onlinePaymentDiscountAmount} discount />
            ) : null}
            {amounts.discountAmount > 0 ? (
              <Amount
                label={`Scratch Discount${amounts.discountPercent > 0 ? ` (${amounts.discountPercent}%)` : ''}`}
                value={amounts.discountAmount}
                discount
              />
            ) : null}
            {amounts.codCharge > 0 ? <Amount label="COD Charge" value={amounts.codCharge} /> : null}
            <Amount label="Total" value={amounts.total || order.total_amount} strong />
          </dl>
        </div>

        {!isReturnTracking ? (
          <div className="rounded-[1.1rem] border border-gray-200 p-3">
            <h3 className="text-base font-bold text-gray-950">Delivery</h3>
            <div className="mt-3">
              <div className="space-y-1.5 text-sm leading-5">
                <DeliveryField label="Name" value={deliveryDetails.name} />
                <DeliveryField label="Email" value={deliveryDetails.email} />
                <DeliveryField label="Phone" value={deliveryDetails.phone} />
                <DeliveryField label="Address" value={deliveryDetails.address} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Amount({ label, value, strong = false, discount = false }) {
  const valueClassName = discount
    ? 'font-semibold text-emerald-700'
    : strong
      ? 'font-bold text-gray-950'
      : 'font-semibold text-gray-900';

  return (
    <div className="flex items-center justify-between gap-4">
      <dt className={strong ? 'font-bold text-gray-950' : 'font-semibold text-gray-500'}>{label}</dt>
      <dd className={valueClassName}>{discount ? formatInrPaymentDiscount(value) : formatMoney(value)}</dd>
    </div>
  );
}

function DeliveryField({ label, value }) {
  return (
    <div className="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-2">
      <span className="font-semibold text-gray-400">{label}</span>
      <span className="break-words font-semibold text-gray-700">{value || '-'}</span>
    </div>
  );
}

function OrderItemRow({ item }) {
  const productName = getItemName(item);
  const itemImageSrc = getItemImageSrc(item);
  const attributes = [item.color, item.variant, item.size_text ?? item.product_size?.size_text ?? item.size].filter(Boolean);

  return (
    <article className="grid min-w-0 grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 py-2.5">
      <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
        {itemImageSrc ? (
          <Image
            src={itemImageSrc}
            alt={productName}
            fill
            className="object-contain object-center"
            sizes="80px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center px-2 text-center text-xs font-semibold text-gray-300">
            No image
          </span>
        )}
      </div>

      <div className="min-w-0">
        <h3 className="break-words text-sm font-semibold text-gray-700">{productName}</h3>
        <p className="mt-0.5 break-words text-xs font-medium text-gray-400">
          {attributes.length ? attributes.join(' | ') : 'Product details'}
        </p>
      </div>

      <div className="whitespace-nowrap text-right">
        <p className="text-sm font-bold text-gray-950">{formatMoney(getItemTotal(item))}</p>
        <p className="mt-0.5 text-xs font-semibold text-gray-400">Qty: {item.quantity ?? 1}</p>
      </div>
    </article>
  );
}

function Message({ tone, message }) {
  const isError = tone === 'error';
  return (
    <div className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${isError ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
      {isError ? <XCircle className="mt-0.5 h-5 w-5 shrink-0" /> : <PackageCheck className="mt-0.5 h-5 w-5 shrink-0" />}
      <span>{message}</span>
    </div>
  );
}

function getOrderNumber(order, includeHash = true) {
  const value = order?.order_number ?? order?.orderNumber ?? order?.id;
  if (!value) return '-';

  const stringValue = String(value);
  if (!includeHash) return stringValue.replace(/^#/, '');

  return stringValue.startsWith('#') ? stringValue : `#${stringValue}`;
}

function getOrderItems(order) {
  return [order?.order_items, order?.orderItems, order?.items].find((items) => Array.isArray(items)) ?? [];
}

function getOrderItemId(item) {
  return item.order_item_id ?? item.orderItemId ?? item.id;
}

function buildReturnItemSelections(order) {
  return getOrderItems(order)
    .map((item) => {
      const orderItemId = getOrderItemId(item);
      if (orderItemId == null) return null;

      return {
        order_item_id: orderItemId,
        name: getItemName(item),
        maxQuantity: Number(item.quantity ?? 1),
        quantity: 0,
      };
    })
    .filter(Boolean);
}

function buildReturnItemsPayload(selections) {
  return selections
    .filter((item) => Number(item.quantity) > 0)
    .map((item) => ({
      order_item_id: item.order_item_id,
      quantity: Number(item.quantity),
    }));
}

function normalizeReturnPreview(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const items = Array.isArray(raw.items) ? raw.items : [];
  const refundAmount = Number(raw.refund_amount ?? raw.refundAmount ?? 0);

  return {
    items: items.map((item) => ({
      order_item_id: item.order_item_id ?? item.orderItemId,
      product_name: item.product_name ?? item.productName ?? 'Product',
      size_text: item.size_text ?? item.sizeText ?? '',
      quantity: Number(item.quantity ?? 0),
      refund_amount: Number(item.refund_amount ?? item.refundAmount ?? 0),
    })),
    refund_amount: refundAmount,
    is_partial: Boolean(raw.is_partial ?? raw.isPartial),
  };
}

function formatRefundAmount(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function getItemName(item) {
  return item.product_name ?? item.product?.name ?? item.name ?? 'Product';
}

function getItemTotal(item) {
  const quantity = Number(item.quantity ?? 1);
  const price = item.total ?? item.subtotal ?? item.total_amount ?? item.price ?? item.product?.price;

  if (price === undefined || price === null) return null;
  if (item.total || item.subtotal || item.total_amount) return price;

  return Number(price) * quantity;
}

function getItemImageSrc(item) {
  const product = item.product ?? {};
  const imageSources = [
    item.image,
    item.image_url,
    item.image_path,
    item.product_image,
    item.productImage,
    product.image,
    product.image_url,
    product.image_path,
    product.images,
    product.product_images,
  ];

  for (const source of imageSources) {
    const imageValue = imageUrlFromValue(source);
    if (imageValue) return imageValue;
  }

  return '';
}

function imageUrlFromValue(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;

  if (Array.isArray(value)) {
    const primaryImage = value.find((image) => image?.is_primary) ?? value[0];
    return imageUrlFromValue(primaryImage);
  }

  return value.image_url || value.image_path || value.url || value.src || '';
}

function getPaymentLabel(order) {
  const method = order.payment_method ?? order.paymentMethod ?? 'Payment method';
  const lastFour = order.card_last_four ?? order.card_last4 ?? order.payment_last_four;

  return lastFour ? `${method} **${lastFour}` : method;
}

function isCodOrder(order) {
  const method = String(order?.payment_method ?? order?.paymentMethod ?? '').toLowerCase();
  return method === 'cod' || method.includes('cash on delivery');
}

function getDeliveryDetails(order) {
  const address = order.shipping_address ?? order.delivery_address ?? order.address ?? order.billing_address;
  if (!address) {
    return {
      name: order.customer_name ?? order.name ?? '',
      email: order.customer_email ?? order.email ?? '',
      phone: order.customer_phone ?? order.phone ?? order.mobile ?? '',
      address: '',
    };
  }

  if (typeof address === 'string') {
    return {
      name: order.customer_name ?? order.name ?? '',
      email: order.customer_email ?? order.email ?? '',
      phone: order.customer_phone ?? order.phone ?? order.mobile ?? '',
      address,
    };
  }

  const street = [address.address_line_1, address.address_line_2, address.street, address.apartment]
    .filter(Boolean)
    .join(' ');
  const locality = [address.city, address.state].filter(Boolean).join(', ');
  const countryLine = [address.country, address.postal_code ?? address.pincode ?? address.zip].filter(Boolean).join(' ');

  return {
    name: address.name ?? address.full_name ?? order.customer_name ?? order.name ?? '',
    email: address.email ?? order.customer_email ?? order.email ?? '',
    phone: address.phone ?? address.mobile ?? address.phone_number ?? order.customer_phone ?? order.phone ?? order.mobile ?? '',
    address: [street, locality, countryLine].filter(Boolean).join(', '),
  };
}

function formatShipmentStatus(status, rawStatus) {
  if (rawStatus && String(rawStatus).trim()) {
    return String(rawStatus).trim();
  }

  return String(status ?? '')
    .trim()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const ORDER_STATUS_LABELS = {
  return_requested: 'Return Requested',
  return_processing: 'Return Processing',
};

const PAYMENT_STATUS_LABELS = {
  return_processing: 'Return Processing',
};

function formatPaymentStatus(status) {
  const key = String(status ?? '').trim().toLowerCase();
  if (!key) return 'Pending';
  if (PAYMENT_STATUS_LABELS[key]) return PAYMENT_STATUS_LABELS[key];

  return formatOrderStatus(status);
}

function formatOrderStatus(status) {
  const key = String(status ?? '').trim().toLowerCase();
  if (!key) return 'Pending';
  if (ORDER_STATUS_LABELS[key]) return ORDER_STATUS_LABELS[key];

  return key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function isCancelledOrder(order) {
  return String(order?.status ?? '').trim().toLowerCase() === 'cancelled';
}

function parseDateValue(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const normalized = typeof value === 'string' ? value.trim().replace(' ', 'T') : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatEstimatedDeliveryDate(value) {
  const date = parseDateValue(value);
  if (!date) return null;

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getReturnRequestedDate(order) {
  const returnData = order?.shipment?.return ?? {};
  return returnData.requested_at ?? returnData.date ?? returnData.return_date ?? returnData.created_at ?? null;
}

function formatDate(value) {
  if (!value) return 'Processing';

  const date = parseDateValue(value);
  if (!date) return String(value);

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatMoney(value) {
  return value !== undefined && value !== null && value !== '' ? formatInrPayment(Number(value)) : '-';
}
