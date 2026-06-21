# SEO Critical Fix Report

**Project:** Kayra Aura Web  
**Date:** June 21, 2026  
**Scope:** All Critical priority items from `SEO_AUDIT_REPORT.md`

---

## Summary

All four Critical SEO issues from the audit have been addressed:

1. Complete metadata added to `/products` (including dynamic category metadata)
2. Category URLs standardized on `/products?category={id}` across sitemap, canonicals, and internal links
3. `noindex` rules applied to private/transactional routes
4. Product and category listing content is server-fetched and included in initial HTML for crawlers

No UI design or business logic was changed. Existing client-side interactivity (filters, cart, wishlist, pagination) is preserved.

---

## Files Changed

| File | Change type |
|------|-------------|
| `lib/seo.js` | Modified |
| `lib/category-seo.js` | **New** |
| `lib/products.js` | Modified |
| `app/products/page.js` | Modified |
| `app/categories/page.js` | Modified |
| `app/collections/page.js` | Modified |
| `app/page.js` | Modified |
| `app/sitemap.js` | Modified |
| `app/login/page.js` | Modified |
| `app/register/page.js` | Modified |
| `app/reset-password/page.js` | Modified |
| `app/forgot-password/layout.js` | **New** |
| `app/cart/page.js` | Modified |
| `app/wishlist/page.js` | Modified |
| `app/orders/page.js` | Modified |
| `app/payment-method/page.js` | Modified |
| `app/order-success/[id]/page.js` | Modified |
| `components/ProductList.jsx` | Modified |
| `components/CategoryGrid.jsx` | Modified |
| `components/CategoryBrowser.jsx` | Modified |
| `components/HomeCollectionShowcase.jsx` | Modified |
| `components/ProductCategoryNav.jsx` | Modified |
| `components/CategoryDetail.jsx` | Modified |

**Total:** 22 files (2 new, 20 modified)

---

## SEO Improvements Applied

### 1. `/products` page metadata (Critical #1)

**File:** `app/products/page.js`

Added `generateMetadata()` using the shared `metadataForPage()` helper.

| Metadata field | `/products` | `/products?category={id}` |
|----------------|-------------|---------------------------|
| Title | `Shop Fashion Jewellery \| Kayra Aura` | `{Category Name} Jewellery \| Kayra Aura` |
| Description | Shop-wide jewellery description | Category-specific description |
| Canonical | `/products` | `/products?category={id}` |
| Open Graph | Full (title, description, url, images, siteName, type) | Full, with category image when available |
| Twitter Card | `summary_large_image` with title, description, images | Same |

**Before:** `/products` inherited root layout defaults — title pointed to homepage, canonical was `/`, OG URL was `/`.

**After:** `/products` has dedicated, indexable metadata aligned with page content. Category-filtered URLs receive dynamic metadata.

---

### 2. Category URL duplication resolved (Critical #3)

**Canonical structure chosen:** `/products?category={id}`

This matches existing internal navigation (`CategoryGrid`, `ProductCategoryNav`, `CategoryDetail`) and the product catalog filter behavior.

| Location | Before | After |
|----------|--------|-------|
| `app/sitemap.js` | `/categories?category={id}` | `/products?category={id}` |
| `app/categories/page.js` canonical (when `?category=` present) | `/categories?category={id}` | `/products?category={id}` |
| `components/CategoryGrid.jsx` | `/products?category={id}` | Unchanged (now via `categoryProductsPath()`) |
| `components/ProductCategoryNav.jsx` | `/products?category={id}` | Unchanged (now via `categoryProductsPath()`) |
| `components/CategoryDetail.jsx` | `/products?category={id}` | Unchanged (now via `categoryProductsPath()`) |

**New shared helper:** `lib/category-seo.js`
- `categoryProductsPath(categoryId)` — single source of truth for category product URLs
- `categorySeoDescription(category)` — shared description copy
- `findCategoryByParam()` / `getSelectedCategoryFromParams()` — shared category lookup for metadata

**Before:** Sitemap and category-page canonicals pointed to `/categories?category=`, while site navigation linked to `/products?category=`. Same intent, two URLs, duplicate content risk.

**After:** Sitemap, canonicals, and internal links all agree on `/products?category={id}` as the indexable category listing URL. `/categories` remains the category browse landing page with canonical `/categories`.

---

### 3. `noindex` on private/transactional pages (Critical #4)

**File:** `lib/seo.js` — added `noIndexMetadata()` helper and `noIndex` option to `metadataForPage()`.

Applies `robots: { index: false, follow: false }` (including `googleBot`) plus full metadata (canonical, OG, Twitter) per route.

