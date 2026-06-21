import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Split auth layout: media left, form right.
 *
 * @param {{
 *   imageSrc?: string;
 *   imageAlt?: string;
 *   videoSrc?: string;
 *   videoLabel?: string;
 *   eyebrow?: string;
 *   headline?: string;
 *   children: React.ReactNode;
 *   className?: string;
 *   mediaClassName?: string;
 *   scrollableForm?: boolean;
 * }} props
 */
export default function AuthSplitLayout({
  imageSrc,
  imageAlt,
  videoSrc,
  videoLabel = 'Kayra Aura logo animation',
  eyebrow = 'Kayra Aura',
  headline = 'Timeless jewellery, crafted for you.',
  children,
  className,
  mediaClassName,
  scrollableForm = false,
}) {
  const hasCopy = Boolean(eyebrow || headline);

  return (
    <div
      className={cn(
        'w-full max-w-5xl overflow-hidden border-none',
        scrollableForm && 'flex h-full min-h-0 flex-col lg:grid lg:grid-cols-2 lg:grid-rows-1',
        !scrollableForm && 'grid lg:grid-cols-2',
        className,
      )}
    >
        {/* Left — hero media (fixed, does not scroll) */}
        <div
          className={cn(
            'relative shrink-0 border-none',
            scrollableForm
              ? 'h-[180px] min-h-[180px] sm:h-[200px] sm:min-h-[200px] lg:h-full lg:min-h-0'
              : 'min-h-[240px] sm:min-h-[300px] lg:min-h-full',
            mediaClassName,
          )}
        >
          {videoSrc ? (
            <video
              className="absolute inset-0 h-full w-full object-contain"
              aria-label={videoLabel}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            >
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          )}
          {hasCopy ? (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
          ) : null}

          {hasCopy ? (
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
              {eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                  {eyebrow}
                </p>
              ) : null}
              {headline ? (
                <h2 className="mt-2 max-w-xs font-display text-2xl leading-tight text-white sm:text-3xl">
                  {headline}
                </h2>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Right — form (scrollable when scrollableForm is true) */}
        <div
          className={cn(
            'flex flex-col px-4 py-6 sm:px-10 sm:py-8 lg:px-12 lg:py-10',
            scrollableForm
              ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] lg:max-h-full [&::-webkit-scrollbar]:hidden'
              : 'justify-center px-6 py-10 sm:py-12',
          )}
          {...(scrollableForm ? { 'data-lenis-prevent': true } : {})}
        >
          {children}
        </div>
    </div>
  );
}
