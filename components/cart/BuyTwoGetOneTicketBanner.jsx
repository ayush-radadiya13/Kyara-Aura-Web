'use client';

import Link from 'next/link';
import { ChevronRight, Gift } from 'lucide-react';
import { APP_ROUTES } from '@/lib/routes';
import { BUY_TWO_GET_ONE_TICKET_DEFAULT_MESSAGE } from '@/lib/cart/buy-two-get-one';
import { cn } from '@/lib/utils';

export default function BuyTwoGetOneTicketBanner({
  href = APP_ROUTES.PRODUCTS,
  message = BUY_TWO_GET_ONE_TICKET_DEFAULT_MESSAGE,
  className,
  notchColor = '#fbfaf7',
  compact = false,
  fullWidth = false,
  fullWidthMobile = false,
}) {
  if (!message) return null;

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
          'ticket-offer-banner group relative flex items-center rounded-[10px] bg-gradient-to-r from-[#1e2f4f] via-[#2a4068] to-[#35527d] text-white ring-1 ring-inset ring-white/10 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2a4068]',
          fullWidth && 'w-full justify-between',
          fullWidthMobile && 'w-full justify-between sm:w-fit sm:max-w-full',
          !isWideLayout && 'w-fit max-w-full',
          compact
            ? 'ticket-offer-banner--compact gap-2 py-2 pl-4 pr-4'
            : 'gap-2.5 py-2.5 pl-5 pr-5 sm:pl-5 sm:pr-5',
        )}
        aria-label={message}
      >
        <span className={cn('flex min-w-0 items-center', compact ? 'gap-2' : 'gap-2.5')}>
          <span
            className={cn(
              'flex shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10',
              compact ? 'h-6 w-6' : 'h-7 w-7',
            )}
          >
            <Gift
              className={cn('text-white', compact ? 'h-3 w-3' : 'h-3.5 w-3.5')}
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
            {message}
          </span>
        </span>

        <span className="flex shrink-0 items-center">
          <span
            aria-hidden="true"
            className={cn(
              'border-l border-dashed border-white/30',
              compact ? 'mx-1 h-4' : 'mx-1.5 h-5',
            )}
          />

          <ChevronRight
            className={cn(
              'text-white/90 transition group-hover:translate-x-0.5',
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
