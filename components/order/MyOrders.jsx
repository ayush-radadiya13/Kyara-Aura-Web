'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  CreditCard,
  FileText,
  LocateFixed,
  MapPin,
  PackageCheck,
  Plane,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { APP_ROUTES, AUTH_PAGE_ROUTES, withRedirect } from '@/lib/routes';
import { cancelOrderApi, getOrderDetailApi, getOrdersApi, returnOrderApi } from '@/services/checkout';
import { useAuthStore } from '@/store/auth-store';
import { getApiErrorMessage } from '@/utils/api-error';
import { formatInr } from '@/lib/cart/format';

export default function MyOrders() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionOrderId, setActionOrderId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

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

  const handleCancelOrder = async (orderId) => {
    const reason = window.prompt('Reason for cancellation', 'Ordered by mistake');
    if (!reason?.trim()) return;

    setActionOrderId(orderId);
    setError('');
    setNotice('');

    try {
      await cancelOrderApi(orderId, { reason: reason.trim() });
      const orderList = await getOrdersApi();
      setOrders(Array.isArray(orderList) ? orderList : []);
      if (selectedOrder?.id === orderId) await loadOrderDetail(orderId);
      setNotice('Order cancellation request submitted.');
    } catch (cancelError) {
      setError(getApiErrorMessage(cancelError, 'Unable to cancel this order.'));
    } finally {
      setActionOrderId(null);
    }
  };

  const handleReturnOrder = async (orderId) => {
    const reason = window.prompt('Reason for return', 'Product issue');
    if (reason === null) return;

    setActionOrderId(orderId);
    setError('');
    setNotice('');

    try {
      const payload = reason.trim() ? { reason: reason.trim() } : {};
      await returnOrderApi(orderId, payload);
      const orderList = await getOrdersApi();
      setOrders(Array.isArray(orderList) ? orderList : []);
      if (selectedOrder?.id === orderId) await loadOrderDetail(orderId);
      setNotice('Order return request submitted.');
    } catch (returnError) {
      setError(getApiErrorMessage(returnError, 'Unable to return this order.'));
    } finally {
      setActionOrderId(null);
    }
  };

  if (!isHydrated || (isAuthenticated && loading)) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12">
        <OrdersSkeleton />
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-[0_20px_60px_rgba(17,24,39,0.08)]">
          <ShieldCheck className="mx-auto h-12 w-12 text-[#4f3128]" />
          <h1 className="mt-5 text-3xl font-bold text-gray-950">Sign in to view orders</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600">
            Order listing, details, and cancellation are protected.
          </p>
          <Link href={withRedirect(AUTH_PAGE_ROUTES.LOGIN, APP_ROUTES.ORDERS)} className="mt-7 inline-flex h-12 items-center justify-center bg-[#4f3128] px-7 text-sm font-bold text-white transition hover:bg-[#3d261f]">
            Login to Continue
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-400">My account</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-950 sm:text-4xl">Orders</h1>
      </div>

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
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-3 xl:sticky xl:top-24 xl:self-start">
            <div className="rounded-[1.75rem] border border-gray-100 bg-white p-4 shadow-[0_18px_50px_rgba(17,24,39,0.06)]">
              <h2 className="text-lg font-bold text-gray-950">Order history</h2>
              <p className="mt-1 text-sm text-gray-500">Select an order to preview details.</p>
            </div>
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                selected={selectedOrder?.id === order.id}
                loading={actionOrderId === order.id}
                onView={() => loadOrderDetail(order.id)}
                onCancel={() => handleCancelOrder(order.id)}
                onReturn={() => handleReturnOrder(order.id)}
              />
            ))}
          </aside>

          <div className="rounded-[2rem] border border-gray-100 bg-white p-4 shadow-[0_24px_70px_rgba(17,24,39,0.08)] sm:p-6">
            {detailLoading ? (
              <OrderDetailSkeleton />
            ) : selectedOrder ? (
              <OrderDetail order={selectedOrder} />
            ) : (
              <div className="flex min-h-[420px] items-center justify-center rounded-[1.5rem] border border-dashed border-gray-200 text-center">
                <div>
                  <PackageCheck className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-3 text-sm font-semibold text-gray-500">Select an order to view details.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function OrderCard({ order, selected, loading, onView, onCancel, onReturn }) {
  const status = String(order.status ?? '').toLowerCase();
  const canCancel = !['cancelled', 'delivered', 'returned'].includes(status);
  const canReturn = status === 'delivered';

  return (
    <article className={`rounded-[1.75rem] border bg-white p-4 shadow-[0_16px_45px_rgba(17,24,39,0.05)] ${selected ? 'border-blue-400 ring-2 ring-blue-50' : 'border-gray-100'}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Order number</p>
          <h2 className="mt-1 text-base font-bold text-gray-950">{getOrderNumber(order)}</h2>
          <p className="mt-2 text-xs font-semibold capitalize text-gray-500">
            {order.status ?? 'pending'} / {order.payment_status ?? 'pending'}
          </p>
        </div>
        <p className="text-lg font-bold text-gray-950">{formatMoney(order.total_amount)}</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={onView} className="h-10 rounded-full bg-blue-500 px-4 text-sm font-bold text-white transition hover:bg-blue-600">
          View details
        </button>
        <Link href={`/order-success/${order.id}`} className="inline-flex h-10 items-center rounded-full border border-gray-200 px-4 text-sm font-bold text-gray-700 transition hover:border-gray-950">
          Open page
        </Link>
        {canCancel ? (
          <button type="button" onClick={onCancel} disabled={loading} className="h-10 rounded-full border border-red-100 px-4 text-sm font-bold text-red-700 transition hover:border-red-300 disabled:opacity-50">
            {loading ? 'Cancelling...' : 'Cancel order'}
          </button>
        ) : null}
        {canReturn ? (
          <button type="button" onClick={onReturn} disabled={loading} className="h-10 rounded-full border border-amber-100 px-4 text-sm font-bold text-amber-700 transition hover:border-amber-300 disabled:opacity-50">
            {loading ? 'Returning...' : 'Return order'}
          </button>
        ) : null}
      </div>
    </article>
  );
}

function OrderDetail({ order }) {
  const items = getOrderItems(order);
  const orderDate = formatDate(order.order_date ?? order.created_at ?? order.createdAt);
  const estimatedDelivery = formatDate(
    order.estimated_delivery_date ?? order.estimated_delivery ?? order.delivery_date ?? order.expected_delivery_date,
  );
  const addressLines = getAddressLines(order);

  return (
    <div>
      <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-gray-400">
        <Link href={APP_ROUTES.HOME} className="transition hover:text-gray-800">Home</Link>
        <span>/</span>
        <Link href={APP_ROUTES.ORDERS} className="transition hover:text-gray-800">Orders</Link>
        <span>/</span>
        <span className="text-gray-500">{getOrderNumber(order)}</span>
      </nav>

      <div className="mt-5 flex flex-col gap-4 border-b border-gray-100 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Order ID: {getOrderNumber(order, false)}
          </h2>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm sm:text-base">
            <span className="text-gray-400">Order date: <span className="font-semibold text-gray-700">{orderDate}</span></span>
            <span className="hidden h-5 w-px bg-gray-200 sm:inline-block" />
            <span className="inline-flex items-center gap-2 font-bold text-green-500">
              <Plane className="h-4 w-4" />
              Estimated delivery: {estimatedDelivery}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <button type="button" className="inline-flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-bold text-gray-700 transition hover:border-gray-300 hover:bg-white">
            <FileText className="h-4 w-4" />
            Invoice
          </button>
          <button type="button" className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-500 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-600">
            Track order
            <LocateFixed className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {items.length ? (
          items.map((item, index) => (
            <OrderItemRow key={`${item.id ?? getItemName(item)}-${index}`} item={item} />
          ))
        ) : (
          <div className="py-10 text-center text-sm font-semibold text-gray-400">No items found for this order.</div>
        )}
      </div>

      <div className="grid gap-8 border-t border-gray-100 pt-6 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-bold text-gray-950">Payment</h3>
          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold capitalize text-gray-700">{getPaymentLabel(order)}</p>
              <p className="mt-1 text-sm capitalize text-gray-400">{order.payment_status ?? 'pending'}</p>
            </div>
          </div>
          <dl className="mt-6 space-y-2 text-sm">
            <Amount label="Subtotal" value={order.subtotal} />
            <Amount label="Tax" value={order.tax_amount} />
            <Amount label="Shipping" value={order.shipping_amount} />
            <Amount label="Total" value={order.total_amount} strong />
          </dl>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-950">Delivery</h3>
          <div className="mt-5 flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-400">Address</p>
              <div className="mt-2 space-y-1 text-lg font-medium leading-7 text-gray-700">
                {addressLines.length ? (
                  addressLines.map((line) => <p key={line}>{line}</p>)
                ) : (
                  <p>Delivery address not available</p>
                )}
              </div>
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

function OrderItemRow({ item }) {
  const productName = getItemName(item);
  const itemImageSrc = getItemImageSrc(item);
  const isRemoteImage = itemImageSrc.startsWith('http');
  const attributes = [item.color, item.variant, item.size_text ?? item.product_size?.size_text ?? item.size].filter(Boolean);

  return (
    <article className="grid gap-4 py-5 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-center">
      <div className="relative h-22 w-22 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 sm:h-20 sm:w-20">
        {itemImageSrc ? (
          <Image
            src={itemImageSrc}
            alt={productName}
            fill
            unoptimized={isRemoteImage}
            className="object-contain p-2"
            sizes="80px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center px-2 text-center text-xs font-semibold text-gray-300">
            No image
          </span>
        )}
      </div>

      <div>
        <h3 className="text-xl font-medium text-gray-700">{productName}</h3>
        <p className="mt-2 text-sm font-medium text-gray-400">
          {attributes.length ? attributes.join(' | ') : 'Product details'}
        </p>
      </div>

      <div className="text-left sm:text-right">
        <p className="text-xl font-bold text-gray-950">{formatMoney(getItemTotal(item))}</p>
        <p className="mt-2 text-sm font-semibold text-gray-400">Qty: {item.quantity ?? 1}</p>
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

function OrdersSkeleton({ compact = false }) {
  return (
    <div className="space-y-4">
      {[1, 2, 3].slice(0, compact ? 2 : 3).map((item) => (
        <div key={item} className="h-28 animate-pulse rounded-[2rem] bg-gray-100" />
      ))}
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-5 w-64 rounded-full bg-gray-100" />
      <div className="space-y-3 border-b border-gray-100 pb-6">
        <div className="h-10 w-2/3 rounded-full bg-gray-100" />
        <div className="h-5 w-1/2 rounded-full bg-gray-100" />
      </div>
      {[1, 2, 3].map((item) => (
        <div key={item} className="grid gap-4 sm:grid-cols-[88px_minmax(0,1fr)_140px] sm:items-center">
          <div className="h-20 w-20 rounded-xl bg-gray-100" />
          <div className="space-y-3">
            <div className="h-5 w-1/2 rounded-full bg-gray-100" />
            <div className="h-4 w-1/3 rounded-full bg-gray-100" />
          </div>
          <div className="h-5 w-28 rounded-full bg-gray-100" />
        </div>
      ))}
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

function getAddressLines(order) {
  const address = order.shipping_address ?? order.delivery_address ?? order.address ?? order.billing_address;
  if (!address) return [];
  if (typeof address === 'string') return [address];

  const street = [address.address_line_1, address.address_line_2, address.street, address.apartment]
    .filter(Boolean)
    .join(' ');
  const locality = [address.city, address.state].filter(Boolean).join(', ');
  const countryLine = [address.country, address.postal_code ?? address.pincode ?? address.zip].filter(Boolean).join(' ');
  const phone = address.phone ?? address.mobile ?? address.phone_number;

  return [street, locality, countryLine, phone].filter(Boolean);
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
