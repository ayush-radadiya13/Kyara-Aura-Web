'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      duration={3000}
      closeButton
      offset={{ bottom: '1.25rem' }}
      mobileOffset={{ bottom: '1rem', left: '1rem', right: '1rem' }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            'group toast w-full max-w-[min(100vw-2rem,24rem)] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-950 shadow-[0_12px_40px_rgba(17,24,39,0.15)]',
          title: 'text-sm font-semibold text-gray-950',
          description: 'text-sm text-gray-600',
          actionButton:
            'rounded-full bg-gray-950 px-4 py-2 text-xs font-semibold uppercase text-white transition hover:bg-gray-800',
          cancelButton:
            'rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700',
          closeButton:
            'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
        },
      }}
    />
  );
}
