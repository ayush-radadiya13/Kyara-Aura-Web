'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ScratchCard } from 'next-scratchcard';
import { Drawer } from '@base-ui/react/drawer';
import { Gift, Percent, Sparkles, TicketPercent, X } from 'lucide-react';
import {
  clearLegacyScratchCouponStorage,
  getScratchCardStatusApi,
  getStoredScratchCoupon,
  scratchCardApi,
  writeStoredScratchCoupon,
} from '@/services/scratch-card';
import { useAuthStore } from '@/store/auth-store';
import { getApiErrorMessage } from '@/utils/api-error';
import { getAuthStorageKey } from '@/utils/auth-response';
import { fireCelebrationConfetti } from '@/utils/celebration-confetti';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

const MIN_CARD_SIZE = 140;
const MAX_CARD_SIZE = 188;
const CARD_MAX_WIDTH = 180;
const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';

function ScratchCardHint({ hasCoupon, discountPercent }) {
  if (hasCoupon) {
    return (
      <p className="mb-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3 py-2 text-[10px] font-semibold leading-4 text-emerald-800 sm:text-[11px]">
        Coupon unlocked! Your {discountPercent}% discount will apply automatically at checkout.
      </p>
    );
  }

  return (
    <p className="mb-2.5 flex items-start gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2 text-[10px] font-semibold leading-4 text-slate-600 sm:text-[11px]">
      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2a4068]" aria-hidden="true" />
      <span>
        Use your finger to scratch the navy foil card. A hidden discount coupon will unlock instantly for this order.
      </span>
    </p>
  );
}

function buildScratchSurfaceSvg(size) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="foil" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e2f4f"/>
      <stop offset="35%" stop-color="#2a4068"/>
      <stop offset="68%" stop-color="#35527d"/>
      <stop offset="100%" stop-color="#4a6a9a"/>
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

export { clearStoredScratchCoupon, getStoredScratchCoupon } from '@/services/scratch-card';

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
      <div className="pointer-events-none absolute -bottom-6 -left-4 h-12 w-12 rounded-full bg-sky-300/20 blur-2xl" />
      <div className="pointer-events-none absolute right-3 top-3 h-7 w-7 rounded-full border border-white/20 bg-white/10" />
      <div className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 rounded-full border border-white/15 bg-white/10" />
    </>
  );
}