| Route | File |
|-------|------|
| `/login` | `app/login/page.js` |
| `/register` | `app/register/page.js` |
| `/forgot-password` | `app/forgot-password/layout.js` (new server layout) |
| `/reset-password` | `app/reset-password/page.js` |
| `/cart` | `app/cart/page.js` |
| `/wishlist` | `app/wishlist/page.js` |
| `/orders` | `app/orders/page.js` |
| `/payment-method` | `app/payment-method/page.js` |
| `/order-success/[id]` | `app/order-success/[id]/page.js` |

**Before:** These pages had basic or no metadata and were crawlable/indexable. Only `/payment-method` was in `robots.txt` disallow.

**After:** Each route emits `<meta name="robots" content="noindex, nofollow">` via the Next.js Metadata API. Search engines are instructed not to index login, checkout, cart, or account pages.

---

### 4. Improved crawlability via server-rendered catalog data (Critical #2)

**Strategy:** Server components fetch product/category data and pass it to existing client components as React Query `initialData`. No UI changes — components render product cards immediately on first paint instead of a loading spinner.

#### Server data fetching added

| Page | Server fetch | Passed to |
|------|--------------|-----------|
| `/products` | `getAllProducts()` or `getProductsByCategory(categoryId)` | `ProductList` |
| `/` (homepage) | `getCategories()`, `getFeaturedProducts()`, `getCollectionProducts()` | `CategoryGrid`, `ProductList`, `HomeCollectionShowcase` |
| `/categories` | `getCategories()`, `getFeaturedProducts()` | `CategoryBrowser` → `CategoryGrid`, `ProductList` |
| `/collections` | `getCollectionProducts()` | `ProductList` |

#### Component updates

| Component | Change |
|-----------|--------|
| `ProductList` | Accepts `initialProducts`; passes as React Query `initialData`; skips loader when data is present |
| `CategoryGrid` | Accepts `initialCategories`; passes as React Query `initialData` |
| `CategoryBrowser` | Forwards `initialCategories` and `initialFeaturedProducts` |
| `HomeCollectionShowcase` | Accepts `initialProducts` |

#### New server function

`lib/products.js` — added `getCollectionProducts()` for server-side collection product fetching (mirrors existing `getAllProducts()` / `getFeaturedProducts()` pattern).

**Before:** Listing pages rendered `<LoaderBlock />` in initial HTML. Product names, links, and prices only appeared after client-side JavaScript executed and API calls completed.

**After:** Initial HTML includes rendered product cards with:
- Product names (`<h3>` with links to `/products/{slug}`)
- Prices (`₹{price}`)
- Category names and links (on homepage and categories page)
- Collection showcase links and prices

Client-side React Query still refetches on mount (`refetchOnMount: "always"`) so live data stays fresh without changing business logic.

---

## Before vs After Behavior

### `/products`

| Aspect | Before | After |
|--------|--------|-------|
| `<title>` | Homepage default | `Shop Fashion Jewellery \| Kayra Aura` |
| `<link rel="canonical">` | `https://…/` | `https://…/products` |
| OG `og:url` | Homepage URL | `/products` URL |
| Initial HTML body | Loading spinner | Product grid with names, links, prices |
| `?category=` metadata | None | Dynamic title, description, canonical, OG, Twitter |

### Category URLs

| Aspect | Before | After |
|--------|--------|-------|
| Sitemap category entries | `/categories?category=abc` | `/products?category=abc` |
| Category canonical (filtered) | `/categories?category=abc` | `/products?category=abc` |
| Nav links | `/products?category=abc` | `/products?category=abc` (unchanged, now centralized) |

### `/login` (representative private page)

| Aspect | Before | After |
|--------|--------|-------|
| `<meta name="robots">` | Absent (indexable) | `noindex, nofollow` |
| Canonical | Absent | `/login` |
| OG / Twitter | Absent | Present (with noindex) |

### Homepage product section

| Aspect | Before | After |
|--------|--------|-------|
| Initial HTML | `<LoaderBlock />` | 6 featured product cards with names, prices, links |
| Category strip | Loading spinner | 6 category cards with names and links |
| Collection showcase | Loading spinner | Featured + side products with names, prices, links |

---

## Verification

- `npm run build` completed successfully (Next.js 16.2.6)
- No UI class names, layout structure, or component markup changed
- No API routes, cart logic, auth flows, or filter behavior modified
- Client-side hydration and React Query refetch behavior preserved

---

## Not in Scope (Higher/Lower Audit Items)

The following were intentionally not changed (not Critical priority):

- Product OG `type: 'product'` on detail pages (High)
- Organization `sameAs` population (High)
- `/collections` sitemap entry (High)
- `robots.txt` disallow list expansion (Medium)
- Policy page metadata migration to `metadataForPage()` (Medium)
- Custom `not-found.js` (Medium)

---

*Report generated after implementing Critical SEO fixes. See `SEO_AUDIT_REPORT.md` for the full audit.*
