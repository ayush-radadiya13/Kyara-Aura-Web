'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LoadingLabel } from '@/components/ui/loader';
import { useScrollLock } from '@/hooks/use-scroll-lock';

/**
 * @param {{
 *   open: boolean;
 *   phone?: string;
 *   otp: string;
 *   error?: string;
 *   loading?: boolean;
 *   onOtpChange: (value: string) => void;
 *   onClose: () => void;
 *   onSubmit: () => void;
 *   description?: import('react').ReactNode;
 *   submitLabel?: string;
 *   loadingLabel?: string;
 *   inputId?: string;
 *   titleId?: string;
 * }} props
 */
export default function OtpVerificationModal({
  open,
  phone = '',
  otp,
  error = '',
  loading = false,
  onOtpChange,
  onClose,
  onSubmit,
  description,
  submitLabel = 'Register',
  loadingLabel = 'Creating account...',
  inputId = 'otp-verification',
  titleId = 'otp-verification-title',
}) {
  useScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const defaultDescription = phone ? (
    <>Enter the 6-digit OTP sent to {phone} and complete your registration.</>
  ) : (
    'Enter the 6-digit OTP sent to complete your registration.'
  );

  return createPortal(
    <div
      className="fixed inset-0 z-80 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" data-lenis-prevent>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-xl font-semibold text-gray-900">
              Verify OTP
            </h2>
            <p className="mt-1 text-sm text-gray-500">{description ?? defaultDescription}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-sm font-medium text-gray-500 transition hover:text-gray-800 disabled:opacity-50"
            aria-label="Close verification dialog"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
              OTP
            </label>
            <input
              id={inputId}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) => onOtpChange(event.target.value)}
              disabled={loading}
              autoFocus
              className="h-11 w-full rounded border border-gray-300 px-3 text-sm outline-none transition focus:border-gray-950 disabled:opacity-60"
              placeholder="Enter 6-digit OTP"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="h-12 w-full rounded-none bg-[#C99B4D] text-base font-semibold text-primary-foreground transition hover:bg-[#C99B4D]/90 disabled:opacity-60"
          >
            {loading ? (
              <LoadingLabel spinnerClassName="border-white border-t-transparent">
                {loadingLabel}
              </LoadingLabel>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
