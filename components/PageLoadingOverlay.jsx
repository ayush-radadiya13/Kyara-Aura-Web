import { DotLoader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";

export function PageLoadingOverlay({ className, spinnerClassName }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading page content"
      className={cn(
        "fixed inset-0 z-[200] flex items-center justify-center bg-transparent backdrop-blur-md",
        className,
      )}
    >
      <DotLoader
        size="page"
        showLabel
        label="Loading"
        className={spinnerClassName}
      />
    </div>
  );
}

export function PageLoadingFallback({ className, spinnerClassName }) {
  return (
    <PageLoadingOverlay
      className={className}
      spinnerClassName={spinnerClassName}
    />
  );
}
