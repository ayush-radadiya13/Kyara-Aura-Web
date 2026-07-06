'use client';

import { Bike, Clock, Home, Package, PackageCheck, Truck, XCircle } from 'lucide-react';

const STATUS_TO_STEP = {
  // Pending
  pending: 'pending',
  not_created: 'pending',
  created: 'pending',

  // Processing
  processing: 'processing',
  confirmed: 'processing',
  manifested: 'processing',
  pickup_scheduled: 'processing',
  pickup_pending: 'processing',
  not_picked: 'processing',
  scheduled: 'processing',
  booked: 'processing',

  // Picked Up
  picked_up: 'picked_up',
  pickup_complete: 'picked_up',

  // In Transit
  shipped: 'in_transit',
  in_transit: 'in_transit',
  bagged: 'in_transit',
  dispatched: 'in_transit',
  received_at_hub: 'in_transit',
  shipment_received_at_facility: 'in_transit',
  reached_destination_hub: 'in_transit',
  arrived_at_destination_hub: 'in_transit',

  // Out for Delivery
  out_for_delivery: 'out_for_delivery',

  // Delivered
  delivered: 'delivered',

  // Cancelled
  cancelled: 'cancelled',
  shipment_cancelled: 'cancelled',
};

const TRACKING_STEPS = [
  { key: 'pending', label: 'Pending', Icon: Clock },
  { key: 'processing', label: 'Processing', Icon: Package },
  { key: 'picked_up', label: 'Picked Up', Icon: PackageCheck },
  { key: 'in_transit', label: 'In Transit', Icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', Icon: Bike },
  { key: 'delivered', label: 'Delivered', Icon: Home },
];

const RETURN_TRACKING_STEPS = [
  { key: 'return_requested', label: 'Return Requested', Icon: Clock },
  { key: 'picked_up', label: 'Package Picked Up', Icon: PackageCheck },
  { key: 'in_transit', label: 'Return In Transit', Icon: Truck },
  { key: 'out_for_delivery', label: 'Arriving at Warehouse', Icon: Bike },
  { key: 'delivered', label: 'Return Completed', Icon: Home },
];

const STEP_KEYS = TRACKING_STEPS.map((step) => step.key);
const RETURN_STEP_KEYS = RETURN_TRACKING_STEPS.map((step) => step.key);

function normalizeStatusValue(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '_');
}

function resolveReturnDisplayStatus(order) {
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

  return null;
}

function resolveReturnTrackingStatus(order) {
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

  return null;
}

function resolveTrackingStatus(order) {
  const shipment = order?.shipment ?? {};
  const rawStatus = shipment.raw_status ?? shipment.status_text ?? shipment.status ?? shipment.shipment_status;
  const orderStatus = order?.status;

  const mappedStep =
    STATUS_TO_STEP[normalizeStatusValue(rawStatus)] ?? STATUS_TO_STEP[normalizeStatusValue(orderStatus)];

  if (normalizeStatusValue(orderStatus) === 'cancelled' || mappedStep === 'cancelled') {
    return 'cancelled';
  }

  return mappedStep ?? 'pending';
}

