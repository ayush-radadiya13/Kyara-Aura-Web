import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Split auth layout: image left, form right.
 *
 * @param {{
 *   imageSrc: string;
 *   imageAlt: string;
 *   eyebrow?: string;
 *   headline?: string;
 *   children: React.ReactNode;
 *   className?: string;
 * }} props
 */
export default function AuthSplitLayout({
  imageSrc,
  imageAlt,
  eyebrow = 'Kyara Aura',
  headline = 'Timeless jewellery, crafted for you.',
  children,
  className,
}) {
  return (
    <div
      className={cn(
        'w-full max-w-5xl overflow-hidden border-none bg-white shadow-lg',
        className,
      )}
    >
      <div className="grid min-h-[520px] lg:grid-cols-2 lg:min-h-[640px]">
        {/* Left — hero image */}
        <div className="relative min-h-[240px] border-none sm:min-h-[300px] lg:min-h-full">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />

          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              {eyebrow}
            </p>
            <h2 className="mt-2 max-w-xs font-display text-2xl leading-tight text-white sm:text-3xl">
              {headline}
            </h2>
          </div>
        </div>

        {/* Right — form */}
        <div className="flex flex-col justify-center bg-white px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
          {children}
        </div>
      </div>
    </div>
  );
}