function ScratchRewardFace({ size, scratching }) {
  return (
    <div
      className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#1e2f4f] via-[#2a4068] to-[#35527d] p-3 text-white"
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

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/15 text-white shadow-lg shadow-slate-900/25 backdrop-blur-sm">
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
    <div className="relative flex h-full min-h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#243b5c] via-[#2e4a6e] to-[#3d5f8c] p-3 text-white">
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

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white text-slate-800 shadow-lg shadow-slate-900/20">
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

function ScratchCardHeader({ maxDiscountPercent }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
      <span className="flex min-w-0 items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e2f4f] via-[#2a4068] to-[#4a6a9a] text-white shadow-md shadow-slate-900/20">
          <Gift className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0">
          <h2 className="text-xs font-extrabold text-gray-950 sm:text-sm">Scratch &amp; Save</h2>
          <p className="text-[9px] font-semibold leading-4 text-slate-600 sm:text-[10px]">
            Scratch &amp; reveal a surprise coupon — save up to {maxDiscountPercent}% at checkout
          </p>
        </span>
      </span>
      <span className="hidden rounded-full border border-slate-200 bg-white/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-700 sm:inline-flex">
        Offer
      </span>
    </div>
  );
}

function ScratchCardInteractive({
  hasCoupon,
  coupon,
  discountPercent,
  containerRef,
  cardSize,
  scratchSurfaceImage,
  scratchCardKey,
  scratching,
  onScratchComplete,
  error,
}) {
  return (
    <div className="pt-2.5">
      <ScratchCardHint hasCoupon={hasCoupon} discountPercent={discountPercent} />

      {hasCoupon ? (
        <div className="mx-auto w-full" style={{ maxWidth: CARD_MAX_WIDTH }}>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-[0_14px_32px_rgba(30,47,79,0.22)] ring-1 ring-white/50">
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
              <div className="absolute inset-0 overflow-hidden rounded-2xl shadow-[0_14px_32px_rgba(30,47,79,0.22)] ring-1 ring-white/50 [touch-action:none]">
                <ScratchCard
                  key={scratchCardKey}
                  width={cardSize}
                  height={cardSize}
                  image={scratchSurfaceImage}
                  finishPercent={45}
                  brushSize={Math.max(16, Math.round(cardSize * 0.1))}
                  onComplete={onScratchComplete}
                >
                  <ScratchRewardFace size={cardSize} scratching={scratching} />
                </ScratchCard>
              </div>
            ) : (
              <div className="h-full w-full animate-pulse rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50" />
            )}
          </div>
        </div>
      )}

      {error ? <p className="mt-2.5 text-center text-[11px] font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}

function ScratchCardLoading() {
  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 p-3 shadow-[0_10px_28px_rgba(30,47,79,0.08)] lg:hidden">
        <div className="flex animate-pulse items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-28 rounded-full bg-slate-200" />
            <div className="h-3 w-full max-w-[220px] rounded-full bg-slate-100" />
          </div>
          <div className="h-9 w-16 shrink-0 rounded-full bg-slate-200" />
        </div>
      </section>

      <section className="hidden overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 p-2.5 shadow-[0_10px_28px_rgba(30,47,79,0.08)] sm:p-3 lg:block">
        <div
          className="mx-auto aspect-square w-full animate-pulse rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50"
          style={{ maxWidth: CARD_MAX_WIDTH }}
        />
      </section>
    </>
  );
}

function ScratchCardMobileTeaser({
  maxDiscountPercent,
  hasCoupon,
  discountPercent,
  onOpen,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 p-3 shadow-[0_10px_28px_rgba(30,47,79,0.08)] lg:hidden">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e2f4f] via-[#2a4068] to-[#4a6a9a] text-white shadow-md shadow-slate-900/20">
          <Gift className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-extrabold text-gray-950">Scratch &amp; Save</h2>
          <p className="mt-0.5 text-[11px] font-semibold leading-4 text-slate-600">
            {hasCoupon
              ? `Your ${discountPercent}% coupon is ready. Tap Open to view it before checkout.`
              : `Tap Open, scratch the card with your finger, and unlock up to ${maxDiscountPercent}% off!`}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-[#2a4068] px-4 text-xs font-bold text-white shadow-[0_8px_18px_rgba(30,47,79,0.22)] transition hover:bg-[#35527d]"
        >
          Open
        </button>
      </div>
    </section>
  );
}

function ScratchCardDrawer({ open, onOpenChange, maxDiscountPercent, children }) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-[70] bg-gray-950/45 backdrop-blur-sm transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 lg:hidden" />
        <Drawer.Viewport className="lg:hidden">
          <Drawer.Popup className="fixed inset-x-0 bottom-0 z-[71] flex max-h-[min(92vh,640px)] flex-col rounded-t-[1.35rem] border border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white shadow-[0_-24px_80px_rgba(30,47,79,0.16)] outline-none transition-transform duration-300 data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 pb-4 pt-5">
              <div className="min-w-0">
                <Drawer.Title className="text-lg font-extrabold text-gray-950">Scratch &amp; Save</Drawer.Title>
                <Drawer.Description className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                  Use your finger to scratch the card below. Your surprise discount applies automatically at checkout — up to {maxDiscountPercent}% off.
                </Drawer.Description>
              </div>
              <Drawer.Close
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                aria-label="Close scratch card"
              >
                <X className="h-5 w-5" />
              </Drawer.Close>
            </div>

            <div className="overflow-y-auto px-5 py-4" data-lenis-prevent>
              {children}
            </div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default function ScratchCardOffer({ initialCoupon = null, onCouponChange, compact = false }) {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const storageUserKey = getAuthStorageKey(user, token);

  const [status, setStatus] = useState(null);
  const [coupon, setCoupon] = useState(initialCoupon);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [scratching, setScratching] = useState(false);
  const [scratchCardKey, setScratchCardKey] = useState(0);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const hasCoupon = Boolean(coupon?.coupon_code);
  const cardEnabled = !loadingStatus && status?.is_active && (!hasCoupon || drawerOpen || isDesktop);
  const { containerRef, cardSize } = useSquareCardSize(cardEnabled && (isDesktop || drawerOpen));

  const scratchSurfaceImage = useMemo(
    () => (cardSize > 0 ? buildScratchSurfaceSvg(cardSize) : ''),
    [cardSize],
  );

  useEffect(() => {
    if (!isHydrated) return;

    clearLegacyScratchCouponStorage();

    if (!storageUserKey) {
      setCoupon(null);
      onCouponChange?.(null);
      return;
    }

    const storedCoupon = getStoredScratchCoupon(storageUserKey);
    setCoupon(storedCoupon);
    onCouponChange?.(storedCoupon);
  }, [isHydrated, storageUserKey, onCouponChange]);

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
            if (storageUserKey) writeStoredScratchCoupon(null, storageUserKey);
            onCouponChange?.(null);
          }
        }
      } catch {
        if (isCurrent) {
          setStatus({ is_active: false });
          setCoupon(null);
          if (storageUserKey) writeStoredScratchCoupon(null, storageUserKey);
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
  }, [onCouponChange, storageUserKey]);

  const updateCoupon = (nextCoupon) => {
    setCoupon(nextCoupon);
    if (storageUserKey) writeStoredScratchCoupon(nextCoupon, storageUserKey);
    onCouponChange?.(nextCoupon);
  };

  const handleScratchComplete = async () => {
    if (scratching || coupon?.coupon_code) return;

    setScratching(true);
    setError('');

    try {
      const generatedCoupon = await scratchCardApi();
      updateCoupon(generatedCoupon);
      fireCelebrationConfetti({ originY: isDesktop ? 0.72 : 0.82 });
    } catch (scratchError) {
      setError(getApiErrorMessage(scratchError, 'Unable to generate scratch card coupon.'));
      setScratchCardKey((currentKey) => currentKey + 1);
    } finally {
      setScratching(false);
    }
  };

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
    fireCelebrationConfetti({ originY: 0.82 });
  };

  if (loadingStatus) {
    return <ScratchCardLoading />;
  }

  if (!status?.is_active) return null;

  const discountPercent = Number(coupon?.discount_percent ?? 0);
  const maxDiscountPercent = Number(status?.max_discount_percent ?? 0);

  const interactiveCard = (
    <ScratchCardInteractive
      hasCoupon={hasCoupon}
      coupon={coupon}
      discountPercent={discountPercent}
      containerRef={containerRef}
      cardSize={cardSize}
      scratchSurfaceImage={scratchSurfaceImage}
      scratchCardKey={scratchCardKey}
      scratching={scratching}
      onScratchComplete={handleScratchComplete}
      error={error}
    />
  );

  if (isDesktop) {
    return (
      <section
        className={cn(
          'overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 shadow-[0_12px_32px_rgba(30,47,79,0.1)]',
          compact ? 'p-2 sm:p-2.5' : 'p-2.5 sm:p-3',
        )}
      >
        <ScratchCardHeader maxDiscountPercent={maxDiscountPercent} />
        {interactiveCard}
      </section>
    );
  }

  return (
    <>
      <ScratchCardMobileTeaser
        maxDiscountPercent={maxDiscountPercent}
        hasCoupon={hasCoupon}
        discountPercent={discountPercent}
        onOpen={handleOpenDrawer}
      />

      <ScratchCardDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        maxDiscountPercent={maxDiscountPercent}
      >
        {interactiveCard}
      </ScratchCardDrawer>
    </>
  );
}
