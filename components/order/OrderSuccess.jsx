'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CircleCheck, PackageCheck, ShoppingBag, XCircle } from 'lucide-react';
import { LoaderBlock } from '@/components/ui/loader';
import { APP_ROUTES } from '@/lib/routes';
import { getOrderDetailApi } from '@/services/checkout';
import { getApiErrorMessage } from '@/utils/api-error';
import { formatInr } from '@/lib/cart/format';

const FAILED_PAYMENT_STATUSES = new Set(['failed', 'failure', 'cancelled', 'canceled', 'declined']);

function getPaymentStatus(order) {
  return String(order?.payment_status ?? '').trim().toLowerCase();
}

function isPaymentFailed(order) {
  return FAILED_PAYMENT_STATUSES.has(getPaymentStatus(order));
}

export default function OrderSuccess({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    async function loadOrder() {
      setLoading(true);
      setError('');

      try {
        const orderDetail = await getOrderDetailApi(orderId);
        if (isCurrent) setOrder(orderDetail);
      } catch (orderError) {
        if (isCurrent) {
          setError(getApiErrorMessage(orderError, 'Unable to load order details.'));
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    if (orderId) {
      loadOrder();
    }

    return () => {
      isCurrent = false;
    };
  }, [orderId]);

  const paymentFailed = isPaymentFailed(order);
  const orderNumber = order?.order_number ?? `#${orderId}`;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6 pt-4 sm:px-6 lg:pb-10">
      <div className="mx-auto max-w-5xl bg-white p-2 text-center sm:p-4">
        {loading ? (
          <LoaderBlock className="py-12" />
        ) : error ? (
          <OrderError message={error} />
        ) : paymentFailed ? (
          <PaymentFailed order={order} orderNumber={orderNumber} />
        ) : (
          <PaymentConfirmed order={order} orderNumber={orderNumber} />
        )}

        <div className="mt-8 flex flex-row justify-center gap-3">
          <Link
            href={APP_ROUTES.PRODUCTS}
            className="inline-flex h-12 flex-1 items-center justify-center bg-gray-950 px-3 text-center text-xs font-semibold uppercase text-white transition hover:bg-gray-800 sm:flex-none sm:px-7 sm:text-sm"
          >
            Continue Shopping
          </Link>
          <Link
            href={APP_ROUTES.HOME}
            className="inline-flex h-12 flex-1 items-center justify-center border border-gray-950 bg-white px-3 text-center text-xs font-semibold uppercase text-gray-950 transition hover:bg-gray-50 sm:flex-none sm:px-7 sm:text-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}

function OrderError({ message }) {
  return (
    <div className="mx-auto max-w-4xl border border-gray-100 bg-[#f8f8f7] px-5 py-3">
      <MessageHeading tone="failed" icon={XCircle} label="Order details unavailable" />
      <h1 className="mt-3 text-xl font-bold text-gray-950 sm:text-3xl">Unable to load this order</h1>
      <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-6 text-red-700">{message}</p>
    </div>
  );
}

function PaymentFailed({ order, orderNumber }) {
  return (
    <div className="space-y-6">
      <StatusMessage
        tone="failed"
        eyebrow="Payment failed"
        title="We could not confirm your payment"
        message="Your payment was not completed, so product details are hidden for this order. If any amount was deducted, please contact support with your order number."
      />

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        <InfoCard title="Order status details" icon={<PackageCheck className="h-5 w-5" />}>
          <dl className="space-y-3 text-sm">
            <SummaryItem label="Order number" value={orderNumber} valueClassName="normal-case" />
            <SummaryItem label="Order status" value={order?.status ?? 'pending'} badge />
            <SummaryItem label="Payment status" value={order?.payment_status ?? 'failed'} badge />
            <SummaryItem label="Payment method" value={order?.payment_method ?? '-'} uppercase />
          </dl>
        </InfoCard>
        <InfoCard title="Order payment amount details" icon={<XCircle className="h-5 w-5" />}>
          <dl className="space-y-3 text-sm">
            <SummaryItem
              label="Total"
              value={order?.total_amount ? formatInr(Number(order.total_amount)) : '-'}
              valueClassName="normal-case"
            />
          </dl>
        </InfoCard>
      </div>
    </div>
  );
}

function PaymentConfirmed({ order, orderNumber }) {
  return (
    <div className="space-y-6">
      <StatusMessage
        tone="success"
        eyebrow="Order confirmed"
        title="Thank you for your order"
        message="We have received your order. Your product details are listed below after backend verification."
      />

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        <InfoCard title="Order status details" icon={<PackageCheck className="h-5 w-5" />}>
          <dl className="space-y-3 text-sm">
            <SummaryItem label="Order number" value={orderNumber} valueClassName="normal-case" />
            <SummaryItem label="Order status" value={order?.status ?? 'pending'} badge />
            <SummaryItem label="Payment status" value={order?.payment_status ?? 'pending'} badge />
            <SummaryItem label="Payment method" value={order?.payment_method ?? '-'} uppercase />
          </dl>
        </InfoCard>
        <InfoCard title="Order payment amount details" icon={<ShoppingBag className="h-5 w-5" />}>
          <OrderAmounts order={order} />
        </InfoCard>
      </div>

      <OrderItems order={order} />
    </div>
  );
}

function StatusMessage({ tone, eyebrow, title, message }) {
  const isFailed = tone === 'failed';
  const Icon = isFailed ? XCircle : CircleCheck;

  return (
    <div className="mx-auto max-w-4xl border border-gray-100 bg-[#f8f8f7] px-5 py-3">
      <MessageHeading tone={tone} icon={Icon} label={eyebrow} />
      <h1 className=" text-xl font-semibold leading-tight text-gray-800 sm:text-3xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-500">{message}</p>
    </div>
  );
}

function MessageHeading({ tone, icon: Icon, label }) {
  const isFailed = tone === 'failed';
  const iconClassName = isFailed ? ' text-red-700' : ' text-green-700';
  const labelClassName = isFailed ? 'text-red-600' : 'text-[#6aab8e]';

  return (
    <div className="flex items-center justify-center gap-4">
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
        <Icon className="h-8 w-8" />
      </div>
      <p className={`text-left text-xs font-bold uppercase tracking-[0.3em] ${labelClassName}`}>{label}</p>
    </div>
  );
}

function InfoCard({ title, icon, children }) {
  return (
    <div className="border border-gray-400 bg-white p-5 text-left">
      <div className="mb-5 flex items-center gap-3  border-gray-100 ">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-950 text-white">
          {icon}
        </div>
        <h2 className="text-base font-semibold uppercase tracking-wide text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function getStatusBadgeClass(value) {
  const status = String(value ?? '').trim().toLowerCase();

  if (['paid', 'completed', 'confirmed', 'delivered', 'success'].includes(status)) {
    return 'bg-green-50 text-green-700 ring-green-100';
  }

  if (['pending', 'processing'].includes(status)) {
    return 'bg-amber-50 text-amber-700 ring-amber-100';
  }

  if (['failed', 'failure', 'cancelled', 'canceled', 'declined'].includes(status)) {
    return 'bg-red-50 text-red-700 ring-red-100';
  }

  return 'bg-gray-100 text-gray-700 ring-gray-200';
}

function SummaryItem({ label, value, uppercase = false, valueClassName = '', badge = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="font-semibold text-gray-500">{label}</dt>
      <dd
        className={`text-right font-bold ${
          badge
            ? `rounded-full px-3 py-1 text-xs ring-1 ${getStatusBadgeClass(value)}`
            : 'text-gray-950'
        } ${uppercase ? 'uppercase' : 'capitalize'} ${valueClassName}`}
      >
        {value}
      </dd>
    </div>
  );
}

function OrderAmounts({ order }) {
  return (
    <dl className="mt-4 space-y-2  border-gray-100  text-sm">
      <AmountRow label="Subtotal" value={order?.subtotal} />
      <AmountRow label="Tax" value={order?.tax_amount} />
      <AmountRow label="Shipping" value={order?.shipping_amount} />
      <AmountRow label="Total amount" value={order?.total_amount} strong />
    </dl>
  );
}

function AmountRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className={strong ? 'font-bold text-gray-950' : 'font-semibold text-gray-500'}>{label}</dt>
      <dd className={strong ? 'font-bold text-gray-950' : 'font-semibold text-gray-900'}>
        {value !== undefined && value !== null ? formatInr(Number(value)) : '-'}
      </dd>
    </div>
  );
}

function getItemImageSrc(item) {
  const images = Array.isArray(item?.product?.images) ? item.product.images : [];
  const primaryImage = images.find((image) => image?.is_primary) ?? images[0];

  return (
    item?.product_image_url ??
    item?.image_url ??
    item?.image_path ??
    primaryImage?.image_url ??
    primaryImage?.image_path ??
    primaryImage?.url ??
    ''
  );
}

function OrderItems({ order }) {
  const items = Array.isArray(order?.order_items) ? order.order_items : [];

  if (!items.length) return null;

  return (
    <div className="mx-auto max-w-4xl border border-gray-400  p-5 text-left">
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">Order products details</p>
          <h2 className="mt-1 text-lg font-semibold text-gray-800">Your selected pieces</h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-950 text-white">
          <ShoppingBag className="h-5 w-5" />
        </div>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((item, index) => {
          const productName = item.product_name ?? item.product?.name ?? 'Product';
          const sizeText = item.size_text ?? item.product_size?.size_text ?? item.size ?? '';
          const total = item.total ?? item.subtotal ?? item.total_amount;
          const productImageSrc = getItemImageSrc(item);

          return (
            <li
              key={`${item.id ?? productName}-${index}`}
              className="grid gap-3  bg-white  text-sm sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div className="flex gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-[#f8f8f7]">
                  {productImageSrc ? (
                    <Image
                      src={productImageSrc}
                      alt={productName}
                      fill
                      unoptimized={productImageSrc.startsWith('http')}
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-500">
                    Name: <span className="font-bold text-gray-950">{productName}</span>
                  </p>
                  <p className="mt-1 font-semibold text-gray-500">
                    Qty: <span className="font-bold text-gray-950">{item.quantity ?? 1}</span>
                  </p>
                  <p className="mt-1 font-semibold text-gray-500">
                    Size: <span className="font-bold text-gray-950">{sizeText || '-'}</span>
                  </p>
                </div>
              </div>
              <p className="w-fit   bg-white px-4 py-2 font-bold text-gray-950">
                {total !== undefined && total !== null ? formatInr(Number(total)) : '-'}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
