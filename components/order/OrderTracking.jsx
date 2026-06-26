'use client';

import { Bike, Clock, Home, Package, PackageCheck, Truck, XCircle } from 'lucide-react';

const DELHIVERY_STATUS_MAP = {
  // Processing
  Manifested: 'processing',
  Pending: 'processing',
  'Pickup Pending': 'processing',
  'Not Picked': 'processing',
  Scheduled: 'processing',
  Booked: 'processing',

  // Picked Up
  'Picked Up': 'picked_up',
  'Pickup Complete': 'picked_up',

  // In Transit
  'In Transit': 'in_transit',
  Bagged: 'in_transit',
  Dispatched: 'in_transit',
  'Received at Hub': 'in_transit',
  'Shipment Received at Facility': 'in_transit',
  'Reached Destination Hub': 'in_transit',
  'Arrived at Destination Hub': 'in_transit',

  // Out for Delivery
  'Out for Delivery': 'out_for_delivery',

  // Delivered
  Delivered: 'delivered',

  // Cancelled
  Cancelled: 'cancelled',
  'Shipment Cancelled': 'cancelled',
};

const TRACKING_STEPS = [
  { key: 'pending', label: 'Pending', Icon: Clock },
  { key: 'processing', label: 'Processing', Icon: Package },
  { key: 'picked_up', label: 'Picked Up', Icon: PackageCheck },
  { key: 'in_transit', label: 'In Transit', Icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', Icon: Bike },
  { key: 'delivered', label: 'Delivered', Icon: Home },
];

const STEP_KEYS = TRACKING_STEPS.map((step) => step.key);

function resolveTrackingStatus(order) {
  const orderStatus = String(order?.status ?? '').trim().toLowerCase();
  if (orderStatus === 'cancelled' || orderStatus === 'canceled') {
    return 'cancelled';
  }

  const shipment = order?.shipment ?? {};

  const rawStatus = shipment.raw_status ?? shipment.status_text ?? shipment.status;
  if (rawStatus && DELHIVERY_STATUS_MAP[String(rawStatus).trim()]) {
    return DELHIVERY_STATUS_MAP[String(rawStatus).trim()];
  }

  const normalized = String(shipment.shipment_status ?? '').trim().toLowerCase();
  if (normalized === 'cancelled' || normalized === 'canceled') return 'cancelled';
  if (STEP_KEYS.includes(normalized)) return normalized;

  return 'pending';
}

function formatStatusLabel(status) {
  return String(status ?? '')
    .trim()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
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

export default function OrderTracking({ order, embedded = false }) {
  const status = resolveTrackingStatus(order);
  const cancelled = status === 'cancelled';

  const shipment = order?.shipment ?? {};

  const currentStatusLabel =
    formatStatusLabel(shipment.raw_status ?? shipment.shipment_status ?? status) || 'Pending';
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
        <h2 className="text-lg font-semibold tracking-tight text-gray-950">Track Order</h2>
        <p className="mt-1 text-sm text-gray-500">Follow your shipment status.</p>
      </header>

      {cancelled ? (
        <CancelledState />
      ) : (
        <>
          <TrackingTimeline status={status} />

          <ShipmentInfo
            courier={shipment.provider ?? shipment.courier ?? '—'}
            trackingNumber={shipment.waybill ?? shipment.tracking_number ?? '—'}
            currentStatus={currentStatusLabel}
            lastUpdated={lastUpdated ?? '—'}
          />
        </>
      )}
    </Wrapper>
  );
}

function TrackingTimeline({ status }) {
  const isDelivered = status === 'delivered';
  const currentIndex = Math.max(0, STEP_KEYS.indexOf(status));
  const lastIndex = TRACKING_STEPS.length - 1;

  return (
    <ol className="mt-6">
      {TRACKING_STEPS.map((step, index) => {
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

function ShipmentInfo({ courier, trackingNumber, currentStatus, lastUpdated }) {
  return (
    <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-gray-100 pt-6 sm:grid-cols-2">
      <InfoRow label="Courier Partner" value={courier} />
      <InfoRow label="Tracking Number" value={trackingNumber} />
      <InfoRow label="Current Status" value={currentStatus} />
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