function formatLastUpdated(value) {
  if (!value) return null;

  const normalized = typeof value === 'string' ? value.trim().replace(' ', 'T') : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatEstimatedDeliveryDate(value) {
  if (!value) return null;

  const normalized = typeof value === 'string' ? value.trim().replace(' ', 'T') : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatReturnStatusLabel(order, returnDisplayStatus) {
  const labels = {
    return_requested: 'Return Requested',
    picked_up: 'Package Picked Up',
    in_transit: 'Return In Transit',
    out_for_delivery: 'Arriving at Warehouse',
    delivered: 'Return Completed',
  };

  if (returnDisplayStatus && labels[returnDisplayStatus]) {
    return labels[returnDisplayStatus];
  }

  return String(order?.status ?? '')
    .trim()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase()) || '—';
}

export default function OrderTracking({ order, embedded = false }) {
  const status = resolveTrackingStatus(order);
  const returnDisplayStatus = resolveReturnDisplayStatus(order);
  const returnTrackingStatus = resolveReturnTrackingStatus(order);
  const isReturnTracking = returnDisplayStatus !== null;
  const cancelled = status === 'cancelled';

  const shipment = order?.shipment ?? {};

  const estimatedDelivery = !isReturnTracking
    ? formatEstimatedDeliveryDate(shipment.estimated_delivery_at)
    : null;
  const returnData = shipment.return;
  const estimatedReturn = isReturnTracking && returnData != null
    ? formatEstimatedDeliveryDate(returnData.estimated_return_at)
    : null;
  const returnStatus = isReturnTracking && returnData == null
    ? formatReturnStatusLabel(order, returnDisplayStatus)
    : null;
  const timelineStatus = isReturnTracking ? returnTrackingStatus : status;
  const lastUpdated = formatLastUpdated(
    shipment.updated_at ?? shipment.last_update ?? shipment.last_scan_at ?? order?.updated_at,
  );

  const Wrapper = embedded ? 'div' : 'section';
  const wrapperClassName = embedded
    ? 'bg-white'
    : 'rounded-2xl border border-[#E5E7EB] bg-white p-6';

  return (
    <Wrapper className={wrapperClassName}>
      <header className={embedded ? 'pr-10' : ''}>
        <h2 className="text-lg font-semibold tracking-tight text-gray-950">
          {isReturnTracking ? 'Return Tracking' : 'Track Order'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isReturnTracking ? 'Follow your return request status.' : 'Follow your shipment status.'}
        </p>
      </header>

      {cancelled ? (
        <CancelledState />
      ) : (
        <>
          <TrackingTimeline status={timelineStatus} isReturnTracking={isReturnTracking} />

          <ShipmentInfo
            courier={shipment.provider ?? shipment.courier ?? '—'}
            trackingNumber={shipment.waybill ?? shipment.tracking_number ?? '—'}
            estimatedDelivery={estimatedDelivery}
            estimatedReturn={estimatedReturn}
            returnStatus={returnStatus}
            lastUpdated={lastUpdated ?? '—'}
          />
        </>
      )}
    </Wrapper>
  );
}

function TrackingTimeline({ status, isReturnTracking = false }) {
  const steps = isReturnTracking ? RETURN_TRACKING_STEPS : TRACKING_STEPS;
  const stepKeys = isReturnTracking ? RETURN_STEP_KEYS : STEP_KEYS;
  const isDelivered = status === 'delivered' || status === 'returned';
  const currentIndex = Math.max(0, stepKeys.indexOf(status));
  const lastIndex = steps.length - 1;

  return (
    <ol className="mt-6">
      {steps.map((step, index) => {
        const completed = isDelivered || index < currentIndex;
        const current = !isDelivered && index === currentIndex;
        const connectorActive = index < currentIndex || (isDelivered && index < lastIndex);
        const isLast = index === lastIndex;

        return (
          <li key={step.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <StepCircle Icon={step.Icon} completed={completed} current={current} />
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className={`w-0.5 flex-1 ${connectorActive ? 'bg-emerald-500' : 'bg-gray-200'}`}
                />
              ) : null}
            </div>

            <div className={isLast ? '' : 'pb-8'}>
              <div className="flex min-h-9 items-center">
                <p
                  className={`text-sm leading-6 ${
                    current
                      ? 'font-bold text-gray-950'
                      : completed
                        ? 'font-medium text-gray-700'
                        : 'font-medium text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function StepCircle({ Icon, completed, current }) {
  if (completed) {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
        <Icon className="h-[1.05rem] w-[1.05rem]" strokeWidth={2.4} />
      </span>
    );
  }

  if (current) {
    return (
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c9a75d]/40" />
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#c9a75d] text-white shadow-sm">
          <Icon className="h-[1.05rem] w-[1.05rem]" strokeWidth={2.4} />
        </span>
      </span>
    );
  }

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-gray-400">
      <Icon className="h-[1.05rem] w-[1.05rem]" strokeWidth={2} />
    </span>
  );
}

function ShipmentInfo({ courier, trackingNumber, estimatedDelivery, estimatedReturn, returnStatus, lastUpdated }) {
  return (
    <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-gray-100 pt-6 sm:grid-cols-2">
      <InfoRow label="Courier Partner" value={courier} />
      <InfoRow label="Tracking Number" value={trackingNumber} />
      {estimatedDelivery ? <InfoRow label="Estimated Delivery" value={estimatedDelivery} /> : null}
      {estimatedReturn ? <InfoRow label="Estimated Return Date" value={estimatedReturn} /> : null}
      {returnStatus ? <InfoRow label="Return Status" value={returnStatus} /> : null}
      <InfoRow label="Last Updated" value={lastUpdated} />
    </dl>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="break-words text-sm font-semibold text-gray-900">{value}</dd>
    </div>
  );
}

function CancelledState() {
  return (
    <div className="mt-6 flex flex-col items-center justify-center gap-3 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <XCircle className="h-8 w-8" />
      </span>
      <p className="text-base font-semibold text-red-600">This order has been cancelled.</p>
    </div>
  );
}
