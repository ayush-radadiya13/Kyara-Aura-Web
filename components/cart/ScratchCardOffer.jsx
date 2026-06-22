'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ScratchCard } from 'next-scratchcard';
import { Gift, Percent, Sparkles, TicketPercent } from 'lucide-react';
import {
  SCRATCH_COUPON_STORAGE_KEY,
  getScratchCardStatusApi,
  scratchCardApi,
} from '@/services/scratch-card';
import { getApiErrorMessage } from '@/utils/api-error';
import { cn } from '@/lib/utils';

const MIN_CARD_SIZE = 140;
const MAX_CARD_SIZE = 188;
const CARD_MAX_WIDTH = 180;

function buildScratchSurfaceSvg(size) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="foil" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6"/>
      <stop offset="35%" stop-color="#a855f7"/>
      <stop offset="68%" stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="48%" stop-color="#ffffff" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="#ffffff" fill-opacity="0.16"/>
    </pattern>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.1)}" fill="url(#foil)"/>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.1)}" fill="url(#dots)"/>
  <rect x="${Math.round(size * 0.07)}" y="${Math.round(size * 0.07)}" width="${size - Math.round(size * 0.14)}" height="${size - Math.round(size * 0.14)}" rx="${Math.round(size * 0.08)}" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="2" stroke-dasharray="8 8"/>
  <rect x="-20" y="${size * 0.28}" width="${size + 40}" height="${size * 0.18}" fill="url(#shine)" transform="rotate(-18 ${size / 2} ${size / 2})"/>
  <text x="50%" y="46%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.max(12, Math.round(size * 0.052))}" font-weight="800" fill="#ffffff" letter-spacing="3">SCRATCH HERE</text>
  <text x="50%" y="58%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.max(10, Math.round(size * 0.038))}" font-weight="700" fill="#ffffff" fill-opacity="0.88">Reveal your reward</text>
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

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

function useSquareCardSize(enabled) {
  const containerRef = useRef(null);
  const [cardSize, setCardSize] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;

    const updateSize = () => {
      const width = containerRef.current?.offsetWidth ?? 0;
      if (!width) return;
      setCardSize(Math.floor(Math.min(Math.max(width, MIN_CARD_SIZE), MAX_CARD_SIZE)));
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    const element = containerRef.current;
    if (element) observer.observe(element);

    window.addEventListener('resize', updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [enabled]);

  return { containerRef, cardSize };
}

function CardBackdrop({ className = '' }) {
  return (
    <>
      <div className={cn('pointer-events-none absolute -right-5 -top-6 h-14 w-14 rounded-full bg-white/20 blur-2xl', className)} />
      <div className="pointer-events-none absolute -bottom-6 -left-4 h-12 w-12 rounded-full bg-amber-300/25 blur-2xl" />
      <div className="pointer-events-none absolute right-3 top-3 h-7 w-7 rounded-full border border-white/20 bg-white/10" />
      <div className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 rounded-full border border-white/15 bg-white/10" />
    </>
  );
}

function ScratchRewardFace({ size, scratching }) {
  return (
    <div
      className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-3 text-white"
      style={{ width: size, height: size }}
    >
      <CardBackdrop />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
            <Sparkles className="h-2.5 w-2.5" />
            Reward
          </span>
          <p className="mt-1.5 line-clamp-2 text-[11px] font-bold leading-4 text-white/90">
            {scratching ? 'Generating reward...' : 'Your discount is hidden here'}
          </p>
        </div>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/15 text-white shadow-lg shadow-violet-900/20 backdrop-blur-sm">
          {scratching ? <TicketPercent className="h-3.5 w-3.5" /> : <Gift className="h-3.5 w-3.5" />}
        </span>
      </div>

      <div className="relative z-10">
        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/70">
          {scratching ? 'Revealing' : 'Scratch to reveal'}
        </p>
        <p className="mt-0.5 text-lg font-black tracking-tight text-white">Up to ???%</p>
      </div>
    </div>
  );
}

function ScratchWonFace({ discountPercent, couponCode }) {
  return (
    <div className="relative flex h-full min-h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-rose-500 p-3 text-white">
      <CardBackdrop />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
            <Percent className="h-2.5 w-2.5" />
            You won
          </span>
          <p className="mt-1.5 text-3xl font-black tracking-tight text-white">{discountPercent}%</p>
          <p className="mt-0.5 text-[11px] font-semibold text-white/85">Flat discount unlocked</p>
        </div>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white text-violet-700 shadow-lg shadow-violet-900/20">
          <TicketPercent className="h-3.5 w-3.5" />
        </span>
      </div>

      {couponCode ? (
        <div className="relative z-10 rounded-lg border border-white/20 bg-white/12 px-2.5 py-1.5 backdrop-blur-sm">
          <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/70">Coupon code</p>
          <p className="mt-0.5 font-mono text-[11px] font-extrabold tracking-[0.12em] text-white">{couponCode}</p>
        </div>
      ) : null}
    </div>
  );
}

export default function ScratchCardOffer({ initialCoupon = null, onCouponChange, compact = false }) {
  const [status, setStatus] = useState(null);
  const [coupon, setCoupon] = useState(initialCoupon);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [scratching, setScratching] = useState(false);
  const [scratchCardKey, setScratchCardKey] = useState(0);
  const [error, setError] = useState('');

  const hasCoupon = Boolean(coupon?.coupon_code);
  const { containerRef, cardSize } = useSquareCardSize(!loadingStatus && status?.is_active && !hasCoupon);

  const scratchSurfaceImage = useMemo(
    () => (cardSize > 0 ? buildScratchSurfaceSvg(cardSize) : ''),
    [cardSize],
  );

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
      <section className="overflow-hidden rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-50 via-white to-amber-50 p-2.5 shadow-[0_10px_28px_rgba(91,33,182,0.08)] sm:p-3">
        <div
          className="mx-auto aspect-square w-full animate-pulse rounded-2xl bg-gradient-to-br from-violet-100 via-fuchsia-100 to-amber-100"
          style={{ maxWidth: CARD_MAX_WIDTH }}
        />
      </section>
    );
  }

  if (!status?.is_active) return null;

  const discountPercent = Number(coupon?.discount_percent ?? 0);
  const maxDiscountPercent = Number(status?.max_discount_percent ?? 0);

  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-50 via-white to-amber-50 shadow-[0_12px_32px_rgba(91,33,182,0.1)]',
        compact ? 'p-2 sm:p-2.5' : 'p-2.5 sm:p-3',
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-violet-100/80 pb-2">
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 via-fuchsia-500 to-amber-400 text-white shadow-md shadow-violet-500/25">
            <Gift className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0">
            <h2 className="text-xs font-extrabold text-gray-950 sm:text-sm">Scratch &amp; Save</h2>
            <p className="text-[9px] font-semibold leading-4 text-violet-700/80 sm:text-[10px]">
              Scratch the card and get up to {maxDiscountPercent}% discount
            </p>
          </span>
        </span>
        <span className="hidden rounded-full border border-violet-200 bg-white/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-violet-700 sm:inline-flex">
          Offer
        </span>
      </div>

      <div className="pt-2.5">
        {hasCoupon ? (
          <div className="mx-auto w-full" style={{ maxWidth: CARD_MAX_WIDTH }}>
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-[0_14px_32px_rgba(109,40,217,0.24)] ring-1 ring-white/50">
              <ScratchWonFace
                discountPercent={discountPercent}
                couponCode={coupon?.coupon_code}
              />
            </div>
          </div>
        ) : (
          <div ref={containerRef} className="mx-auto w-full" style={{ maxWidth: CARD_MAX_WIDTH }}>
            <div className="relative aspect-square w-full">
              {cardSize > 0 ? (
                <div className="absolute inset-0 overflow-hidden rounded-2xl shadow-[0_14px_32px_rgba(109,40,217,0.24)] ring-1 ring-white/50 [touch-action:none]">
                  <ScratchCard
                    key={scratchCardKey}
                    width={cardSize}
                    height={cardSize}
                    image={scratchSurfaceImage}
                    finishPercent={45}
                    brushSize={Math.max(16, Math.round(cardSize * 0.1))}
                    onComplete={handleScratchComplete}
                  >
                    <ScratchRewardFace size={cardSize} scratching={scratching} />
                  </ScratchCard>
                </div>
              ) : (
                <div className="h-full w-full animate-pulse rounded-2xl bg-gradient-to-br from-violet-100 via-fuchsia-100 to-amber-100" />
              )}
            </div>
          </div>
        )}

        {error ? <p className="mt-2.5 text-center text-[11px] font-semibold text-red-600">{error}</p> : null}
      </div>
    </section>
  );
}
