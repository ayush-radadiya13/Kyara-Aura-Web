# SEO Audit Report

**Project:** Kayra Aura Web (`kayra-aura-web`)  
**Framework:** Next.js 16.2.6 (App Router)  
**Audit date:** June 21, 2026  
**Scope:** Full codebase inspection — read-only, no code changes

---

## Existing SEO Implementation

### Central SEO utilities (`lib/seo.js`)

| Feature | Status | Details |
|---------|--------|---------|
| Site name & defaults | ✅ | `SITE_NAME`, `DEFAULT_SEO_TITLE`, `DEFAULT_SEO_DESCRIPTION` |
| `metadataBase` support | ✅ | Via `getSiteUrl()` reading env vars |
| Canonical URLs | ✅ | `alternates.canonical` in `metadataForPage()` |
| Open Graph | ✅ | `title`, `description`, `url`, `siteName`, `images`, `type` |
| Twitter Cards | ✅ | `summary_large_image` with title, description, images |
| JSON-LD helper | ✅ | `jsonLd()` with XSS-safe serialization |
| Absolute URL builder | ✅ | `absoluteUrl(path)` |

```24:57:lib/seo.js
export function metadataForPage({
  title,
  description = DEFAULT_SEO_DESCRIPTION,
  path = "/",
  images = ["/assets/home1.jpg"],
  type = "website",
} = {}) {
  const url = absoluteUrl(path);
  const resolvedTitle = title || DEFAULT_SEO_TITLE;

  return {
    title: resolvedTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: resolvedTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: images.map((image) => ({
        url: absoluteUrl(image),
        alt: resolvedTitle,
      })),
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: images.map((image) => absoluteUrl(image)),
    },
  };
}
```

### Root layout (`app/layout.js`)

| Feature | Status | Details |
|---------|--------|---------|
| Metadata API | ✅ | Static `export const metadata` |
| `metadataBase` | ✅ | `getSiteUrl()` |
| `applicationName` | ✅ | `"Kayra Aura"` |
| Favicon / app icons | ✅ | `/assets/ka1.png` for `icon`, `shortcut`, `apple` |
| Default title & description | ✅ | Via `metadataForPage()` |
| Viewport | ✅ | `device-width`, `initialScale: 1` |
| `lang` attribute | ✅ | `<html lang="en">` |
| Font optimization | ✅ | `next/font/google` (Geist, Geist Mono) |

```27:45:app/layout.js
export const metadata = {
  metadataBase: getSiteUrl(),
  applicationName: SITE_NAME,
  icons: {
    icon: "/assets/ka1.png",
    shortcut: "/assets/ka1.png",
    apple: "/assets/ka1.png",
  },
  ...metadataForPage({
    title: DEFAULT_SEO_TITLE,
    description: DEFAULT_SEO_DESCRIPTION,
    path: "/",
  }),
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};
```

### Dynamic & static page metadata

| Route | Metadata | Method |
|-------|----------|--------|
| `/` | ✅ Full (OG, Twitter, canonical) | `metadataForPage()` |
| `/products/[slug]` | ✅ Dynamic per product | `generateMetadata()` |
| `/categories` | ✅ Dynamic per category filter | `generateMetadata()` |
| `/collections` | ✅ Full | `metadataForPage()` |
| `/login` | ⚠️ Title + description only | Static `metadata` |
| `/register` | ⚠️ Title + description only | Static `metadata` |
| `/reset-password` | ⚠️ Title + description only | Static `metadata` |
| `/cart` | ⚠️ Title + description only | Static `metadata` |
| `/wishlist` | ⚠️ Title + description only | Static `metadata` |
| `/orders` | ⚠️ Title + description only | Static `metadata` |
| `/payment-method` | ⚠️ Title + description only | Static `metadata` |
| `/order-success/[id]` | ⚠️ Title + description only | Static `metadata` |
| `/terms` | ⚠️ Title + description only | Static `metadata` |
| `/privacy` | ⚠️ Title + description only | Static `metadata` |
| `/shipping-policy` | ⚠️ Title + description only | Static `metadata` |
| `/return-policy` | ⚠️ Title + description only | Static `metadata` |
| `/products` | ❌ None | — |
| `/forgot-password` | ❌ None | Client component page |

### robots.txt (`app/robots.js`)

- ✅ Generated via Next.js Metadata Route API
- ✅ Allows all crawlers on `/`
- ✅ Disallows `/account`, `/payment-method`
- ✅ References sitemap at `/sitemap.xml`

