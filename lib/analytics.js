export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function isGAEnabled() {
  return process.env.NODE_ENV === 'production' && Boolean(GA_MEASUREMENT_ID);
}

function gtag(...args) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag(...args);
}

export function pageview(url) {
  if (!isGAEnabled()) {
    return;
  }

  gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

export function trackEvent(eventName, params = {}) {
  if (!isGAEnabled()) {
    return;
  }

  gtag('event', eventName, params);
}

export function trackProductView(product) {
  if (!isGAEnabled() || !product) {
    return;
  }

  const itemId = String(product._id ?? product.id ?? product.slug ?? '');
  const itemName = product.name ?? '';
  const itemCategory = product.category?.name ?? undefined;
  const price = Number(product.price);

  trackEvent('view_item', {
    currency: 'INR',
    value: Number.isFinite(price) ? price : undefined,
    items: [
      {
        item_id: itemId,
        item_name: itemName,
        item_category: itemCategory,
        price: Number.isFinite(price) ? price : undefined,
      },
    ],
  });
}
