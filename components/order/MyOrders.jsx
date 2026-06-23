'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  LocateFixed,
  PackageCheck,
  Plane,
  X,
  XCircle,
} from 'lucide-react';
import { LoaderBlock, LoadingLabel } from '@/components/ui/loader';
import IndianPhoneInput from '@/components/ui/indian-phone-input';
import { useScrollLock } from '@/hooks/use-scroll-lock';
import { INDIAN_PHONE_PATTERN, sanitizeIndianPhoneDigits } from '@/lib/phone';
import { APP_ROUTES, AUTH_PAGE_ROUTES, withRedirect } from '@/lib/routes';
import { cancelOrderApi, downloadOrderInvoiceApi, getOrderDetailApi, getOrdersApi, returnOrderApi, returnOrderPreviewApi } from '@/services/checkout';
import { useAuthStore } from '@/store/auth-store';
import { getApiErrorMessage } from '@/utils/api-error';
import { formatInr } from '@/lib/cart/format';

const RETURN_TERMS = [
  'The product must be returned within the allowed return period.',
  'The product must be unused and in its original condition.',
  'Return approval is subject to verification.',
  'The refund will be processed within 3 business days after the returned product is received and approved.',
  'Shipping charges and promotional discounts may not be refundable unless required by applicable consumer protection laws.',
  'Kayra Aura reserves the right to reject returns that do not meet the above conditions.',
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
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
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
    if (!isHydrated || !isAuthenticated) return undefined;

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

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace(withRedirect(AUTH_PAGE_ROUTES.LOGIN, APP_ROUTES.ORDERS));
    }
  }, [isAuthenticated, isHydrated, router]);

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

  if (!isHydrated || !isAuthenticated || loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12">
        <LoaderBlock />
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col px-3 py-2 sm:px-4 lg:h-[calc(100vh-5rem)] lg:overflow-hidden lg:px-6">
      {error ? <Message tone="error" message={error} /> : null}
      {notice ? <Message tone="success" message={notice} /> : null}

      {orders.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white p-10 text-center">
          <PackageCheck className="mx-auto h-12 w-12 text-[#4f3128]" />
          <p className="mt-4 text-lg font-bold text-gray-950">No orders found.</p>
          <Link href={APP_ROUTES.PRODUCTS} className="mt-4 inline-flex h-11 items-center justify-center bg-gray-950 px-5 text-sm font-bold text-white">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid min-w-0 gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)] lg:items-stretch lg:overflow-hidden">
          <aside className="min-w-0 space-y-2 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden">
            <div className="shrink-0 rounded-[1.25rem]  p-3 ">
              <h2 className="text-2xl font-bold text-gray-950">My Orders</h2>
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
                <OrderDetail order={selectedOrder} />
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
    </section>
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

function getReturnDisplayStatus(order) {
  const returnStatus = String(order?.shipment?.return?.status ?? '').toLowerCase();
  const orderStatus = String(order?.status ?? '').toLowerCase();

  if (orderStatus === 'returned' || returnStatus === 'delivered') {
    return 'returned';
  }

  if (['picked_up', 'in_transit', 'out_for_delivery'].includes(returnStatus)) {
    return 'return_processing';
  }

  if (orderStatus === 'return_requested') {
    return 'return_requested';
  }

  return null;
}

function formatReturnDisplayStatus(status) {
  const labels = {
    return_requested: 'Return Requested',
    return_processing: 'Return Processing',
    returned: 'Returned',
  };

  return labels[status] ?? formatShipmentStatus(status);
}