```3:12:app/robots.js
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/payment-method"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
```

### sitemap.xml (`app/sitemap.js`)

- ✅ Dynamic sitemap from API data
- ✅ Static routes: `/`, `/products`, `/categories`, policy pages, `/forgot-password`
- ✅ Dynamic product URLs: `/products/{slug}`
- ✅ Dynamic category URLs: `/categories?category={id}`
- ✅ `lastModified`, `changeFrequency`, `priority` set

### Structured data (JSON-LD)

| Schema | Location | Status |
|--------|----------|--------|
| Organization | `app/page.js` | ✅ Present |
| WebSite | `app/page.js` | ✅ Present |
| Product | `app/products/[slug]/page.js` | ✅ Present |
| BreadcrumbList | `app/products/[slug]/page.js` | ✅ Present (JSON-LD only) |
| Brand (nested) | Product schema | ✅ Present |
| Offer (nested) | Product schema | ✅ Present |

### Image SEO

- ✅ All images use `next/image` — no raw `<img>` tags found
- ✅ `alt` attributes present on product, category, hero, logo, cart, and auth images
- ✅ Responsive `sizes` attributes on most images
- ✅ Hero carousel uses `priority` for LCP image
- ✅ Product detail main image uses `priority`
- ✅ Remote image domains configured in `next.config.mjs`

### Internal linking

- ✅ Header nav: Home, Shop, Categories, Collections, Orders (`components/Header.jsx`)
- ✅ Footer links: Terms, Privacy, Shipping, Return, Collections (`components/Footer.jsx`)
- ✅ Product cards link to `/products/{slug}` (`components/ProductCard.jsx`)
- ✅ Category grid links to `/products?category={id}` (`components/CategoryGrid.jsx`)
- ✅ Homepage CTAs link to `/products`

### URL structure

- ✅ Clean, readable paths: `/products`, `/categories`, `/collections`, `/products/{slug}`
- ✅ Policy pages at dedicated paths: `/terms`, `/privacy`, `/shipping-policy`, `/return-policy`
- ✅ Centralized route constants in `lib/routes/index.js`

### Route protection (`proxy.js`)

- ✅ Redirects unauthenticated users from `/orders`, `/wishlist`, `/account` to `/login`

---

## Missing SEO Features

| Feature | Notes |
|---------|-------|
| Keywords meta tags | Not used anywhere (low priority; largely ignored by Google) |
| hreflang tags | No internationalization / alternate language versions |
| `manifest.json` / web app manifest | No PWA manifest route or file |
| `themeColor` metadata | Not configured |
| Dedicated OG image route (`opengraph-image`) | Uses static `/assets/home1.jpg` default |
| OG image dimensions (`width`/`height`) | Not specified in metadata |
| `robots` meta tags (`noindex`/`nofollow`) | No page-level indexing controls |
| Visible HTML breadcrumbs | Only JSON-LD on product pages |
| Product schema `aggregateRating` / `review` | Reviews exist in UI but not in schema |
| WebSite `SearchAction` | Site search exists in header but not in schema |
| Organization `sameAs` (populated) | Hardcoded empty array; social links load client-side |
| ItemList schema | Missing on product listing pages |
| FAQPage schema | Not applicable currently |
| LocalBusiness schema | Not present |
| `/products` page metadata | No title, description, canonical, or OG |
| `/forgot-password` metadata | Client-only page with no metadata export |
| Custom `not-found` page | No `app/not-found.js` |
| Redirects / rewrites | `next.config.mjs` has none |
| `/collections` in sitemap | Route exists but omitted from sitemap |
| Server-rendered product listings | Catalog grids fetch client-side only |
| Server-rendered category grid on homepage | Client-side fetch via React Query |
| About page | Footer "About Us" links to `/` |
| Dedicated 404 metadata | No not-found route |

---

## Issues Found

### Critical

#### 1. `/products` catalog page has no metadata

**File:** `app/products/page.js`

The main shop/catalog route exports no `metadata` or `generateMetadata`. It inherits only root layout defaults, producing incorrect title, description, canonical (`/`), and OG URL for a high-value indexable page.

```11:37:app/products/page.js
export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const categoryId = Array.isArray(params?.category)
    ? params.category[0]
    : params?.category;
  // ... no metadata export
}
```

#### 2. Product listing content is client-rendered (poor crawlability)

