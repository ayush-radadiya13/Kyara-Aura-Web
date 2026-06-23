import { cn } from "@/lib/utils";

const DOT_COUNT = 5;

const spinnerSizes = {
  xs: "h-3.5 w-3.5 border-2",
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

const dotLoaderSizes = {
  sm: { dot: 10, gap: 5, jump: "1.4rem" },
  md: { dot: 14, gap: 6, jump: "2rem" },
  lg: { dot: 16, gap: 7, jump: "2.5rem" },
  page: { dot: 20, gap: 8, jump: "3rem" },
};

export function Loader({ className, size = "md" }) {
  return (
    <span
      role="status"
      aria-label="Please wait"
      className={cn(
        "inline-block animate-spin rounded-full border-gold border-t-transparent",
        spinnerSizes[size] ?? spinnerSizes.md,
        className,
      )}
    />
  );
}

export function DotLoader({
  className,
  size = "lg",
  showLabel = false,
  label = "Loading",
}) {
  const config = dotLoaderSizes[size] ?? dotLoaderSizes.lg;

  return (
    <div
      className={cn("inline-flex flex-col items-center justify-center gap-3", className)}
      aria-hidden={showLabel ? undefined : true}
    >
      <div
        className="ka-dot-loader flex items-end"
        style={{
          gap: config.gap,
          minHeight: `calc(${config.dot}px + ${config.jump})`,
          "--ka-dot-jump": `-${config.jump}`,
        }}
      >
        {Array.from({ length: DOT_COUNT }, (_, index) => (
          <span
            key={index}
            className="ka-dot-loader__dot shrink-0 rounded-full bg-[#d4a373]"
            style={{
              width: config.dot,
              height: config.dot,
              animationDelay: `${(index + 1) * 0.1}s`,
            }}
          />
        ))}
      </div>

      {showLabel ? (
        <p className="font-display text-[10px] font-light uppercase tracking-[0.32em] text-[#5c3d2e]">
          {label}
        </p>
      ) : null}
    </div>
  );
}

/** Full-section loader for main catalog views (products, categories). */
export function DotLoaderBlock({ className, spinnerClassName, size = "lg", showLabel = false }) {
  return (
    <div className={cn("flex w-full items-center justify-center py-12", className)}>
      <DotLoader
        size={size}
        className={spinnerClassName}
        showLabel={showLabel}
      />
    </div>
  );
}

/** Inline / small-section loader (cart, orders, buttons, etc.). */
export function LoaderBlock({ className, spinnerClassName, size = "lg" }) {
  return (
    <div className={cn("flex w-full items-center justify-center py-12", className)}>
      <Loader size={size} className={spinnerClassName} />
    </div>
  );
}

export function LoadingLabel({ children, className, spinnerClassName, size = "sm" }) {
  return (
    <span className={cn("inline-flex items-center justify-center gap-2", className)}>
      <Loader size={size} className={cn("shrink-0", spinnerClassName)} />
      <span>{children}</span>
    </span>
  );
}
