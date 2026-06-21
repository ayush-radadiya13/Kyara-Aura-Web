# SEO High Priority Report

**Project:** Kayra Aura Web  
**Date:** June 21, 2026  
**Scope:** Advanced SEO — structured data, Open Graph, sitemap, and collections metadata

---

## Summary

High-priority SEO enhancements are implemented across product detail pages, the homepage, the sitemap, and the collections page. JSON-LD schemas are centralized in a shared helper module. Product pages now emit full Product schema (with optional review/rating data), Organization and WebSite schemas include social profiles and site search, Open Graph uses `og:type=product` on product pages, and `/collections` is included in the sitemap with improved metadata.

No UI, styling, layout, or business logic was changed.

---

## Files Changed

| File | Change type |
|------|-------------|
| `lib/structured-data.js` | **New** — reusable JSON-LD builders (Organization, WebSite, Product, BreadcrumbList) |
| `lib/seo.js` | Modified — `og:type=product` support via metadata `other` field |
| `lib/web-settings.js` | Modified — server-side `getWebSettings()` for schema social links |
| `app/products/[slug]/page.js` | Modified — Product schema, review/rating schema, `og:type=product`, product OG image |
| `app/page.js` | Modified — Organization `sameAs`, WebSite `SearchAction` |
| `app/sitemap.js` | Modified — added `/collections` |
| `app/collections/page.js` | Modified — enhanced description and OG image |

**Total:** 1 new file, 6 modified files

---

## Schemas Added / Enhanced

### 1. Product Schema (`Product`) — all product detail pages

**Location:** `app/products/[slug]/page.js` via `buildProductSchema()` in `lib/structured-data.js`

| Field | Value / source |
|-------|----------------|
| `@type` | `Product` |
| `name` | `product.name` |
| `image` | All product images (absolute URLs), or placeholder |
| `description` | Product description (trimmed to 160 chars) |
| `sku` | `product.sku` → `_id` → `id` → `slug` |
| `brand` | `{ @type: Brand, name: "Kayra Aura" }` |
| `offers.@type` | `Offer` |
| `offers.price` | `product.price` |
| `offers.priceCurrency` | `INR` |
| `offers.availability` | `InStock` / `OutOfStock` (from size quantities) |
| `offers.url` | Canonical product URL |
| `offers.itemCondition` | `NewCondition` |

**Also retained:** `BreadcrumbList` (Home → Products → Product name)

### 2. AggregateRating + Review (conditional)

Added when `product.reviews` contains at least one review:

| Schema | Fields |
|--------|--------|
| `AggregateRating` | `ratingValue` (computed average), `reviewCount`, `bestRating: 5`, `worstRating: 1` |
| `Review[]` | `author` (Person), `reviewRating`, `reviewBody`, `datePublished` |

Average rating is computed server-side from the review array; no API or UI changes required.

### 3. Organization Schema

**Location:** `app/page.js` (homepage)

| Field | Value |
|-------|-------|
| `@type` | `Organization` |
| `name` | Kayra Aura |
| `url` | `https://kayraaura.com` |
| `logo` | Web settings logo or `/assets/ka1.png` |
| `sameAs` | Instagram, Facebook, YouTube, LinkedIn URLs from `api/web-settings` (WhatsApp excluded) |

### 4. WebSite + SearchAction Schema

**Location:** `app/page.js` (homepage)

| Field | Value |
|-------|-------|
| `@type` | `WebSite` |
| `name` | Kayra Aura |
| `url` | `https://kayraaura.com` |
| `potentialAction.@type` | `SearchAction` |
| `potentialAction.target.urlTemplate` | `{siteUrl}/products?search={search_term_string}` |
| `potentialAction.query-input` | `required name=search_term_string` |

---

## Open Graph Improvements

| Page | Change |
|------|--------|
| Product detail (`/products/[slug]`) | `og:type=product` (via metadata `other`) |
| Product detail | OG image = primary product image (fallback: placeholder) |
| Collections (`/collections`) | OG image = `/assets/home1.jpg`, enhanced description |

**Note:** Next.js OpenGraph types do not include `product`. The shared `metadataForPage()` helper omits the standard `openGraph.type` for product pages and emits `og:type=product` through the metadata `other` field to avoid duplicate conflicting tags.

