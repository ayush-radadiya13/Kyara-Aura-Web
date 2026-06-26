'use client';

import { useState } from 'react';
import { ChevronDown, ReceiptText } from 'lucide-react';
import { formatInr, formatInrDiscount } from '@/lib/cart/format';
import { LoaderBlock, LoadingLabel } from '@/components/ui/loader';

function SummaryRow({ label, value, valueClassName = 'font-semibold text-gray-950' }) {
  return (
    <div className="flex items-start justify-between gap-3 py-0.5">
      <dt className="text-sm font-medium text-gray-600">{label}</dt>
      <dd className={`shrink-0 text-sm tabular-nums ${valueClassName}`}>{value}</dd>
    </div>
  );
}

function SummaryDivider() {
  return <div className="my-1 border-t border-dashed border-gray-200" aria-hidden="true" />;
}

/**
 * @param {{
 *   summary: {
 *     itemsSubtotal: number,
 *     subtotal: number,
 *     taxAmount: number,
 *     shippingAmount: number,
 *     buyTwoGetOneDiscountAmount: number,
 *     firstOrderDiscountAmount: number,
 *     onlinePaymentDiscountAmount: number,
 *     discountAmount: number,
 *     discountPercent: number,
 *     codCharge: number,
 *     total: number,
 *     itemCount: number,
 *   },
 *   loading?: boolean,
 *   emptyMessage?: string,
 *   title?: string,
 *   compact?: boolean,
 *   showOnlinePaymentDiscount?: boolean,
 *   showCodCharge?: boolean,
 *   className?: string,
 * }} props
 */
export default function OrderSummary({
  summary,
  loading = false,
  emptyMessage,
  title = 'Order Summary',
  compact = false,
  showOnlinePaymentDiscount = false,
  showCodCharge = false,
  className = '',
}) {
  const hasSummary = Boolean(summary);
  const [open, setOpen] = useState(true);

  // The breakdown can be collapsed only once a summary exists; loading and
  // empty/guidance states stay visible so the user always sees what to do next.
  const showBody = open || !hasSummary;

  return (
    <section
      className={`rounded-[1.15rem] border border-gray-200 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.06)] ${
        compact ? 'p-4' : 'p-4 sm:p-5'
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={showBody}
        className="flex w-full shrink-0 items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-950">
            <ReceiptText className="h-4 w-4" />
          </span>
          <h2 className={`font-extrabold text-gray-950 ${compact ? 'text-sm' : 'text-base sm:text-lg'}`}>
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <LoadingLabel className="text-xs font-bold text-gray-500">Updating...</LoadingLabel>
          ) : null}
          {hasSummary ? (
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${showBody ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          ) : null}
        </div>
      </button>

      {!showBody ? null : loading && !hasSummary ? (
        <LoaderBlock className="mt-4 rounded-2xl border border-gray-100 py-8" />
      ) : !hasSummary && emptyMessage ? (
        <p className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 p-4 text-sm font-medium leading-6 text-gray-600">
          {emptyMessage}
        </p>
      ) : hasSummary ? (
        <dl className="mt-4 space-y-1">
            <div className="rounded-xl bg-gray-50/80 px-3.5 py-3 sm:px-4">
              <SummaryRow label="Items Total" value={formatInr(summary.itemsSubtotal)} />
              <SummaryRow label="Subtotal" value={formatInr(summary.subtotal)} />
              <SummaryRow label="Tax (GST)" value={formatInr(summary.taxAmount)} />
              <SummaryRow label="Shipping Charges" value={formatInr(summary.shippingAmount)} />

              {summary.buyTwoGetOneDiscountAmount > 0 ? (
                <SummaryRow
                  label="Buy 2 Get 1 Discount"
                  value={formatInrDiscount(summary.buyTwoGetOneDiscountAmount)}
                  valueClassName="font-semibold text-emerald-700"
                />
              ) : null}

              {summary.firstOrderDiscountAmount > 0 ? (
                <SummaryRow
                  label="First Order Discount"
                  value={formatInrDiscount(summary.firstOrderDiscountAmount)}
                  valueClassName="font-semibold text-emerald-700"
                />
              ) : null}

              {showOnlinePaymentDiscount ? (
                <SummaryRow
                  label="Online Payment Discount"
                  value={formatInrDiscount(summary.onlinePaymentDiscountAmount)}
                  valueClassName="font-semibold text-emerald-700"
                />
              ) : null}

              {summary.discountAmount > 0 ? (
                <SummaryRow
                  label={`Scratch Discount${summary.discountPercent > 0 ? ` (${summary.discountPercent}%)` : ''}`}
                  value={formatInrDiscount(summary.discountAmount)}
                  valueClassName="font-semibold text-emerald-700"
                />
              ) : null}
            </div>

            <SummaryDivider />

            <SummaryRow
              label="Total Items"
              value={String(summary.itemCount)}
              valueClassName="font-bold text-gray-950"
            />

            <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-gray-950 bg-white px-3.5 py-3 sm:px-4">
              <dt className="text-base font-extrabold text-gray-950">Grand Total</dt>
              <dd className="text-lg font-extrabold tabular-nums text-gray-950 sm:text-xl">
                {formatInr(summary.total)}
              </dd>
            </div>
        </dl>
      ) : null}
    </section>
  );
}
