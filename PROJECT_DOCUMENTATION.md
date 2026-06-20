# Project Documentation

## Project Overview

### Project Name

Kayra Aura Web

### Business Type

E-commerce storefront for fashion/imitation jewellery, with current policy content focused on gold plated bangles for women.

### Technology Stack

- Next.js 16.2.6 App Router
- React 19.2.4
- Tailwind CSS 4
- JavaScript and JSX
- TanStack React Query 5
- Zustand 5
- Axios
- Zod
- Lenis smooth scrolling
- shadcn-style component setup
- Base UI React
- Lucide React icons

### Purpose of the Application

The application provides a customer-facing jewellery storefront where users can browse products and categories, search products, view product details, manage wishlist and cart items, proceed through checkout, place Razorpay or cash-on-delivery orders, and review order history.

## Frontend Stack

### Next.js Version

- `next`: `16.2.6`
- App Router is used through the `app/` directory.
- Project rule notes that this Next.js version may have breaking API and convention changes compared with older versions.

### React Version

- `react`: `19.2.4`
- `react-dom`: `19.2.4`

### Tailwind CSS Usage

- `tailwindcss`: `^4`
- `@tailwindcss/postcss`: `^4`
- `app/globals.css` imports Tailwind through `@import "tailwindcss";`.
- `tailwind.config.js` scans `app/**/*.{js,jsx}`, `components/**/*.{js,jsx}`, and legacy `src/**` paths.
- Styling is primarily utility-class based with some global custom classes.

### Shadcn UI Components

- `components.json` configures a shadcn-style setup:
  - Style: `base-nova`
  - RSC: enabled
  - TSX: disabled
  - CSS variables: enabled
  - Icon library: `lucide`
  - UI alias: `@/components/ui`
- Existing UI components:
  - `components/ui/button.jsx`
  - `components/ui/loader.jsx`

### Animation Libraries

- `lenis` is installed and used globally through `providers/smooth-scroll-provider.jsx`.
- `tw-animate-css` is installed.
- Custom CSS keyframes are defined in `app/globals.css`.
- No Framer Motion, GSAP, or AOS usage was found.

### State Management

- Zustand is used for client state:
  - `store/auth-store.js` manages authenticated user, token, and hydration state.
  - `lib/cart/store.js` manages persisted cart items, cart total, and item count.
- React local state is used heavily inside page-level and component-level flows.

### Form Libraries

- No dedicated form state library such as React Hook Form or Formik was found.
- Zod is used for validation:
  - `validations/auth-validation.js`
  - `validations/build-auth-form-schema.js`

### Data Fetching Libraries

- TanStack React Query is used through `providers/query-provider.jsx`.
- Axios is used for API clients:
  - `customAxios` for token-authenticated requests
  - `withoutTokenApi` for public requests
- Native `fetch` is also used in `lib/products.js` and `lib/categories.js` with `cache: "no-store"`.

### Authentication Libraries

- No third-party authentication library such as NextAuth/Auth.js was found.
- Authentication is custom token-based auth:
  - Token is stored in `localStorage` under `token`.
  - Token is also mirrored to the `ka_web_token` cookie.
  - Axios sends `Authorization: Bearer <token>` on authenticated requests.
  - `proxy.js` enforces a limited set of route guards.

## Folder Structure

### `app/`

Next.js App Router directory. Contains route pages, root layout, and global CSS.

Major routes include home, products, categories, cart, wishlist, payment method, orders, order success, auth pages, and policy pages.

### `components/`

Reusable UI and feature components. Contains layout components, product/category displays, cart and checkout components, auth components, order components, wishlist components, and small UI primitives.

### `components/auth/`

Authentication UI components:

- Dynamic auth form
- Auth fields
- Split media/form layout
- Social auth button placeholders

### `components/cart/`

Cart and checkout flow components:

- Cart page shell
- Cart bag/list
- Cart drawer
- Login panel for checkout
- Checkout step indicator
- Payment and address flow

