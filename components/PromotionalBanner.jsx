'use client';

import { useEffect, useState } from 'react';
import { usePromotionalMessages } from '@/hooks/use-promotional-messages';

const ROTATION_INTERVAL_MS = 5000;

export default function PromotionalBanner() {
  const { messages, hasMessages } = usePromotionalMessages();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [messages.join('|')]);

  useEffect(() => {
    if (messages.length <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % messages.length);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [messages.length]);

  if (!hasMessages) return null;

  const activeMessage = messages[activeIndex] ?? messages[0];

  return (
    <div className="pointer-events-none fixed left-3 right-3 top-[4.25rem] z-[49] flex justify-center sm:left-4 sm:right-4">
      <div className="mx-auto w-full max-w-8xl px-1 sm:px-0">
        <div className="flex justify-center">
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-auto inline-flex max-w-full items-center rounded-full border border-[#d3b987]/45 bg-gradient-to-r from-[#7a4f10] via-[#a97818] to-[#7a4f10] px-3 py-1 shadow-[0_6px_18px_rgba(122,79,16,0.38),inset_0_1px_0_rgba(255,255,255,0.28)] sm:px-3 sm:py-1.5"
          >
            <p
              key={activeMessage}
              className="whitespace-nowrap text-[clamp(9px,2.65vw,14px)] font-semibold tracking-wide text-[#fff8ea] transition-opacity duration-500"
            >
              {activeMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
