'use client';

import Link from 'next/link';
import { ChevronRight, Gift } from 'lucide-react';
import { useWebSettings } from '@/hooks/use-web-settings';
import {
  getBuyTwoGetOneTicketDefaultMessage,
} from '@/lib/cart/buy-two-get-one';
import { APP_ROUTES } from '@/lib/routes';
import { getBuyTwoGetOneQuantities } from '@/lib/web-settings';
import { cn } from '@/lib/utils';

export default function BuyTwoGetOneTicketBanner({
  href = APP_ROUTES.PRODUCTS,
  message,
  className,
  notchColor = '#fbfaf7',
  compact = false,
  fullWidth = false,
  fullWidthMobile = false,
}) {
  const { data: settings } = useWebSettings();
  const { buyQty, getQty } = getBuyTwoGetOneQuantities(settings);
  const resolvedMessage =
    message ?? getBuyTwoGetOneTicketDefaultMessage(buyQty, getQty);

  if (!resolvedMessage) return null;

  const isWideLayout = fullWidth || fullWidthMobile;

  return (
    <div
      className={cn(
        'relative mt-4 max-w-full',
        fullWidth && 'w-full',
        fullWidthMobile && 'w-full sm:w-fit',
        !isWideLayout && 'w-fit',
        className,
      )}
    >
      <Link
        href={href}
        style={{ '--ticket-notch-color': notchColor }}
        className={cn(
          'ticket-offer-banner group relative flex items-center rounded-[10px] bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#3d3d3d] text-[#F5E6C8] ring-1 ring-inset ring-[#D4AF37]/25 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]',
          fullWidth && 'w-full justify-between',
          fullWidthMobile && 'w-full justify-between sm:w-fit sm:max-w-full',
          !isWideLayout && 'w-fit max-w-full',
          compact
            ? 'ticket-offer-banner--compact gap-2 py-2 pl-4 pr-4'
            : 'gap-2.5 py-2.5 pl-5 pr-5 sm:pl-5 sm:pr-5',
        )}
        aria-label={resolvedMessage}
      >
        <span className={cn('flex min-w-0 items-center', compact ? 'gap-2' : 'gap-2.5')}>
          <span
            className={cn(
              'flex shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/15',
              compact ? 'h-6 w-6' : 'h-7 w-7',
            )}
          >
            <Gift
              className={cn('text-[#D4AF37]', compact ? 'h-3 w-3' : 'h-3.5 w-3.5')}
              strokeWidth={2.25}
            />
          </span>

          <span
            className={cn(
              'font-extrabold tracking-wide',
              isWideLayout && 'min-w-0 truncate',
              fullWidthMobile && 'sm:shrink-0 sm:truncate-none sm:whitespace-nowrap',
              !isWideLayout && 'shrink-0 whitespace-nowrap',
              compact ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm',
            )}
          >
            {resolvedMessage}
          </span>
        </span>

        <span className="flex shrink-0 items-center">
          <span
            aria-hidden="true"
            className={cn(
              'border-l border-dashed border-[#D4AF37]/30',
              compact ? 'mx-1 h-4' : 'mx-1.5 h-5',
            )}
          />

          <ChevronRight
            className={cn(
              'text-[#D4AF37] transition group-hover:translate-x-0.5',
              compact ? 'h-3.5 w-3.5' : 'h-4 w-4',
            )}
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </span>
      </Link>
    </div>
  );
}
