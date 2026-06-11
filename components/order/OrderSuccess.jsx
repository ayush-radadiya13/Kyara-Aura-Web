'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CircleCheck, PackageCheck } from 'lucide-react';
import { APP_ROUTES } from '@/lib/routes';
import { getOrderDetailApi } from '@/services/checkout';
import { getApiErrorMessage } from '@/utils/api-error';
import { formatInr } from '@/lib/cart/format';

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

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-[2rem] border border-gray-100 bg-white p-8 text-center shadow-[0_24px_70px_rgba(17,24,39,0.08)] sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-700">
          <CircleCheck className="h-9 w-9" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-[#6aab8e]">
          Order confirmed
        </p>
        <h1 className="mt-3 text-3xl font-bold text-gray-950 sm:text-5xl">
          Thank you for your order
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-600">
          We have received your order. Online payments are shown here only after backend verification is complete.
        </p>

        <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-gray-100 bg-[#fbfaf7] p-5 text-left">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-5 animate-pulse rounded-full bg-gray-100" />
              ))}
            </div>
          ) : error ? (
            <p className="text-sm font-semibold text-red-700">{error}</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <PackageCheck className="h-5 w-5 text-[#4f3128]" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Order number</p>
                  <p className="font-bold text-gray-950">{order?.order_number ?? `#${orderId}`}</p>
                </div>
              </div>
              <dl className="grid gap-3 border-t border-gray-200 pt-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-gray-500">Order status</dt>
                  <dd className="mt-1 font-bold capitalize text-gray-950">{order?.status ?? 'pending'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-500">Payment status</dt>
                  <dd className="mt-1 font-bold capitalize text-gray-950">{order?.payment_status ?? 'pending'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-500">Payment method</dt>
                  <dd className="mt-1 font-bold uppercase text-gray-950">{order?.payment_method ?? '-'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-500">Total</dt>
                  <dd className="mt-1 font-bold text-gray-950">
                    {order?.total_amount ? formatInr(Number(order.total_amount)) : '-'}
                  </dd>
                </div>
              </dl>
              <OrderAmounts order={order} />
              <OrderItems order={order} />
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={APP_ROUTES.PRODUCTS}
            className="inline-flex h-12 items-center justify-center border border-gray-950 px-6 text-sm font-bold text-gray-950 transition hover:bg-gray-950 hover:text-white"
          >
            Continue Shopping
          </Link>
          <Link
            href={APP_ROUTES.HOME}
            className="inline-flex h-12 items-center justify-center bg-[#4f3128] px-6 text-sm font-bold text-white transition hover:bg-[#3d261f]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}

function OrderAmounts({ order }) {
  return (
    <dl className="space-y-2 border-t border-gray-200 pt-4 text-sm">
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

function OrderItems({ order }) {
  const items = Array.isArray(order?.order_items) ? order.order_items : [];

  if (!items.length) return null;

  return (
    <div className="border-t border-gray-200 pt-4">
      <h2 className="text-sm font-bold text-gray-950">Items</h2>
      <ul className="mt-3 space-y-3">
        {items.map((item, index) => {
          const productName = item.product_name ?? item.product?.name ?? 'Product';
          const sizeText = item.size_text ?? item.product_size?.size_text ?? item.size ?? '';
          const total = item.total ?? item.subtotal ?? item.total_amount;

          return (
            <li key={`${item.id ?? productName}-${index}`} className="flex items-start justify-between gap-4 rounded-2xl bg-white p-3 text-sm">
              <div>
                <p className="font-bold text-gray-950">{productName}</p>
                <p className="mt-1 text-gray-500">
                  Qty: {item.quantity ?? 1}
                  {sizeText ? ` / Size: ${sizeText}` : ''}
                </p>
              </div>
              <p className="font-bold text-gray-950">{total !== undefined && total !== null ? formatInr(Number(total)) : '-'}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