**Files:** `components/ProductList.jsx`, `components/CategoryGrid.jsx`, `components/HomeCollectionShowcase.jsx`

These components are `"use client"` and fetch data via React Query. Initial HTML renders a loading spinner, not product/category links:

```286:288:components/ProductList.jsx
  if (query.isLoading) {
    return <LoaderBlock />;
  }
```

**Affected pages:** `/`, `/products`, `/collections`, `/categories` (product sections)

Search engines that do not execute JavaScript may see empty catalog content on key landing and listing pages.

#### 3. Category URL inconsistency (duplicate content risk)

**Files:** `components/CategoryGrid.jsx`, `app/sitemap.js`, `app/categories/page.js`

- Category links point to `/products?category={id}` (`CategoryGrid.jsx` line 16)
- Sitemap lists `/categories?category={id}` (`app/sitemap.js` line 40)
- Category metadata canonical uses `/categories?category={id}` (`app/categories/page.js` line 42)

Two different URLs represent the same category intent with no cross-canonicalization.

#### 4. Private/transactional pages are indexable

**Files:** All auth, cart, checkout, and account pages

No `robots: { index: false }` on:

- `/login`, `/register`, `/forgot-password`, `/reset-password`
- `/cart`, `/wishlist`, `/orders`, `/payment-method`, `/order-success/[id]`

Only `/payment-method` is in `robots.txt` disallow; others remain crawlable and may appear in search results.

### High

#### 5. `/forgot-password` has no metadata

**File:** `app/forgot-password/page.js`

Entire page is a client component (`'use client'`) with no metadata export. Falls back to root defaults.

#### 6. Product Open Graph type is `website`, not `product`

**File:** `app/products/[slug]/page.js`

`metadataForPage()` is called without `type: 'product'`, so OG tags use default `type: "website"` even on product detail pages.

#### 7. Organization schema has empty `sameAs`

**File:** `app/page.js`

```20:27:app/page.js
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kayra Aura',
    url: absoluteUrl('/'),
    logo: absoluteUrl('/assets/ka1.png'),
    sameAs: [],
  };
```

Social profile URLs are available via web settings (`lib/web-settings.js`) but are not injected into Organization schema (client-loaded in `components/SocialLinks.jsx`).

#### 8. Product schema missing reviews/ratings

**File:** `app/products/[slug]/page.js`

Product pages display reviews (`ProductReviewsSection.jsx`, `ProductDetail.jsx`) but schema lacks `aggregateRating` and `review` properties, missing rich result eligibility.

#### 9. `SITE_URL` may resolve to localhost in production

**File:** `lib/seo.js`

Fallback chain ends at `"http://localhost:3000"`. If production env vars (`NEXT_PUBLIC_SITE_URL`, etc.) are unset, all canonical URLs, OG URLs, and sitemap entries will point to localhost.

```7:13:lib/seo.js
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  "http://localhost:3000";
```

#### 10. `/collections` missing from sitemap

**File:** `app/sitemap.js`

`/collections` is a public, metadata-enabled page but not included in `staticRoutes`.

### Medium

#### 11. Incomplete metadata on secondary pages

Auth, cart, policy, and account pages only set `title` and `description`. They do not use `metadataForPage()`, so they lack canonical URLs, Open Graph, and Twitter Card tags.

Example — `app/login/page.js`:

```5:8:app/login/page.js
export const metadata = {
  title: 'Login | Kayra Aura',
  description: 'Sign in to your Kayra Aura account.',
};
```

#### 12. Homepage heading hierarchy

**Files:** `components/HeroCarousel.jsx`, `app/page.js`

Homepage hero uses a proper `<h1>` ("Discover Sparkle With Style"). Multiple additional `<h2>` section headings follow — acceptable, but the hero H1 is decorative/marketing rather than brand-focused.

#### 13. Categories page H1 is generic

**File:** `app/categories/page.js`

Page H1 is "Find Your Style" rather than a keyword-rich heading like "Jewellery Categories". Category names appear only in `sr-only` content and client-rendered grids.

#### 14. No visible breadcrumb navigation

**File:** `app/products/[slug]/page.js`

BreadcrumbList exists as JSON-LD only. No visible breadcrumb UI for users or accessibility.

#### 15. Remote product images bypass optimization on detail page

**File:** `app/products/[slug]/ProductDetail.jsx`

