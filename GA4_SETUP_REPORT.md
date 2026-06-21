# GA4 Setup Report

**Project:** Kayra Aura Web  
**Date:** June 21, 2026  
**Measurement ID:** `G-N4575B4JJV`

---

## Summary

Google Analytics 4 (GA4) is integrated globally via the root layout using Next.js App Router patterns. Scripts load only in production, page views are tracked on initial load and client-side navigations, and product detail visits emit GA4 `view_item` events. No UI, styling, or business logic was changed.

---

## Files Changed

| File | Change type |
|------|-------------|
| `lib/analytics.js` | **New** — reusable GA4 utility (`pageview`, `trackEvent`, `trackProductView`) |
| `components/analytics/GoogleAnalytics.jsx` | **New** — gtag scripts + route change tracker |
| `components/analytics/ProductViewTracker.jsx` | **New** — product detail `view_item` tracker |
| `app/layout.js` | Modified — mounts `GoogleAnalytics` in root layout |
| `app/products/[slug]/page.js` | Modified — mounts `ProductViewTracker` for valid products |

**Total:** 3 new files, 2 modified files

---

## Environment Variables Added

Add this to your production environment (e.g. `.env.local` for local production builds, Vercel/Railway env settings for deployment):

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-N4575B4JJV
```

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-N4575B4JJV` | Yes (production only) |

GA is **disabled** when:

- `NODE_ENV` is not `production` (e.g. `next dev`)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` is missing or empty

---

## Tracking Events Enabled

| Event | Trigger | Details |
|-------|---------|---------|
| **Page view** | Initial load + every App Router navigation | `gtag('config', …, { page_path })` via `RouteChangeTracker` using `usePathname` + `useSearchParams` |
| **Route change** | Same as page view | Query strings are included (e.g. `/products?category=123`) |
| **Product detail visit** | `/products/[slug]` when product exists | GA4 `view_item` with `item_id`, `item_name`, `item_category`, `price`, `currency: INR` |

### Implementation notes

- `send_page_view: false` on initial gtag config prevents duplicate page views; all page views are sent from the client-side route tracker in `useEffect`.
- `GoogleAnalytics` returns `null` outside production — no script tags or hydration mismatch in development.
- `RouteChangeTracker` is wrapped in `<Suspense>` because `useSearchParams()` requires it in the App Router.
- `ProductViewTracker` renders nothing (`null`) and deduplicates by product slug per mount.

---

## Verification Steps

### 1. Set the environment variable

```bash
# .env.local (for production build testing)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-N4575B4JJV
```

### 2. Production build and start

```bash
npm run build
npm run start
```

Open `http://localhost:3000`. GA does **not** load during `npm run dev`.

### 3. Confirm scripts load

In browser DevTools → **Network**, filter by `gtag` or `google`. You should see:

- `https://www.googletagmanager.com/gtag/js?id=G-N4575B4JJV`
- Requests to `https://www.google-analytics.com/g/collect`

### 4. Real-time reports (GA4 UI)

1. Open [Google Analytics](https://analytics.google.com/) → your property.
2. Go to **Reports → Realtime**.
3. Visit the site in another tab; your active user should appear.
4. Navigate between pages (e.g. Home → Products → a product). Page paths should update in Realtime.

### 5. Product detail events

1. Open a product page: `/products/{slug}`.
2. In DevTools → **Network**, look for `collect` requests containing `en=view_item`.
3. In GA4: **Reports → Monetization → Ecommerce purchases** (or **DebugView** if using debug mode) — `view_item` events should include product name and ID.

### 6. Development sanity check

```bash
npm run dev
```

- No gtag scripts in Network tab.
- No console errors related to analytics.
- App behavior unchanged.

### 7. Optional: GA4 DebugView

Install the [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) Chrome extension, run a production build (`npm run build && npm run start`), and use **Admin → DebugView** in GA4 for live event inspection.

---

## Architecture

```
app/layout.js
  └── GoogleAnalytics (client)
        ├── next/script → gtag.js (afterInteractive)
        ├── next/script → gtag init (send_page_view: false)
        └── Suspense → RouteChangeTracker → pageview()

app/products/[slug]/page.js
  └── ProductViewTracker (client) → trackProductView() → view_item

lib/analytics.js
  ├── isGAEnabled()
  ├── pageview(url)
  ├── trackEvent(name, params)
  └── trackProductView(product)
```