function OrderCard({ order, selected, loading, invoiceLoading, onView, onDownloadInvoice, onCancel, onReturn }) {
  const canCancel = canCancelOrder(order);
  const canReturn = canReturnOrder(order);
  const shipmentStatus = order?.shipment?.shipment_status;
  const returnDisplayStatus = getReturnDisplayStatus(order);

  return (
    <article className={`w-[calc(100vw-2.25rem)] min-w-[calc(100vw-2.25rem)] rounded-[1.25rem] border bg-white p-2.5 shadow-[0_12px_34px_rgba(17,24,39,0.05)] sm:w-auto sm:min-w-0 sm:p-3 ${selected ? 'border-gray-950 ring-2 ring-gray-950/10' : 'border-gray-100'}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Order number</p>
          <h2 className="mt-0.5 break-words text-[0.82rem] font-bold text-gray-950 sm:text-sm">{getOrderNumber(order)}</h2>
          <div className="mt-1.5 space-y-1 text-[0.65rem] font-semibold text-gray-500 sm:text-[0.68rem]">
            <StatusLine label="Order Status" value={order.status ?? 'pending'} />
            <StatusLine label="Payment status" value={order.payment_status ?? 'pending'} />
            {shipmentStatus ? (
              <StatusLine label="Shipment" value={formatShipmentStatus(shipmentStatus)} />
            ) : null}
            {returnDisplayStatus ? (
              <StatusLine label="Return" value={formatReturnDisplayStatus(returnDisplayStatus)} />
            ) : null}
          </div>
        </div>
        <p className="shrink-0 text-sm font-bold text-gray-950 sm:text-base">{formatMoney(order.total_amount)}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={onView} className="h-8 rounded-full bg-gray-950 px-3 text-[0.68rem] font-bold text-white transition hover:bg-gray-800 sm:h-9 sm:px-3.5 sm:text-xs">
          View details
        </button>
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
        {order?.shipment?.courier_tracking_url ? (
          <a
            href={order.shipment.courier_tracking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center justify-center rounded-full border border-gray-200 px-3 text-[0.68rem] font-bold text-gray-700 transition hover:border-gray-950 sm:h-9 sm:px-3.5 sm:text-xs"
          >
            Track Order
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="h-8 cursor-not-allowed rounded-full border border-gray-100 px-3 text-[0.68rem] font-bold text-gray-400 sm:h-9 sm:px-3.5 sm:text-xs"
          >
            Track Order
          </button>
        )}
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

  if (['pending', 'processing'].includes(status)) {
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

function OrderDetail({ order }) {
  const items = getOrderItems(order);
  const orderDate = formatDate(order.order_date ?? order.created_at ?? order.createdAt);
  const estimatedDelivery = formatDate(
    order.estimated_delivery_date ?? order.estimated_delivery ?? order.delivery_date ?? order.expected_delivery_date,
  );
  const deliveryDetails = getDeliveryDetails(order);
  const shipment = order?.shipment;
  const returnDisplayStatus = getReturnDisplayStatus(order);

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
              <StatusBadge label="Order Status" value={order.status ?? 'pending'} />
              <StatusBadge label="Payment status" value={order.payment_status ?? 'pending'} />
            </div>
          </div>

          <div className="flex flex-row gap-2 lg:shrink-0">
            {shipment?.courier_tracking_url ? (
              <a
                href={shipment.courier_tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-gray-950 px-3.5 text-xs font-bold text-white transition hover:bg-gray-800"
              >
                Track order
                <LocateFixed className="h-4 w-4" />
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex h-9 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-gray-200 px-3.5 text-xs font-bold text-gray-500"
              >
                Track order
                <LocateFixed className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-2.5 ring-1 ring-gray-100">
            <p className="text-[0.68rem] font-bold uppercase tracking-wide text-gray-400">Order date</p>
            <p className="mt-1 text-sm font-semibold text-gray-800">{orderDate}</p>
          </div>
          <div className="rounded-xl bg-white p-2.5 ring-1 ring-gray-100">
            <p className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-wide text-gray-400">
              <Plane className="h-4 w-4 text-gray-950" />
              Estimated delivery
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-800">{estimatedDelivery}</p>
          </div>
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

      {shipment?.shipment_status || shipment?.waybill || shipment?.provider || returnDisplayStatus ? (
        <div className="rounded-[1.1rem] border border-gray-200 p-3">
          <h3 className="text-base font-bold text-gray-950">Shipment</h3>
          <div className="mt-3 space-y-1.5 text-sm">
            {shipment?.shipment_status ? (
              <DeliveryField
                label="Status"
                value={formatShipmentStatus(shipment.shipment_status, shipment.raw_status)}
              />
            ) : null}
            {shipment?.waybill ? <DeliveryField label="Waybill" value={shipment.waybill} /> : null}
            {shipment?.provider ? (
              <DeliveryField label="Courier" value={shipment.provider} />
            ) : null}
            {returnDisplayStatus ? (
              <DeliveryField label="Return" value={formatReturnDisplayStatus(returnDisplayStatus)} />
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[1.1rem] border border-gray-200 p-3">
          <h3 className="text-base font-bold text-gray-950">Payment</h3>
          <div className="mt-3">
            <p className="text-sm font-semibold capitalize text-gray-700">
              Payment: {getPaymentLabel(order)}
            </p>
          </div>
          <dl className="mt-4 space-y-1.5 text-xs">
            <Amount label="Subtotal" value={order.subtotal} />
            <Amount label="Tax" value={order.tax_amount} />
            <Amount label="Shipping" value={order.shipping_amount} />
            <Amount label="Total" value={order.total_amount} strong />
          </dl>
        </div>

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
      </div>
    </div>
  );
}

function Amount({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className={strong ? 'font-bold text-gray-950' : 'font-semibold text-gray-500'}>{label}</dt>
      <dd className={strong ? 'font-bold text-gray-950' : 'font-semibold text-gray-900'}>
        {formatMoney(value)}
      </dd>
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
    <article className="grid min-w-0 gap-3 py-2.5 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center">
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

      <div className="text-left sm:text-right">
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

function formatDate(value) {
  if (!value) return 'Processing';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatMoney(value) {
  return value !== undefined && value !== null && value !== '' ? formatInr(Number(value)) : '-';
}
