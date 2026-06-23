'use client';

import { Loader } from '@/components/ui/loader';
import { cn } from '@/lib/utils';

/**
 * Covers an auth form while an API request is in flight.
 *
 * @param {{ visible: boolean; label?: string; className?: string }} props
 */
export default function AuthFormPendingOverlay({
  visible,
  label = 'Please wait',
  className,
}) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 z-10 flex items-center justify-center bg-transparent backdrop-blur-[2px]',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <Loader size="lg" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
