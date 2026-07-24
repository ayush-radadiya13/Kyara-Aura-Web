'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CircleCheck, PackageCheck, XCircle } from 'lucide-react';
import { LoaderBlock } from '@/components/ui/loader';
import { APP_ROUTES } from '@/lib/routes';
import { getOrderDetailApi } from '@/services/checkout';
import { submitCustomerReviewApi } from '@/services/customer-reviews';
import { clearStoredScratchCoupon } from '@/services/scratch-card';
import { useAuthStore } from '@/store/auth-store';
import { getApiErrorMessage } from '@/utils/api-error';
import { getAuthStorageKey } from '@/utils/auth-response';
import { formatInrPayment } from '@/lib/cart/format';

const FAILED_PAYMENT_STATUSES = new Set(['failed', 'failure', 'cancelled', 'canceled', 'declined']);
const PAID_PAYMENT_STATUSES = new Set(['paid', 'captured', 'completed', 'success', 'successful', 'confirmed']);
const CONFIRMED_ORDER_STATUSES = new Set(['confirmed', 'processing', 'shipped', 'delivered', 'completed']);

function getPaymentStatus(order) {
  return String(order?.payment_status ?? '').trim().toLowerCase();
}

function isPaymentFailed(order) {
  return FAILED_PAYMENT_STATUSES.has(getPaymentStatus(order));
}

function isOrderConfirmed(order) {
  if (!order) return false;
  if (PAID_PAYMENT_STATUSES.has(getPaymentStatus(order))) return true;

  const orderStatus = String(order?.status ?? '').trim().toLowerCase();
  return CONFIRMED_ORDER_STATUSES.has(orderStatus);
}

function getOrderProductIds(order) {
  const items = Array.isArray(order?.order_items) ? order.order_items : [];
  const productIds = new Set();

  for (const item of items) {
    const productId = item.product_id ?? item.product?.id;
    if (productId) {
      productIds.add(Number(productId));
    }
  }

  return [...productIds];
}

export default function OrderSuccess({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  // Every successful order (COD, online callback, and pending-payment recovery) lands here.
  // Clearing the consumed scratch coupon at this single chokepoint guarantees it can never
  // leak into the next checkout, even when the online callback's own clear never ran (e.g.
  // the order was confirmed by a Razorpay webhook instead of the redirect callback). A failed
  // payment intentionally keeps the coupon so the user can still use it when they retry.
  useEffect(() => {
    if (!isOrderConfirmed(order)) return;
    clearStoredScratchCoupon(getAuthStorageKey(user, token));
  }, [order, user, token]);

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
          <>
            <OrderError message={error} />
            <FallbackActions />
          </>
        ) : paymentFailed ? (
          <>
            <PaymentFailed order={order} orderNumber={orderNumber} />
            <FallbackActions />
          </>
        ) : (
          <PaymentConfirmed order={order} />
        )}
      </div>
    </section>
  );
}

function FallbackActions() {
  return (
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
  );
}

function OrderError({ message }) {
  return (
    <div className="mx-auto max-w-4xl border border-gray-100  px-5 py-3">
      <MessageHeading tone="failed" icon={XCircle} label="Order details unavailable" />
      <h1 className="mt-3 text-xl font-bold text-gray-950 sm:text-3xl">Unable to load this order</h1>
    </div>
  );
}

function PaymentFailed({ order, orderNumber }) {
  return (
    <div className="space-y-4">
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
              value={order?.total_amount ? formatInrPayment(Number(order.total_amount)) : '-'}
              valueClassName="normal-case"
            />
          </dl>
        </InfoCard>
      </div>
    </div>
  );
}

function PaymentConfirmed({ order }) {
  return (
    <div className="space-y-4">
      <StatusMessage
        tone="success"
        eyebrow="Order confirmed"
        title="Thank you for your order"
        message="We have received your order and are preparing it for you."
      />

      <ProductRatingSection order={order} />

      <div className="mx-auto flex max-w-4xl flex-row justify-center gap-3">
        <Link
          href={APP_ROUTES.ORDERS}
          className="inline-flex h-12 flex-1 items-center justify-center border border-gray-950 bg-white px-3 text-center text-xs font-semibold uppercase text-gray-950 transition hover:bg-gray-50 sm:flex-none sm:px-7 sm:text-sm"
        >
          Show Order Details
        </Link>
        <Link
          href={APP_ROUTES.PRODUCTS}
          className="inline-flex h-12 flex-1 items-center justify-center bg-gray-950 px-3 text-center text-xs font-semibold uppercase text-white transition hover:bg-gray-800 sm:flex-none sm:px-7 sm:text-sm"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

function ProductRatingSection({ order }) {
  const productIds = useMemo(() => getOrderProductIds(order), [order]);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const activeRating = hoveredRating || rating;

  const handleRate = async (starValue) => {
    if (submitting || submitted || !productIds.length) {
      return;
    }

    setError('');
    setRating(starValue);
    setSubmitting(true);

    try {
      await Promise.all(
        productIds.map((productId) =>
          submitCustomerReviewApi({
            product_id: productId,
            rating: starValue,
          })
        )
      );
      setSubmitted(true);
    } catch (submitError) {
      setRating(0);
      setError(getApiErrorMessage(submitError, 'Unable to submit your rating. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!productIds.length) {
    return null;
  }

  return (
    <div className="mx-auto max-w-md border rounded-2xl border-gray-400 bg-white p-6 text-center">
      <h2 className="mt-1 text-lg font-semibold text-gray-800">How was your purchase?</h2>
      <p className="mt-2 text-sm text-gray-500">Tap a star to rate your order.</p>

      <div
        className="mt-5 flex items-center justify-center gap-1"
        role="radiogroup"
        aria-label="Product rating"
        onMouseLeave={() => setHoveredRating(0)}
      >
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1;
          const isActive = starValue <= activeRating;

          return (
            <button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={rating === starValue}
              aria-label={`${starValue} star${starValue === 1 ? '' : 's'}`}
              disabled={submitting || submitted}
              onMouseEnter={() => {
                if (!submitting && !submitted) {
                  setHoveredRating(starValue);
                }
              }}
              onClick={() => handleRate(starValue)}
              className={`text-4xl leading-none transition disabled:cursor-default ${
                isActive ? 'text-[#c9a75d]' : 'text-gray-300 hover:text-[#c9a75d]/70'
              } ${submitting || submitted ? 'disabled:opacity-80' : ''}`}
            >
              ★
            </button>
          );
        })}
      </div>

      {submitting ? (
        <p className="mt-3 text-sm text-gray-500">Saving your rating...</p>
      ) : null}

      {submitted ? (
        <p className="mt-3 text-sm text-green-700">Thank you for your rating!</p>
      ) : null}
    </div>
  );
}

function StatusMessage({ tone, eyebrow, title, message }) {
  const isFailed = tone === 'failed';
  const Icon = isFailed ? XCircle : CircleCheck;

  return (
    <div className="mx-auto max-w-4xl border border-gray-100  px-5 py-1">
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
      <p className={`text-left text-md font-bold uppercase tracking-[0.3em] ${labelClassName}`}>{label}</p>
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
