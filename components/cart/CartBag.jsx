'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart/store';
import { formatInr } from '@/lib/cart/format';

export default function CartBag() {
  const items = useCartStore((state) => state.items);

  return (
    <section aria-labelledby="cart-bag-heading" className="min-w-0">
      <h2 id="cart-bag-heading" className="text-xl font-bold text-gray-900">
        Bag
      </h2>
      <div className="mt-4 border-t border-gray-200" />

      {items.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-gray-600">Your bag is empty.</p>
          <Link
            href="/products"
            className="mt-3 inline-block text-sm font-semibold text-gray-900 underline underline-offset-2 hover:text-gray-700"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 py-5">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-snug text-gray-900">
                  {item.title}
                  {item.sizeLabel ? ` (${item.sizeLabel})` : ''}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Size: {item.sizeLabel || item.size}/ Qty: {item.quantity}
                </p>
                <div className="mt-2 flex flex-wrap items-baseline gap-2">
                  <span className="text-sm text-gray-400 line-through">
                    {formatInr(item.originalPrice)}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatInr(item.price)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