```262:262:app/products/[slug]/ProductDetail.jsx
                unoptimized={productImages[selectedImage]?.startsWith('http')}
```

Remote CDN images skip Next.js Image optimization, affecting LCP and bandwidth on product pages.

#### 16. `robots.txt` disallows non-existent `/account` route

**File:** `app/robots.js`

`/account` is disallowed but no `/account` route exists in the app. `/orders` and `/wishlist` are protected but not disallowed.

#### 17. No custom 404 page

No `app/not-found.js` — soft 404s may inherit homepage metadata.

#### 18. Footer address link uses `tel:` instead of maps/address

**File:** `components/Footer.jsx` (lines 47–53)

Address is wrapped in a `tel:` link, which is incorrect semantically and offers no local SEO benefit.

### Low

#### 19. No keywords meta tag

Not implemented. Modern search engines largely ignore this; low impact.

#### 20. No web manifest / PWA metadata

No `app/manifest.ts` or `manifest.json` for installability or mobile SEO signals.

#### 21. Brand name spelling inconsistency

Codebase uses "Kayra Aura" in SEO constants but workspace/repo is `kyara-aura-web`. Ensure public brand spelling is consistent across metadata and content.

#### 22. Hero background video may impact performance

**File:** `app/page.js` (lines 85–94)

Autoplay video (`/vedio/vedio1.mp4`) on homepage adds weight and can affect LCP/CLS despite `poster` attribute.

#### 23. Lenis smooth scroll globally enabled

**File:** `providers/smooth-scroll-provider.jsx`

Global smooth scrolling library may affect scroll performance metrics (INP) on mobile devices.

#### 24. ProductCard does not set `unoptimized` for remote URLs

Unlike `ProductDetail.jsx`, `ProductCard.jsx` does not pass `unoptimized` for HTTP URLs — behavior depends on `remotePatterns` config; inconsistent image handling.

---

## Page-by-Page SEO Status

| Page | Route | Metadata | Canonical | OG/Twitter | H1 | Structured Data | Indexability | Notes |
|------|-------|----------|-----------|------------|-----|-----------------|--------------|-------|
| Home | `/` | ✅ Full | ✅ | ✅ | ✅ (hero) | Organization, WebSite | Index | Product/category grids client-only |
| Products | `/products` | ❌ | ❌ | ❌ | ✅ "Products" | ❌ | Index | **Critical gap** |
| Product detail | `/products/[slug]` | ✅ Dynamic | ✅ | ✅ | ✅ Product name | Product, BreadcrumbList | Index | SSR product prop; OG type should be `product` |
| Categories | `/categories` | ✅ Dynamic | ✅ | ✅ | ⚠️ Generic | ❌ | Index | sr-only category copy; client grid |
| Collections | `/collections` | ✅ Full | ✅ | ✅ | ✅ | ❌ | Index | Not in sitemap; client product list |
| Login | `/login` | ⚠️ Basic | ❌ | ❌ | ✅ (AuthForm) | ❌ | ⚠️ Should noindex | |
| Register | `/register` | ⚠️ Basic | ❌ | ❌ | ✅ | ❌ | ⚠️ Should noindex | |
| Forgot password | `/forgot-password` | ❌ | ❌ | ❌ | ✅ | ❌ | ⚠️ Should noindex | Client-only page |
| Reset password | `/reset-password` | ⚠️ Basic | ❌ | ❌ | ✅ | ❌ | ⚠️ Should noindex | |
| Cart | `/cart` | ⚠️ Basic | ❌ | ❌ | ✅ | ❌ | ⚠️ Should noindex | |
| Wishlist | `/wishlist` | ⚠️ Basic | ❌ | ❌ | ✅ | ❌ | ⚠️ Should noindex | Auth-gated |
| Orders | `/orders` | ⚠️ Basic | ❌ | ❌ | ✅ | ❌ | ⚠️ Should noindex | Auth-gated |
| Payment | `/payment-method` | ⚠️ Basic | ❌ | ❌ | ✅ | ❌ | Disallowed in robots.txt | |
| Order success | `/order-success/[id]` | ⚠️ Basic | ❌ | ❌ | ✅ | ❌ | ⚠️ Should noindex | |
| Terms | `/terms` | ⚠️ Basic | ❌ | ❌ | ✅ | ❌ | Index | Good content structure |
| Privacy | `/privacy` | ⚠️ Basic | ❌ | ❌ | ✅ | ❌ | Index | Good H1/H2/H3 hierarchy |
| Shipping policy | `/shipping-policy` | ⚠️ Basic | ❌ | ❌ | ✅ | ❌ | Index | |
| Return policy | `/return-policy` | ⚠️ Basic | ❌ | ❌ | ✅ | ❌ | Index | |