---

## Collections Page & Sitemap

### Sitemap (`app/sitemap.js`)

- Added `/collections` to static routes (priority `0.7`, change frequency `weekly`)

### Collections metadata (`app/collections/page.js`)

| Field | Value |
|-------|-------|
| Title | `Jewellery Collections \| Kayra Aura` |
| Description | Curated collections copy with product types |
| Canonical | `/collections` |
| Open Graph | Full (title, description, url, images, siteName) |
| Twitter Card | `summary_large_image` |

---

## Validation Steps

### 1. Local production build

```bash
npm run build
npm run start
```

### 2. Product JSON-LD

1. Open any product URL, e.g. `/products/{slug}`
2. View page source (Ctrl+U)
3. Confirm `<script type="application/ld+json">` blocks contain:
   - `Product` with `brand`, `offers`, `priceCurrency: "INR"`
   - `BreadcrumbList`
   - If reviews exist: `aggregateRating` and `review` array

### 3. Homepage JSON-LD

1. Open `/`
2. View page source
3. Confirm:
   - `Organization` with populated `sameAs` (when web settings API returns social URLs)
   - `WebSite` with `SearchAction` and `urlTemplate` containing `{search_term_string}`

### 4. Google Rich Results Test

1. Visit [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Test a product URL with reviews → expect **Product** snippet validation
3. Test homepage → expect **Organization** and **Sitelinks search box** (WebSite + SearchAction)

### 5. Schema.org Validator

1. Visit [Schema Markup Validator](https://validator.schema.org/)
2. Paste product page URL or JSON-LD output
3. Confirm no errors on Product, Offer, AggregateRating, Review

### 6. Open Graph

1. Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) or similar
2. Test a product URL
3. Confirm `og:type` is `product` and image is the product photo

### 7. Sitemap

1. Open `/sitemap.xml`
2. Confirm `https://kayraaura.com/collections` (or your configured site URL) is listed
3. Submit sitemap in Google Search Console if not already done

### 8. Collections metadata

1. Open `/collections`
2. Inspect `<head>` for canonical, OG tags, and Twitter card
3. Confirm title and description match the collections page content

---

## Rich Results Eligibility

| Rich result type | Page | Eligibility | Notes |
|------------------|------|-------------|-------|
| **Product snippets** | `/products/[slug]` | Eligible | Product + Offer with price, currency, availability |
| **Product review stars** | `/products/[slug]` (with reviews) | Eligible when reviews exist | Requires visible review content on page (already present) + valid `aggregateRating` |
| **Merchant listing** | `/products/[slug]` | Partially eligible | Price and availability present; add `sku` from API and `priceValidUntil` in a future pass for full Merchant Center alignment |
| **Organization** | `/` | Eligible | Name, url, logo; `sameAs` populated from live web settings |
| **Sitelinks search box** | `/` | Eligible | WebSite + SearchAction schema present |
| **Breadcrumbs** | `/products/[slug]` | Eligible (JSON-LD) | BreadcrumbList schema present; visible breadcrumb UI not added (out of scope) |
| **Collections** | `/collections` | Standard indexing | In sitemap with full metadata; no ItemList schema added in this pass |

### Requirements for Google review stars

Google may show review stars in search when:

1. The page has valid `Product` + `AggregateRating` JSON-LD
2. Review content is visible on the page (Kayra Aura product pages show reviews)
3. `reviewCount` matches visible reviews
4. Ratings are genuine user-submitted data from the API

Products without reviews still qualify for basic Product rich results (price, availability) but not star ratings.

---

## Environment Recommendations

Set the production site URL so canonical, OG, and schema URLs resolve correctly:

```env
NEXT_PUBLIC_SITE_URL=https://kayraaura.com
```

Social `sameAs` links are fetched server-side from `NEXT_PUBLIC_API_BASE` / `NEXT_PUBLIC_API_URL` at build/request time via `api/web-settings`.

---

## Out of Scope (Not Modified)

- UI components and styling
- Root layout (`app/layout.js`)
- Cart, checkout, or review submission logic
- Visible breadcrumb navigation
- Policy page OG metadata migration
- `ItemList` schema on listing pages
- Dedicated search results page for `?search=` query handling
