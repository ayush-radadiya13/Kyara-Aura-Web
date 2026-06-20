'use client';

import { useEffect, useState } from 'react';
import { ScratchCard } from 'next-scratchcard';
import { Gift, Sparkles, TicketPercent } from 'lucide-react';
import {
  SCRATCH_COUPON_STORAGE_KEY,
  getScratchCardStatusApi,
  scratchCardApi,
} from '@/services/scratch-card';
import { getApiErrorMessage } from '@/utils/api-error';

const SCRATCH_CARD_WIDTH = 252;
const SCRATCH_CARD_HEIGHT = 118;
const SCRATCH_SURFACE_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="252" height="118" viewBox="0 0 252 118"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0" x2="1" y1="0" y2="1"%3E%3Cstop offset="0" stop-color="%23f8fafc"/%3E%3Cstop offset="0.5" stop-color="%23cbd5e1"/%3E%3Cstop offset="1" stop-color="%2394a3b8"/%3E%3C/linearGradient%3E%3Cpattern id="p" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(25)"%3E%3Crect width="18" height="18" fill="transparent"/%3E%3Cpath d="M0 9h18" stroke="%23ffffff" stroke-opacity="0.35" stroke-width="5"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="252" height="118" rx="20" fill="url(%23g)"/%3E%3Crect width="252" height="118" rx="20" fill="url(%23p)"/%3E%3Ctext x="126" y="54" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="800" fill="%23111827" letter-spacing="2"%3ESCRATCH HERE%3C/text%3E%3Ctext x="126" y="77" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="%234b5563"%3EReveal your reward%3C/text%3E%3C/svg%3E';

function readStoredCoupon() {
  if (typeof window === 'undefined') return null;

  try {
    const storedValue = window.sessionStorage.getItem(SCRATCH_COUPON_STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : null;
  } catch {
    return null;
  }
}

function writeStoredCoupon(coupon) {
  if (typeof window === 'undefined') return;

  if (!coupon?.coupon_code) {
    window.sessionStorage.removeItem(SCRATCH_COUPON_STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(SCRATCH_COUPON_STORAGE_KEY, JSON.stringify(coupon));
}

export function getStoredScratchCoupon() {
  return readStoredCoupon();
}

export function clearStoredScratchCoupon() {
  writeStoredCoupon(null);
}

export default function ScratchCardOffer({ initialCoupon = null, onCouponChange, compact = false }) {
  const [status, setStatus] = useState(null);
  const [coupon, setCoupon] = useState(initialCoupon);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [scratching, setScratching] = useState(false);
  const [scratchCardKey, setScratchCardKey] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    async function loadStatus() {
      setLoadingStatus(true);
      setError('');

      try {
        const scratchStatus = await getScratchCardStatusApi();
        if (isCurrent) {
          setStatus(scratchStatus);
          if (!scratchStatus?.is_active) {
            setCoupon(null);
            writeStoredCoupon(null);
            onCouponChange?.(null);

          }
        }
      } catch {
        if (isCurrent) {
          setStatus({ is_active: false });
          setCoupon(null);
          writeStoredCoupon(null);
          onCouponChange?.(null);
        }
      } finally {
        if (isCurrent) setLoadingStatus(false);
      }
    }

    loadStatus();

    return () => {
      isCurrent = false;
    };
  }, [onCouponChange]);

  const updateCoupon = (nextCoupon) => {
    setCoupon(nextCoupon);
    writeStoredCoupon(nextCoupon);
    onCouponChange?.(nextCoupon);
  };

  const handleScratchComplete = async () => {
    if (scratching || coupon?.coupon_code) return;

    setScratching(true);
    setError('');

    try {
      const generatedCoupon = await scratchCardApi();
      updateCoupon(generatedCoupon);
    } catch (scratchError) {
      setError(getApiErrorMessage(scratchError, 'Unable to generate scratch card coupon.'));
      setScratchCardKey((currentKey) => currentKey + 1);
    } finally {
      setScratching(false);
    }
  };

  if (loadingStatus) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />
      </section>
    );
  }

  if (!status?.is_active) return null;

  const hasCoupon = Boolean(coupon?.coupon_code);
  const discountPercent = Number(coupon?.discount_percent ?? 0);
  const maxDiscountPercent = Number(status?.max_discount_percent ?? 0);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.07)]">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <span className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-950 text-white">
            <Gift className="h-4 w-4" />
          </span>
          <span>
            <h2 className="text-sm font-extrabold text-gray-950">Scratch Card</h2>
            <p className="text-[11px] font-semibold text-gray-500">
              Scratch the card and get up to {maxDiscountPercent}% discount!
            </p>
          </span>
        </span>
      </div>

      <div className="p-4">
        {hasCoupon ? (
          <div className="flex min-h-[118px] items-center justify-between gap-3 rounded-2xl border border-gray-950 bg-gray-950 p-4 text-white">
            <span>
              <span className="block text-xs font-bold uppercase tracking-[0.24em] text-gray-300">
                You won
              </span>
              <span className="mt-2 block text-5xl font-black tracking-tight text-white">
                {discountPercent}%
              </span>
            </span>

            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-950">
              <TicketPercent className="h-6 w-6" />
            </span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-950 shadow-inner [touch-action:none]">
              <ScratchCard
                key={scratchCardKey}
                width={SCRATCH_CARD_WIDTH}
                height={SCRATCH_CARD_HEIGHT}
                image={SCRATCH_SURFACE_IMAGE}
                finishPercent={45}
                brushSize={28}
                onComplete={handleScratchComplete}
              >
                <div className="flex h-[118px] w-[252px] items-center justify-between gap-3 bg-white p-4 text-white">
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-[0.24em] text-gray-300">
                      {scratching ? 'Revealing' : 'Scratch to reveal'}
                    </span>
                    <span className="mt-3 block text-sm font-bold text-gray-200">
                      {scratching ? 'Generating your reward...' : 'Your discount is hidden here'}
                    </span>
                  </span>

                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-950">
                    {scratching ? <TicketPercent className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
                  </span>
                </div>
              </ScratchCard>
            </div>
          </div>
        )}

        {error ? <p className="mt-2 text-xs font-semibold text-red-600">{error}</p> : null}
      </div>
    </section>
  );
}