### `components/order/`

Order history and order confirmation UI.

### `components/ui/`

Small reusable UI primitives, currently button and loader components.

### `components/wishlist/`

Wishlist page UI.

### `hooks/`

React hooks for product, category, wishlist, auth session, auth mutations, profile loading, logout, and auth guard behavior.

### `hooks/auth/`

Authentication-specific hooks for login/register-related flows, profile, logout, forgot password, reset password, and email verification.

### `lib/`

Shared application utilities and domain helpers:

- Product normalization and server-side product fetching
- Category normalization and server-side category fetching
- Route constants
- Auth field helpers
- Cart store
- General utility helpers

### `lib/routes/`

Central route constants for app routes and backend API endpoints.

### `providers/`

Global React providers:

- TanStack Query provider
- Lenis smooth-scroll provider

### `services/`

API service modules for auth, products, categories, cart, wishlist, checkout, addresses, and orders.

### `services/auth/`

Dedicated auth API modules for login, register, profile, logout, forgot password, reset password, and email verification.

### `store/`

Global persisted auth store.

### `utils/`

Shared client utility modules:

- Axios API clients
- API error extraction
- Auth response normalization
- Token and cookie management

### `validations/`

Zod schemas and dynamic auth-form validation helpers.

### `public/`

Static assets:

- Images
- SVG icons
- Homepage assets
- Video assets under `public/vedio/`

### Root Configuration Files

- `package.json`: scripts and dependencies
- `next.config.mjs`: Next image remote patterns
- `tailwind.config.js`: Tailwind content paths and theme extensions
- `postcss.config.mjs`: PostCSS setup
- `eslint.config.mjs`: ESLint setup
- `components.json`: shadcn-style UI configuration
- `jsconfig.json`: path alias configuration
- `proxy.js`: route guard logic

## Routing Structure

### Public Routes

- `/`: home page
- `/categories`: category browser
- `/products`: product listing, supports `?category=`
- `/products/[slug]`: product detail page
- `/cart`: cart page route, with authenticated cart API usage where token exists
- `/forgot-password`: forgot password form
- `/terms`: terms and conditions
- `/privacy`: privacy policy
- `/shipping-policy`: shipping policy
- `/return-policy`: return and refund policy
- `/order-success/[id]`: order confirmation route, but it fetches order data through authenticated API calls

### Protected Routes

Middleware protection in `proxy.js` currently applies only to:

- `/wishlist`
- `/account`
- `/account/:path*`

The `/account` app route does not currently exist.

Client-side auth gating also appears in:

- `/wishlist`
- `/orders`
- `/payment-method`
- Product-level wishlist actions
- Cart and checkout API operations

### Product Routes

- `/products`: catalog route
- `/products?category=<categoryId>`: filtered catalog route
- `/products/[slug]`: product detail route

### Category Routes

- `/categories`: category browser route
- `/products?category=<categoryId>`: products filtered by category

No `/categories/[slug]` route file was found, even though category detail helpers and a `CategoryDetail` component exist.

### Checkout Routes

- `/cart`: cart review route
- `/payment-method`: checkout/payment route for cart checkout
- `/payment-method?checkout_type=buy_now&product_size_id=<id>&quantity=<qty>`: buy-now checkout route
- `/order-success/[id]`: order confirmation route
- `/orders`: order history route

### Authentication Routes

- `/login`: login route, guest-only through `proxy.js`
- `/register`: registration route, guest-only through `proxy.js`
- `/forgot-password`: forgot password route

Route constants also reference:

- `/reset-password`
- `/verify-email`

No matching `app/reset-password/page.js` or `app/verify-email/page.js` route files were found.

## Components

### Shared Components

- `components/ui/button.jsx`: Base UI button wrapper with local styling.
- `components/ui/loader.jsx`: loading indicators.
- `components/WishlistButton.jsx`: authenticated product wishlist toggle.
- `components/BuyNowModal.jsx`: reusable size and quantity modal for buy-now flow.
- `components/StorefrontOffers.jsx`: storefront offer card display.
- `components/HeroSaleBanner.jsx`: sale banner for featured promotional product.

