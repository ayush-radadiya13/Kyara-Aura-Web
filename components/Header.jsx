'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, Search, User, ShoppingBag, Heart } from 'lucide-react';
import { useLogout } from '@/hooks/auth';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCartStore } from '@/lib/cart/store';
import { APP_ROUTES, AUTH_PAGE_ROUTES } from '@/lib/routes';
import { useAuthStore } from '@/store/auth-store';
import { getCartApi } from '@/services/cart';

const NAV_ITEMS = [
  { label: 'Home', href: APP_ROUTES.HOME },
  { label: 'Shop', href: APP_ROUTES.PRODUCTS },
  { label: 'Categories', href: APP_ROUTES.CATEGORIES },
  { label: 'Collections', href: APP_ROUTES.COLLECTIONS },
  { label: 'Orders', href: APP_ROUTES.ORDERS },
];

const HEADER_ICON_ITEMS = [
  { key: 'search', label: 'Search', Icon: Search, type: 'button' },
  { key: 'wishlist', label: 'Wishlist', href: APP_ROUTES.WISHLIST, Icon: Heart, countKey: 'wishCount' },
  { key: 'cart', label: 'Cart', href: APP_ROUTES.CART, Icon: ShoppingBag, countKey: 'cartCount' },
];

const ACCOUNT_MENU_ITEMS = [
  { label: 'Login', href: AUTH_PAGE_ROUTES.LOGIN },
  { label: 'Register', href: AUTH_PAGE_ROUTES.REGISTER },
  { label: 'Forgot Password', href: AUTH_PAGE_ROUTES.FORGOT_PASSWORD },
];

const MOBILE_ICON_ITEMS = [
  { label: 'Wishlist', href: APP_ROUTES.WISHLIST, Icon: Heart },
];

