'use client';

import { toast } from 'sonner';

/**
 * Single source of truth for user-facing notifications.
 *
 * Wraps `sonner` (mounted once in the root layout via `components/ui/sonner.jsx`
 * at the bottom-center of the screen) so every success, error, warning, and
 * information message in the app is rendered the same way and in the same place.
 */

const FALLBACKS = {
  success: 'Success',
  error: 'Something went wrong. Please try again.',
  warning: 'Warning',
  info: 'Notice',
};

function resolveMessage(message, fallback) {
  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }
  if (message != null && typeof message !== 'object') {
    return String(message);
  }
  return fallback;
}

export const apiToast = {
  success(message, options) {
    return toast.success(resolveMessage(message, FALLBACKS.success), options);
  },
  error(message, options) {
    return toast.error(resolveMessage(message, FALLBACKS.error), options);
  },
  warning(message, options) {
    return toast.warning(resolveMessage(message, FALLBACKS.warning), options);
  },
  info(message, options) {
    return toast.info(resolveMessage(message, FALLBACKS.info), options);
  },
  message(message, options) {
    return toast(resolveMessage(message, ''), options);
  },
  dismiss(id) {
    return toast.dismiss(id);
  },
};

export default apiToast;