### Layout Components

- `app/layout.js`: root layout with fonts, query provider, smooth scroll provider, and conditional footer.
- `components/Header.jsx`: main navigation, search, cart, wishlist, and account actions.
- `components/Footer.jsx`: footer content and policy/support links.
- `components/ConditionalFooter.jsx`: hides footer on selected auth pages.
- `providers/query-provider.jsx`: React Query provider and devtools.
- `providers/smooth-scroll-provider.jsx`: global Lenis provider.

### Product Components

- `components/ProductCard.jsx`: product tile for grids and listings.
- `components/ProductList.jsx`: product query and responsive product grid.
- `components/ProductCategoryNav.jsx`: horizontal category navigation for products.
- `components/HeroCarousel.jsx`: homepage hero carousel.
- `components/HeroSaleBanner.jsx`: promotional product banner.
- `app/products/[slug]/ProductDetail.jsx`: product gallery, size selection, add to cart, buy now, details, and related products.

### Category Components

- `components/CategoryGrid.jsx`: category grid or strip component.
- `components/CategoryBrowser.jsx`: category selection plus product list.
- `components/CategoryDetail.jsx`: category detail view component, but no current route maps to it.

### Cart Components

- `components/cart/CartCheckout.jsx`: cart route shell and summary.
- `components/cart/CartBag.jsx`: cart item list, quantity update, item removal, and cart clearing.
- `components/cart/CartDrawer.jsx`: mini cart drawer.
- `components/cart/CartLoginPanel.jsx`: embedded login prompt for checkout.

### Checkout Components

- `components/cart/PaymentMethodFlow.jsx`: checkout intent, address management, summary, payment method selection, order creation, and Razorpay verification.
- `components/cart/CheckoutSteps.jsx`: checkout progress indicator.

### Authentication Components

- `components/auth/AuthForm.jsx`: dynamic login/register form.
- `components/auth/AuthField.jsx`: dynamic field renderer.
- `components/auth/AuthSplitLayout.jsx`: auth page layout with video/media side.
- `components/auth/SocialAuthButtons.jsx`: visual social auth buttons; service wiring was not found.

### Order Components

- `components/order/MyOrders.jsx`: order list, details, cancellation, and return actions.
- `components/order/OrderSuccess.jsx`: order confirmation details.

### Wishlist Components

- `components/wishlist/WishlistPage.jsx`: wishlist listing, remove, and clear actions.
- `components/WishlistButton.jsx`: product-level wishlist toggle.

## Design System

### Fonts

- `Geist` is loaded globally as `--font-geist-sans`.
- `Geist_Mono` is loaded globally as `--font-geist-mono`.
- Tailwind `font-display` maps to `Georgia`, `Cambria`, and `serif`.
- Tailwind `font-sans` maps to `system-ui`, `Segoe UI`, and `sans-serif`.
- `app/categories/page.js` loads `Cormorant_Garamond` for the category page heading.

### Colors

Global CSS variables in `app/globals.css`:

- Primary: `#6aab8e`
- Primary foreground: `#ffffff`
- Ring: `#6aab8e`
- Border: `#e5e7eb`
- Background: `#ffffff`
- Foreground: `#111827`
- Muted: `#f3f4f6`
- Muted foreground: `#6b7280`

Tailwind theme extensions in `tailwind.config.js`:

- Gold: `#d4a373`
- Gold light: `#e8c9a8`
- Gold dark: `#c58b2b`
- Purple: `#7B61FF`
- Purple light: `#9b85ff`
- Purple dark: `#5c47cc`
- Cream: `#2a2a2a`
- Cream muted: `#666666`

The codebase also uses many direct Tailwind grays and arbitrary hex/background values such as `bg-[#fbfaf7]`.

### Typography

