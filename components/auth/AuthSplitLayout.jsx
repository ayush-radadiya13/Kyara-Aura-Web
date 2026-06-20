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
}) {
  const hasCopy = Boolean(eyebrow || headline);

  return (
    <div
      className={cn(
        'w-full max-w-5xl overflow-hidden border-none  ',
        className,
      )}
    >
      <div className="grid  lg:grid-cols-2 ">
        {/* Left — hero media */}
        <div
          className={cn(
            'relative min-h-[240px] border-none sm:min-h-[300px] lg:min-h-full',
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

        {/* Right — form */}
        <div className="flex flex-col justify-center  px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
          {children}
        </div>
      </div>
    </div>
  );
}