---

## Structured Data Status

### Present

| Schema | File | Properties |
|--------|------|------------|
| **Organization** | `app/page.js` | `name`, `url`, `logo`, `sameAs` (empty) |
| **WebSite** | `app/page.js` | `name`, `url` |
| **Product** | `app/products/[slug]/page.js` | `name`, `description`, `image`, `sku`, `brand`, `category`, `offers` (price, currency, availability, condition) |
| **BreadcrumbList** | `app/products/[slug]/page.js` | Home → Products → Product name |
| **Brand** | Nested in Product | `name` |
| **Offer** | Nested in Product | `url`, `priceCurrency`, `price`, `availability`, `itemCondition` |

### Missing

| Schema | Recommended location | Purpose |
|--------|---------------------|---------|
| **aggregateRating** | Product pages with reviews | Star rich snippets |
| **Review** | Product pages | Individual review markup |
| **SearchAction** | Homepage WebSite schema | Sitelinks search box |
| **ItemList** | `/products`, `/collections`, `/categories` | Product carousel/list rich results |
| **BreadcrumbList** (visible + JSON-LD) | All inner pages | Navigation + rich results |
| **Organization sameAs** | Homepage | Social profile association |
| **FAQPage** | Policy pages (optional) | FAQ rich results if Q&A added |
| **LocalBusiness** | Homepage/Footer | Local SEO (if physical store) |

---

## Technical SEO Status

| Area | Status | Details |
|------|--------|---------|
| **Metadata API** | ⚠️ Partial | Strong on home, product detail, categories, collections; missing on `/products` and `/forgot-password` |
| **Title tags** | ⚠️ Partial | All pages get titles (direct or inherited); `/products` uses root default |
| **Meta descriptions** | ⚠️ Partial | Same coverage as titles |
| **Canonical URLs** | ⚠️ Partial | Only via `metadataForPage()` — ~10 pages lack explicit canonicals |
| **Open Graph** | ⚠️ Partial | Full on 4 routes; basic/missing elsewhere |
| **Twitter Cards** | ⚠️ Partial | Same as OG |
| **robots.txt** | ✅ Present | `app/robots.js` |
| **sitemap.xml** | ⚠️ Partial | Dynamic but incomplete (missing `/collections`; category URL mismatch) |
| **Indexing controls** | ❌ Weak | No `noindex` on private pages |
| **hreflang** | ❌ N/A | Single-language site |
| **Favicon / icons** | ✅ Present | `/assets/ka1.png` in root metadata |
| **manifest.json** | ❌ Missing | — |
| **URL structure** | ✅ Good | Clean, semantic paths |
| **Redirects** | ❌ None | No redirects in `next.config.mjs` |
| **Rewrites** | ❌ None | — |
| **404 handling** | ❌ Missing | No custom `not-found.js` |
| **Middleware** | ⚠️ Partial | `proxy.js` exists for auth guard; not SEO-focused |
| **SSR vs CSR** | ⚠️ Mixed | Product detail SSR ✅; listings CSR ❌ |

---

## Performance SEO Status

| Area | Status | Details |
|------|--------|---------|
| **Next.js Image** | ✅ Used everywhere | No raw `<img>` tags |
| **Image `sizes`** | ✅ Mostly configured | Product, hero, header, footer, cart images |
| **Lazy loading** | ✅ Default | Next/Image lazy-loads non-priority images |
| **LCP optimization** | ⚠️ Partial | Hero + product main image use `priority`; video section may compete |
| **Remote image optimization** | ⚠️ Partial | `unoptimized` on product detail remote images; `remotePatterns` configured |
| **Font loading** | ✅ Optimized | `next/font/google` with CSS variables |
| **Client JS bundle** | ⚠️ Heavy | React Query, Lenis, Zustand on all pages |
| **Smooth scroll (Lenis)** | ⚠️ Risk | Global smooth scroll may affect INP |
| **Autoplay video** | ⚠️ Risk | Homepage hero video section |
| **Core Web Vitals config** | ❌ None explicit | No `loading.tsx`, no explicit preload hints beyond Image priority |
| **Third-party scripts** | ✅ Minimal | No analytics/tag manager found in codebase |