- Large editorial serif headings use `font-display`, light weights, uppercase text, and tight letter spacing.
- Body and UI text use Tailwind size utilities such as `text-xs`, `text-sm`, `text-base`, `text-lg`, and responsive heading scales.
- Microcopy often uses uppercase tracking utilities like `tracking-[0.36em]` and `tracking-[0.45em]`.
- Some non-standard Tailwind class names appear, including `text-md` and `text-ms`.

### Spacing System

- Tailwind spacing utilities are used throughout.
- Common layout patterns:
  - `max-w-7xl`
  - `max-w-6xl`
  - `px-4 sm:px-6`
  - `py-10`, `py-12`, `py-14`, `pb-20`, `lg:py-16`
  - Grid gaps using `gap-4`, `gap-6`, and larger responsive gaps
- Some arbitrary layout utilities are used for editorial spacing and tracking.
- `max-w-8xl` appears in source and is not part of the default Tailwind scale unless added by generated/custom utilities.

### Component Styling Patterns

- Utility-first component styling with Tailwind classes.
- Global reusable classes:
  - `.glass`
  - `.header-glass`
  - `.header-menu-glass`
  - `.header-menu-dropdown`
  - `.glass-card`
  - `.btn-gold`
  - `.home-reveal`
  - `.home-scale-in`
  - `.home-scroll-stable`
  - `.home-drift`
  - `.home-shine`
  - `.hero-sale-enter`
  - `.hero-sale-img`
  - `.coupon-scallop`
  - `.coupon-scallop-bottom`
- Styling patterns include glassmorphism headers/cards, editorial serif headings, subtle hover transforms, and white/green/gold accents.

### Animations

Custom keyframes in `app/globals.css`:

- `home-fade-lift`
- `home-soft-scale`
- `home-fade-in`
- `home-drift`
- `home-shimmer`
- `hero-sale-fade-in`
- `hero-sale-image-zoom`

Reduced motion support exists for the custom home and hero sale animation classes.

### Responsive Breakpoints

Standard Tailwind breakpoints are used:

- `sm`
- `md`
- `lg`

Responsive patterns include:

- Product/category grids scaling from 2 columns to 3, 4, 5, or 6 columns.
- Mobile-first padding with larger `sm` and `lg` padding.
- Hidden or alternate desktop/mobile UI sections using breakpoint classes.

## API Integration

### API Client Configuration

API base URL is resolved from:

1. `NEXT_PUBLIC_API_URL`
2. `NEXT_PUBLIC_API_BASE`
3. `https://kayraaura.up.railway.app`

Authenticated requests use `customAxios`:

- Base URL: resolved API base
- Timeout: 15000 ms
- Header: `Content-Type: application/json`
- Adds `Authorization: Bearer <token>` when a token exists
- Redirects to `/login` on non-auth 401 responses

Public requests use `withoutTokenApi` with the same base URL, timeout, and content type.

### Authentication Endpoints

#### `POST api/auth/login`

- Auth required: no
- Used by: login form
- Payload: dynamic login fields, typically `email`, `password`, and optional `remember`
- Response shape: token can be read from `data.token`, `data.access_token`, `token`, or `access_token`; user can be read from `data.user`, `user`, or `profile`

#### `POST api/auth/register`

- Auth required: no
- Used by: register form
- Payload: dynamic register fields, typically `name`, `email`, `password`, `password_confirmation`, and `phone`
- Response shape: same token/user extraction as login

#### `GET api/auth/profile`

- Auth required: yes
- Used by: profile/auth session hooks
- Response shape: profile can be read from `data.user`, `data`, `user`, or the root payload

#### `POST api/auth/logout`

- Auth required: yes
- Used by: logout flow
- Response shape: raw backend response; client clears auth state regardless

#### `POST api/auth/forgot-password`

- Auth required: no
- Payload: `email`
- Response shape: UI reads `message` if present

#### `POST api/auth/reset-password`

- Auth required: no
- Payload: `token`, optional `email`, `password`, `password_confirmation`
- Response shape: raw backend response

