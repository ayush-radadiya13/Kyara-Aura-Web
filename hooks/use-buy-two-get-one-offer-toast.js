'use client';

import { useEffect, useRef } from 'react';
import { showBuyTwoGetOneOfferToast } from '@/lib/cart/toast';

export function useBuyTwoGetOneOfferToast(message) {
  const lastMessageRef = useRef(null);

  useEffect(() => {
    if (!message) {
      lastMessageRef.current = null;
      return;
    }

    if (message === lastMessageRef.current) return;

    lastMessageRef.current = message;
    showBuyTwoGetOneOfferToast(message);
  }, [message]);
}
