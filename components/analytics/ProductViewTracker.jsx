'use client';

import { useEffect, useRef } from 'react';
import { trackProductView } from '@/lib/analytics';

export default function ProductViewTracker({ product }) {
  const trackedSlug = useRef(null);

  useEffect(() => {
    const slug = product?.slug;
    if (!slug || trackedSlug.current === slug) {
      return;
    }

    trackedSlug.current = slug;
    trackProductView(product);
  }, [product]);

  return null;
}