#### `POST api/auth/verify-email`

- Auth required: no
- Payload: `token`, optional `email`
- Response shape: raw backend response

#### `GET /auth/login/fields`

- Auth required: no
- Used by: dynamic login field loading
- Response shape: array or object keys; falls back to defaults/environment if unavailable

#### `GET /auth/register/fields`

- Auth required: no
- Used by: dynamic registration field loading
- Response shape: array or object keys; falls back to defaults/environment if unavailable

### Category Endpoints

#### `GET api/categories`

- Auth required: no
- Response shape: `data` array
- Normalization: inactive categories where `is_active === false` are filtered out; `_id` and `image` are normalized

#### `GET api/categories/{slug}`

- Auth required: no
- Response shape: `data` object
- Normalization: inactive or missing category returns `null`

### Product Endpoints

#### `GET api/products`

- Auth required: no
- Response shape: product array may be read from `data`, `data.data`, `data.products`, `data.items`, `products`, or `items`

#### `GET api/products/featured`

- Auth required: no
- Response shape: same product array shapes as product list

#### `GET api/products/category/{categoryId}`

- Auth required: no
- Response shape: same product array shapes as product list

#### `GET api/products/name-search?name=<query>`

- Auth required: no
- Response shape: same product array shapes as product list

#### `GET api/products/{slug}`

- Auth required: no
- Response shape: `data` product object
- Inactive product where `data.is_active === false` returns `null`

### Cart Endpoints

All cart endpoints use authenticated `customAxios`.

#### `GET api/cart`

- Auth required: yes
- Response shape: cart can be read from `data` or root payload
- Normalized response: `{ items, total, itemCount }`

#### `POST api/cart/add`

- Auth required: yes
- Payload: `{ product_size_id, quantity }`
- Response shape: raw backend response

#### `DELETE api/cart/remove/{itemId}`

- Auth required: yes
- Response shape: raw backend response

#### `DELETE api/cart/clear`

- Auth required: yes
- Response shape: raw backend response

#### `PUT api/cart/update-quantity`

- Auth required: yes
- Payload: product size and quantity data, with code expecting `product_size_id` and `quantity`
- Response shape: raw backend response

### Wishlist Endpoints

All wishlist endpoints use authenticated `customAxios`.

#### `GET api/wishlist`

- Auth required: yes
- Response shape: array can be read from root array, `data`, `data.data`, `data.items`, `data.wishlist`, `data.wishlist_items`, `items`, or `wishlist`
- Normalized response: wishlist items with `id`, `wishlistItemId`, `productId`, `product`, and `raw`

#### `POST api/wishlist`

- Auth required: yes
- Payload: `{ product_id }`
- Response shape: raw backend response; UI looks for new wishlist id at `data.id`, `data._id`, `id`, or `_id`

#### `GET api/wishlist/{wishlistId}`

- Auth required: yes
- Response shape: raw backend response

#### `PUT api/wishlist/{wishlistId}`

- Auth required: yes
- Payload: `{ product_id }`
- Response shape: raw backend response

#### `DELETE api/wishlist/{wishlistId}`

- Auth required: yes
- Response shape: raw backend response

#### `DELETE api/wishlist/clear`

- Auth required: yes
- Response shape: raw backend response

### Address Endpoints

All address endpoints use authenticated `customAxios`.

#### `GET api/addresses`

- Auth required: yes
- Response shape: `response.data.data` or `response.data`

#### `POST api/addresses`

- Auth required: yes
- Payload: address fields
- Response shape: `response.data.data` or `response.data`

#### `PUT api/addresses/{addressId}`

- Auth required: yes
- Payload: address fields
- Response shape: `response.data.data` or `response.data`

#### `DELETE api/addresses/{addressId}`

- Auth required: yes
- Response shape: `response.data.data` or `response.data`

#### `POST api/addresses/{addressId}/default`

- Auth required: yes
- Response shape: `response.data.data` or `response.data`