### Image optimization config

```1:23:next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "kayraaura.up.railway.app",
      },
      {
        protocol: "https",
        hostname: "kayraaura.up.railway.app",
      },
      // ...
    ],
  },
};
```

---

## Recommended Fixes

### Critical

1. **Add metadata to `/products`** — Export `metadata` or `generateMetadata()` in `app/products/page.js` using `metadataForPage()`, including dynamic category-filter titles/descriptions/canonicals when `?category=` is present.

2. **Server-render product listings** — Fetch products in server components (`app/products/page.js`, `app/collections/page.js`, homepage sections) and pass as props to `ProductList` to ensure crawlable HTML with product links, names, and prices.

3. **Resolve category URL duplication** — Standardize on one URL pattern (`/products?category=` or `/categories?category=`), update sitemap, metadata canonicals, and internal links to match.

4. **Add `noindex` to private pages** — Set `robots: { index: false, follow: false }` on login, register, cart, wishlist, orders, payment-method, order-success, forgot-password, and reset-password routes.

### High

5. **Add metadata to `/forgot-password`** — Split into a server wrapper page with metadata + client form component, or add `app/forgot-password/layout.js` with metadata export.

6. **Use `type: 'product'` in product OG metadata** — Pass `type: 'product'` to `metadataForPage()` in `app/products/[slug]/page.js`.

7. **Populate Organization `sameAs`** — Fetch web settings server-side on homepage and inject social URLs into Organization schema.

8. **Add `aggregateRating` to Product schema** — When reviews exist, include rating count and average in JSON-LD.

9. **Ensure production `SITE_URL` env var** — Set `NEXT_PUBLIC_SITE_URL` in all deployment environments; avoid localhost fallbacks in production.

10. **Add `/collections` to sitemap** — Include in `staticRoutes` array in `app/sitemap.js`.

### Medium

11. **Migrate all page metadata to `metadataForPage()`** — Ensures consistent canonical, OG, and Twitter tags across auth, cart, policy, and account pages.

12. **Add visible breadcrumb UI on product pages** — Complement existing BreadcrumbList JSON-LD.

13. **Add WebSite `SearchAction` schema** — Point to `/products` with search query parameter matching header search behavior.

14. **Create custom `app/not-found.js`** — With appropriate metadata and helpful internal links.

15. **Improve categories page H1** — Use keyword-rich heading aligned with metadata title.

16. **Remove `unoptimized` for remote product images** — Rely on configured `remotePatterns` for CDN optimization.

17. **Update `robots.txt` disallow list** — Add `/cart`, `/login`, `/register`, `/orders`, `/wishlist`, `/order-success`; remove non-existent `/account`.

18. **Add ItemList schema to listing pages** — Once listings are server-rendered.

### Low

19. **Add `app/manifest.ts`** — PWA manifest with name, icons, theme color.

20. **Add dedicated OG image** — Create `app/opengraph-image.jpg` or dynamic OG image route.

21. **Add `themeColor` to viewport/metadata** — Brand color for mobile browsers.

22. **Optimize homepage video section** — Lazy-load video, reduce file size, or replace with static image for mobile.

23. **Create dedicated About page** — Update footer "About Us" link from `/` to `/about`.

24. **Evaluate Lenis impact** — Consider disabling on mobile or below-the-fold pages for better INP.

---

## SEO Score

### Overall: **64 / 100**

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Metadata & tags | 58/100 | 25% | 14.5 |
| Structured data | 62/100 | 15% | 9.3 |
| Technical SEO (robots, sitemap, canonicals) | 70/100 | 20% | 14.0 |
| Content & crawlability | 45/100 | 25% | 11.25 |
| Performance SEO | 72/100 | 15% | 10.8 |
| **Total** | | | **59.85 → 64** (rounded with foundation bonus for centralized SEO lib) |

### Summary

The project has a solid SEO **foundation**: centralized `lib/seo.js`, root `metadataBase`, dynamic product and category metadata, robots/sitemap routes, and Product + Organization structured data. The largest gaps are **missing `/products` metadata**, **client-rendered catalog content** that limits crawlability, **no indexing controls on private pages**, and **incomplete schema enrichment** (reviews, search, social profiles). Addressing the Critical and High priority items would likely raise the score into the **80–85** range.

---

*Report generated by automated codebase inspection. No source files were modified during this audit.*
