import Image from 'next/image';
import Link from 'next/link';

/**
 * @param {{ offers: Array<{ _id: string; title: string; description?: string; image: string; isFeatured: boolean; originalPrice: number | null; finalPrice: number | null; discountBadge: string | null }> }} props
 */
export default function StorefrontOffers({ offers }) {
  if (!offers?.length) return null;

  const featured = offers.filter((o) => o.isFeatured);
  const rest = offers.filter((o) => !o.isFeatured);

  function OfferCard({ offer, highlight }) {
    const hasPrices = offer.originalPrice != null && offer.finalPrice != null;

    return (
      <article
        className={`relative flex flex-col overflow-hidden rounded-none border transition-shadow duration-300 ${
          highlight
            ? 'border-gold/50 bg-gradient-to-b from-gold/[0.08] to-white shadow-gold-glow-sm ring-1 ring-gold/25'
            : 'border-gray-200 bg-white/80 hover:border-gold/30 hover:shadow-gold-glow-sm'
        }`}
      >
        {offer.discountBadge && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase bg-gold text-white">
            {offer.discountBadge}
          </span>
        )}
        {offer.isFeatured && (
          <span className="absolute top-3 right-3 z-10 px-2 py-0.5 text-[10px] tracking-widest uppercase text-gray-700 bg-white/60 border border-gold/40">
            Featured
          </span>
        )}
        <div className="relative aspect-[4/3] w-full bg-gray-50">
          {offer.image ? (
            <Image
              src={offer.image}
              alt={offer.title}
              fill
              className="object-cover object-center"
              sizes="(max-width:768px) 100vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center font-display text-lg text-gray-400">
              {offer.title}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4 md:p-5">
          <h3 className="font-display text-lg md:text-xl text-gray-900 leading-snug">{offer.title}</h3>
          {offer.description ? (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{offer.description}</p>
          ) : null}
          {hasPrices ? (
            <p className="mt-4 text-sm">
              <span className="text-gray-400 line-through mr-2">${offer.originalPrice}</span>
              <span className="text-gold font-semibold text-lg">${offer.finalPrice}</span>
            </p>
          ) : offer.discountBadge ? (
            <p className="mt-4 text-gold text-sm font-medium">{offer.discountBadge}</p>
          ) : null}
          <Link
            href="/products"
            className="mt-auto pt-4 text-xs tracking-[0.2em] uppercase text-gold hover:text-gold-light transition-colors"
          >
            Shop deals →
          </Link>
        </div>
      </article>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 border-t border-gray-200">
      <div className="mb-10 md:mb-12 text-center md:text-left">
        <p className="text-gold text-xs tracking-[0.35em] uppercase mb-3">Limited time</p>
        <h2 className="font-display text-2xl md:text-3xl text-gray-900">Offers &amp; discounts</h2>
        <p className="mt-2 text-gray-600 text-sm max-w-xl mx-auto md:mx-0">
          Curated promotions — prices shown are for this deal; product catalog prices may vary.
        </p>
      </div>

      {featured.length > 0 && (
        <div className="mb-12">
          <h3 className="text-sm font-medium tracking-widest uppercase text-gold mb-4">Featured</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((o) => (
              <OfferCard key={o._id} offer={o} highlight />
            ))}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div>
          {featured.length > 0 && (
            <h3 className="text-sm font-medium tracking-widest uppercase text-gray-600 mb-4">More offers</h3>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((o) => (
              <OfferCard key={o._id} offer={o} highlight={false} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