### Checkout and Order Endpoints

All checkout and order endpoints use authenticated `customAxios`.

#### `POST api/checkout/summary`

- Auth required: yes
- Payload:
  - Cart checkout: `{ checkout_type: "cart" }`
  - Buy-now checkout: `{ checkout_type: "buy_now", product_size_id, quantity }`
- Response shape: summary object with `items`, `subtotal`, `tax_amount`, `shipping_amount`, `total_amount`, or `total`

#### `POST api/orders/create`

- Auth required: yes
- Payload: `checkout_type`, `address_id`, `payment_method`, optional `product_size_id`, `quantity`, and `notes`
- Response shape: expects `order.id`; online payment expects `razorpay` data

#### `POST api/razorpay/payment/verify`

- Auth required: yes
- Payload: `order_id`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`
- Response shape: verified order payload; UI uses order `id`

#### `GET api/orders`

- Auth required: yes
- Response shape: array or `{ data: [...] }`

#### `GET api/orders/{orderId}`

- Auth required: yes
- Response shape: order detail with order items, totals, payment status, and address fields

#### `POST api/orders/{orderId}/cancel`

- Auth required: yes
- Payload: cancellation data
- Response shape: `response.data.data` or `response.data`

#### `POST api/orders/{orderId}/return`

- Auth required: yes
- Payload: return request data
- Response shape: `response.data.data` or `response.data`

## Data Models

### Product Model

Inferred fields:

- `id`
- `_id`
- `slug`
- `name`
- `description`
- `short_description`
- `category`
- `images`
- `image`
- `image_url`
- `image_path`
- `product_images`
- `productImages`
- `gallery`
- `sizes`
- `price`
- `cover_price`
- `sale_price`
- `originalPrice`
- `oldPrice`
- `original_price`
- `discount`
- `discount_percentage`
- `is_active`
- `brand`
- `base_material`
- `plating`
- `gemstone`
- `design`
- `occasion`
- `ideal_for`
- `package_contents`
- `specs`

Normalized product fields:

- `_id`: string version of `id` or `_id`
- `slug`: product slug or fallback id
- `images`: sorted image URL list
- `image`: first normalized image
- `sizes`: normalized size list
- `price`: numeric active price
- `originalPrice`: original or derived price
- `oldPrice`: alias of original price
- `discount`: numeric discount
- `gallery`: up to four gallery images
- `specs`: product specs or default jewellery specs

Nested size fields:

- `id`
- `_id`
- `value`
- `label`
- `size_text`
- `size`
- `price`
- `quantity`

Nested image fields:

- String URL
- `image_url`
- `image_path`
- `is_primary`
- `sort_order`

### Category Model

Inferred fields:

- `id`
- `_id`
- `slug`
- `name`
- `description`
- `image`
- `image_url`
- `is_active`
- `children`

Normalized category fields:

- `_id`: string version of `id` or `_id`
- `image`: `image_url` or `image`

Child category fields:

- `id`
- `_id`
- `slug`
- `name`

### User Model

Inferred auth state fields:

- `user`
- `token`
- `isAuthenticated`
- `isHydrated`

Login payload fields:

- `email`
- `password`
- `remember`

Register payload fields:

- `name`
- `email`
- `password`
- `password_confirmation`
- `phone`

Forgot password payload:

- `email`

Reset password payload:

- `token`
- `email`
- `password`
- `password_confirmation`

Verify email payload:

- `token`
- `email`

Profile extraction supports:

- `data.user`
- `data`
- `user`
- root object

### Cart Model

Normalized cart fields:

- `items`
- `total`
- `itemCount`

Normalized cart item fields:

- `id`
- `cartItemId`
- `slug`
- `title`
- `image`
- `size`
- `sizeLabel`
- `quantity`
- `price`
- `originalPrice`
- `subtotal`
- `productId`
- `productSizeId`
- `categoryId`
- `raw`

Raw cart item fields inferred from normalization:

- `id`
- `product`
- `product_size`
- `product_id`
- `product_size_id`
- `size_text`
- `size_price`
- `quantity`
- `subtotal`

Persisted cart storage key:

- `kayra-cart`

### Order Model

Address fields:

- `id`
- `name`
- `email`
- `phone`
- `address_line_1`
- `address_line_2`
- `city`
- `state`
- `postal_code`
- `country`
- `landmark`
- `address_type`
- `is_default`

Checkout intent fields:

- `checkout_type`
- `product_size_id`
- `quantity`

Order create payload fields:

- `checkout_type`
- `address_id`
- `payment_method`
- `product_size_id`
- `quantity`
- `notes`

Checkout summary fields:

- `items`
- `subtotal`
- `tax_amount`
- `shipping_amount`
- `total_amount`
- `total`

Summary item fields:

- `product_size_id`
- `productSizeId`
- `id`
- `product_name`
- `title`
- `product_slug`
- `slug`
- `size_text`
- `sizeLabel`
- `size`
- `quantity`
- `total`
- `image`

Order fields:

- `id`
- `order_number`
- `orderNumber`
- `status`
- `payment_status`
- `payment_method`
- `paymentMethod`
- `subtotal`
- `tax_amount`
- `shipping_amount`
- `total_amount`
- `order_date`
- `created_at`
- `createdAt`
- `estimated_delivery_date`
- `estimated_delivery`
- `delivery_date`
- `expected_delivery_date`
- `order_items`
- `orderItems`
- `items`
- `shipping_address`
- `delivery_address`
- `address`
- `billing_address`
- `card_last_four`
- `card_last4`
- `payment_last_four`

Order item fields:

- `id`
- `product_name`
- `product`
- `name`
- `quantity`
- `total`
- `subtotal`
- `total_amount`
- `price`
- `size_text`
- `product_size.size_text`
- `size`
- `color`
- `variant`
- image fields

Razorpay data fields:

- `key`
- `amount`
- `currency`
- `name`
- `description`
- `order_id`
- `prefill`
- `razorpay_order_id`
- `razorpay_payment_id`
- `razorpay_signature`

### Wishlist Model

Normalized wishlist item fields:

- `id`
- `wishlistItemId`
- `productId`
- `product`
- `raw`

Accepted wishlist payload shapes:

- Root array
- `data`
- `data.data`
- `data.items`
- `data.wishlist`
- `data.wishlist_items`
- `items`
- `wishlist`

Raw wishlist item fields:

- `id`
- `_id`
- `wishlist_id`
- `wishlistId`
- `product_id`
- `productId`
- `product`
- `product_data`
- `productDetail`
- `product_details`

## SEO Status

### Existing Metadata

Root metadata in `app/layout.js`:

- Title: `Kayra Aura Jewellery`
- Description: `Luxury jewellery storefront built with Next.js and Tailwind CSS.`

Page-level metadata found:

- `/login`: title and description
- `/register`: title and description
- `/cart`: title and description
- `/wishlist`: title and description
- `/orders`: title and description
- `/order-success/[id]`: title and description
- `/payment-method`: title and description
- `/terms`: title and description
- `/privacy`: title and description
- `/shipping-policy`: title and description
- `/return-policy`: title and description

No page-level metadata was found for:

- `/`
- `/products`
- `/products/[slug]`
- `/categories`
- `/forgot-password`

### Existing Schema

No JSON-LD or schema.org structured data was found.

### Existing Sitemap

No `sitemap.js`, `sitemap.xml`, or sitemap route was found.

### Existing Robots

No `robots.js` or `public/robots.txt` file was found.

### Existing Canonical URLs

No `metadataBase`, `alternates`, or canonical URL configuration was found.

### Existing Open Graph Tags

No `openGraph` metadata, Twitter metadata, OG image route, or static metadata image configuration was found.

## Performance Features

### Image Optimization

- `next/image` is used throughout the app.
- Remote image host patterns are configured for:
  - `kayraaura.up.railway.app`
  - `web-production-c0abc.up.railway.app`
- Some product, cart, and order images use `unoptimized`, which bypasses Next.js image optimization for those images.
- Fallback image: `/images/product-placeholder.svg`

### Lazy Loading

- Default `next/image` lazy loading applies where `priority` is not set.
- No explicit `next/dynamic` component lazy loading was found.

### Caching

- TanStack Query global defaults:
  - `staleTime: 60 * 1000`
  - `refetchOnWindowFocus: false`
- Some hooks request fresh data with settings such as `refetchOnMount: "always"`.
- Server helper fetches in `lib/products.js` and `lib/categories.js` use `cache: "no-store"`.

### Code Splitting

- Relies on Next.js route-level code splitting.
- No manual dynamic imports were found.

### Scroll Libraries

- Lenis is globally enabled.
- Options include:
  - `anchors: true`
  - `autoResize: true`
  - `autoRaf: true`
  - `allowNestedScroll: true`
  - `lerp: 0.08`
  - `overscroll: false`
  - `smoothWheel: true`
  - `touchMultiplier: 1.15`
  - `wheelMultiplier: 0.9`
- Elements with `data-lenis-prevent` are excluded from Lenis handling.

### Animation Libraries

- Lenis for smooth scrolling.
- `tw-animate-css` installed.
- Custom CSS animations in `app/globals.css`.

## Current Issues

### Broken Routes

- `APP_ROUTES.COLLECTIONS` points to `/collections`, and the header references collections, but no `app/collections/page.js` route was found.
- Auth route constants reference `/reset-password`, but no `app/reset-password/page.js` route was found.
- Auth route constants reference `/verify-email`, but no `app/verify-email/page.js` route was found.
- `CategoryDetail` and category detail fetching exist, but no `/categories/[slug]` route was found.
- `proxy.js` protects `/account`, but no `/account` route was found.

### SEO Issues

- Root metadata is generic.
- Important catalog routes do not define route-specific metadata:
  - Home
  - Products
  - Product detail
  - Categories
- Product detail pages do not generate dynamic product metadata.
- No sitemap was found.
- No robots file was found.
- No canonical URL configuration was found.
- No Open Graph or Twitter metadata was found.
- No structured data/schema was found for products, breadcrumbs, organization, or website search.
- Product and category data is largely client-fetched, which may reduce crawlable HTML content for catalog pages.

### Performance Issues

- Some remote product images use `unoptimized`, bypassing Next image optimization.
- Homepage includes full-screen autoplay video content.
- Auth pages use a logo animation video.
- Product/category data often uses client-side fetching, which can increase loading time for meaningful catalog content.
- Server helper fetches use `cache: "no-store"`, preventing Next.js data caching for product and category reads.
- No manual route/component-level dynamic import strategy was found for large client flows.
- React Query Devtools are mounted in the provider; confirm production behavior during builds.

### Accessibility Issues

- Product tabs appear to reference active panels dynamically; inactive tab buttons may point to panels that are not mounted.
- Search UI is structurally mounted while hidden in some states, with `aria-hidden` behavior that should be reviewed for keyboard and screen reader interaction.
- Several icon-only or visual controls should be audited for accessible labels and focus states.
- Newsletter, review, and social auth UI appear partially visual/non-functional and should be reviewed for expected semantics and user feedback.
- Autoplay videos should be reviewed for user controls, reduced-motion expectations, and accessible alternatives.

### Additional Maintainability Issues

- Non-standard Tailwind utilities such as `text-md`, `text-ms`, and `max-w-8xl` appear in source and may be no-ops unless generated elsewhere.
- Some content is inconsistent with the jewellery storefront, such as promotional copy mentioning perfume and dollar pricing.
- Middleware protection does not include `/orders`, `/cart`, or `/payment-method`; these rely on client-side checks and API failures.
- Git status showed many untracked `.next` build artifacts, indicating generated build output exists in the working tree.