export default function Header({ variant = 'default' }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const logoutMutation = useLogout();
  const count = useCartStore((state) => state.itemCount || state.items.reduce((total, item) => total + item.quantity, 0));
  const setCart = useCartStore((state) => state.setCart);
  const showAuthenticatedActions = isHydrated && isAuthenticated;
  const wishlistQuery = useWishlist({ enabled: showAuthenticatedActions });
  const wishCount = wishlistQuery.data?.length ?? 0;
  const actionCounts = {
    cartCount: count,
    wishCount,
  };
  const isHomeOverlay = variant === 'homeOverlay';
  const isHomePage = pathname === APP_ROUTES.HOME;
  const headerClassName = 'pointer-events-none fixed left-4 right-4 top-2 z-50';
  const shellClassName =
    'header-glass pointer-events-auto mx-auto flex h-14 max-w-8xl items-center justify-between rounded-full px-4 transition-all duration-500 ease-out hover:-translate-y-0.5 sm:px-6 motion-reduce:transition-none motion-reduce:hover:translate-y-0';
  const logoClassName = isHomeOverlay
    ? 'relative block h-12 w-40 overflow-hidden rounded-full transition-opacity duration-300 hover:opacity-80 sm:w-48'
    : 'relative block h-11 w-36 overflow-hidden rounded-full transition-opacity duration-300 hover:opacity-80 sm:w-44';
  const navLinkClassName = isHomeOverlay
    ? 'rounded-full px-3 py-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-gray-950/80 transition-all duration-300 hover:bg-white/55 hover:text-gray-950 dark:text-gray-950/80 dark:hover:bg-white/55 dark:hover:text-gray-950'
    : 'rounded-full px-3 py-2 text-gray-700/90 transition-all duration-300 hover:bg-white/55 hover:text-gold dark:text-gray-700/90 dark:hover:bg-white/55 dark:hover:text-gold';
  const iconClassName = isHomeOverlay
    ? 'inline-flex items-center justify-center rounded-full p-2 text-gray-950 opacity-100 drop-shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/55 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gold/30 dark:text-gray-950 dark:hover:bg-white/55 dark:hover:text-gray-950'
    : 'inline-flex items-center justify-center rounded-full p-2 text-gray-950 opacity-100 drop-shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/55 hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold/30 dark:text-gray-950 dark:hover:bg-white/55 dark:hover:text-gold';

  useEffect(() => {
    if (!showAuthenticatedActions) return;

    let isCurrent = true;
    getCartApi()
      .then((cart) => {
        if (isCurrent) setCart(cart);
      })
      .catch(() => {});

    return () => {
      isCurrent = false;
    };
  }, [setCart, showAuthenticatedActions]);

  useEffect(() => {
    if (accountOpen) {
      setAccountMenuVisible(true);
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setAccountMenuVisible(false);
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [accountOpen]);

  const handleLogout = () => {
    logoutMutation.mutate();
    setAccountOpen(false);
    setMobileMenuOpen(false);
  };

  const renderAccountActions = (linkClassName, buttonClassName) => {
    if (showAuthenticatedActions) {
      return (
        <button
          type="button"
          className={buttonClassName}
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
        </button>
      );
    }

    return ACCOUNT_MENU_ITEMS.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={linkClassName}
        onClick={() => {
          setAccountOpen(false);
          setMobileMenuOpen(false);
        }}
      >
        {item.label}
      </Link>
    ));
  };

  return (
    <>
      <header className={headerClassName}>
        <div className={shellClassName}>

        {/* LEFT - Logo */}
        <div className={isHomeOverlay ? 'hidden md:block md:w-6/12' : 'flex-shrink-0'}>
          {isHomeOverlay ? (
            <nav className="flex items-center gap-8">
              {NAV_ITEMS.slice(1, 5).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navLinkClassName}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : (
            <Link
              href={APP_ROUTES.HOME}
              className={logoClassName}
            >
              <Image
                src="/assets/ka1.png"
                alt="Kyara Aura"
                fill
                className="object-cover object-center"
                sizes="(max-width: 640px) 144px, 176px"
                priority
              />
            </Link>
          )}
        </div>

        {isHomeOverlay && (
          <div className="flex flex-1 justify-start md:flex-none md:justify-center">
            <Link href={APP_ROUTES.HOME} className={logoClassName}>
              <Image
                src="/assets/ka1.png"
                alt="Kyara Aura"
                fill
                className="object-cover object-center"
                sizes="(max-width: 640px) 160px, 192px"
                priority
              />
            </Link>
          </div>
        )}

        {/* CENTER - Desktop Navigation */}
        {!isHomeOverlay && (
          <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClassName}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* RIGHT - Desktop Actions */}
        <div className={isHomeOverlay ? 'hidden items-center justify-end gap-1 md:flex md:w-5/12' : 'hidden items-center gap-1 md:flex'}>

          {HEADER_ICON_ITEMS.map(({ key, label, href, Icon, type, countKey }) => {

            const itemCount = countKey ? actionCounts[countKey] : 0;

            if (type === 'button') {
              return (
                <button
                  key={key}
                  type="button"
                  className={iconClassName}
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            }

            return (
              <Link
                key={key}
                href={href}
                className={`relative ${iconClassName}`}
                aria-label={itemCount > 0 ? `${label}, ${itemCount} items` : label}
              >
                <Icon className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 w-4 items-center  justify-center rounded-full !bg-[#2C2C2E] text-[10px] font-semibold text-white shadow-lg shadow-gold/30">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Account */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAccountOpen(!accountOpen)}
              className={iconClassName}
              aria-label="Account"
              aria-expanded={accountOpen}
            >
              <User className="h-5 w-5" />
            </button>

            {(accountOpen || accountMenuVisible) && (
              <div
                className={`header-menu-glass header-menu-dropdown right-0 z-50 mt-3 w-44 overflow-hidden rounded-2xl ${
                  accountOpen
                    ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
                    : 'pointer-events-none -translate-y-2 scale-95 opacity-0'
                }`}
              >
                {renderAccountActions(
                  'block px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-white/55 hover:text-gold dark:text-gray-700 dark:hover:bg-white/55 dark:hover:text-gold',
                  'block w-full px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-white/55 hover:text-gold disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-700 dark:hover:bg-white/55 dark:hover:text-gold',
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-1 md:hidden">
          {/* Search */}
          <button
            type="button"
            className={iconClassName}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Cart */}
          <Link
            href={APP_ROUTES.CART}
            className={`relative ${iconClassName}`}
            aria-label={count > 0 ? `Cart, ${count} items` : 'Cart'}
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-white shadow-lg shadow-gold/30">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={iconClassName}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="header-menu-glass pointer-events-auto mx-auto mt-3 max-w-7xl overflow-hidden rounded-[2rem] md:hidden">
          <nav className="space-y-2 px-4 py-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-full px-3 py-2 font-medium text-gray-700 transition-colors hover:bg-white/55 hover:text-gold dark:text-gray-700 dark:hover:bg-white/55 dark:hover:text-gold"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center justify-between border-t border-white/30 pt-3 dark:border-white/10">
              {MOBILE_ICON_ITEMS.map(({ label, href, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 rounded-full px-3 py-2 font-medium text-gray-700 transition-colors hover:bg-white/55 hover:text-gold dark:text-gray-700 dark:hover:bg-white/55 dark:hover:text-gold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
            <div className="border-t border-white/30 pt-3 dark:border-white/10">
              <div className="mb-2 flex items-center gap-2 px-3 font-medium text-gray-700 dark:text-gray-700">
                <User className="h-4 w-4" />
                Account
              </div>
              <div className="space-y-2 pl-6">
                {renderAccountActions(
                  'block rounded-full px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-white/55 hover:text-gold dark:text-gray-600 dark:hover:bg-white/55 dark:hover:text-gold',
                  'block w-full rounded-full px-3 py-2 text-left text-sm text-gray-600 transition-colors hover:bg-white/55 hover:text-gold disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-600 dark:hover:bg-white/55 dark:hover:text-gold',
                )}
              </div>
            </div>
          </nav>
        </div>
      )}
      </header>
      {!isHomeOverlay && !isHomePage && <div aria-hidden="true" className="h-20 shrink-0" />}
    </>
  );
}
