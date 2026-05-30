import { cn } from "@/lib/utils";

const loaderSizes = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

export function Loader({ className, size = "md" }) {
  return (
    <span
      role="status"
      aria-label="Please wait"
      className={cn(
        "inline-block animate-spin rounded-full border-gold border-t-transparent",
        loaderSizes[size],
        className,
      )}
    />
  );
}

export function LoaderBlock({ className, spinnerClassName, size = "lg" }) {
  return (
    <div className={cn("flex w-full items-center justify-center py-12", className)}>
      <Loader size={size} className={spinnerClassName} />
    </div>
  );
}
