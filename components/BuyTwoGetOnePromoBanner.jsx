'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useWebSettings } from '@/hooks/use-web-settings';
import { getBuyTwoGetOneOfferTitle } from '@/lib/cart/buy-two-get-one';
import {
  getBuyTwoGetOneQuantities,
  isBuyTwoGetOneFreeEnabled,
} from '@/lib/web-settings';

const PROMO_IMAGE = {
  src: '/assets/image.png',
  width: 1672,
  height: 941,
};

export default function BuyTwoGetOnePromoBanner() {
  const { data: settings } = useWebSettings();
  const { buyQty, getQty } = getBuyTwoGetOneQuantities(settings);
  const offerTitle = getBuyTwoGetOneOfferTitle(buyQty, getQty);
  const setSize = buyQty + getQty;

  if (!isBuyTwoGetOneFreeEnabled(settings)) {
    return null;
  }

  return (
    <section
      className="w-full overflow-hidden border-y border-[#e8d5c4]/60 bg-gradient-to-r from-[#faf3eb] via-[#fffaf5] to-[#f7ede3]"
      aria-label={`${offerTitle} offer`}
    >
      <div className="grid w-full grid-cols-1 lg:grid-cols-2">
        <div className="flex items-center justify-center bg-[#f3e8dc]/40 sm:px-6 ">
          <Image
            src={PROMO_IMAGE.src}
            alt={`${offerTitle} — Kayra Aura jewellery offer`}
            width={PROMO_IMAGE.width}
            height={PROMO_IMAGE.height}
            className="h-auto w-full max-w-full object-contain"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-gold">
            Limited time offer
          </p>
          <h2 className="font-display text-3xl font-light leading-tight text-gray-950 sm:text-4xl lg:text-[2.75rem]">
            Buy {buyQty}, Get {getQty} Free
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-gray-600 sm:text-lg">
            Add any {setSize} eligible pieces to your bag and the lowest-priced{' '}
            {getQty === 1 ? 'item is' : `${getQty} items are`} on us. A perfect excuse to
            complete your stack.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-gray-600 sm:text-base">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
              Applies to eligible jewellery across all categories
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
              Lowest-priced item in each set of {setSize} is free
            </li>
          </ul>
          <Link
            href="/products"
            className="mt-8 inline-flex w-fit rounded-full border border-[#a87d5a] px-8 py-3 text-sm font-semibold tracking-wide text-[#8f6348] transition hover:border-[#8f6348] hover:text-[#7a5638]"
          >
            Shop the offer
          </Link>
        </div>
      </div>
    </section>
  );
}
