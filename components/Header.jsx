'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X, Search, User, ShoppingBag, Heart } from 'lucide-react';
import { useLogout } from '@/hooks/auth';
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

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const logoutMutation = useLogout();
  const count = useCartStore((state) => state.itemCount || state.items.reduce((total, item) => total + item.quantity, 0));
  const setCart = useCartStore((state) => state.setCart);
  const wishCount = 0; // Static wishlist count for now
  const actionCounts = {
    cartCount: count,
    wishCount,
  };
  const showAuthenticatedActions = isHydrated && isAuthenticated;

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
    <header className="sticky top-0 z-50 glass border-b border-gray-200/50">
      <div className="max-w-8xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* LEFT - Logo */}
        <div className="flex-shrink-0">
          <Link
            href={APP_ROUTES.HOME}
            className="font-display text-xl tracking-wide text-gray-900 hover:text-gold transition-colors duration-300"
          >
            Kyara<span className="text-gold">-Aura</span>
          </Link>
        </div>

        {/* CENTER - Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10 text-sm font-medium">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-700 hover:text-gold transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT - Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {HEADER_ICON_ITEMS.map(({ key, label, href, Icon, type, countKey }) => {
            const itemCount = countKey ? actionCounts[countKey] : 0;

            if (type === 'button') {
              return (
                <button
                  key={key}
                  type="button"
                  className="text-gray-600 hover:text-gold transition-colors"
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
                className="relative hover:text-gold transition-colors"
                aria-label={itemCount > 0 ? `${label}, ${itemCount} items` : label}
              >
                <Icon className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs font-semibold bg-gold text-white rounded-full h-4 w-4 flex items-center justify-center">
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
              className="text-gray-600 hover:text-gold transition-colors"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </button>

            {accountOpen && (
              <div className="absolute right-0 mt-2 w-40 glass-card rounded-xl overflow-hidden z-50">
                {renderAccountActions(
                  'block px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700',
                  'block w-full px-4 py-2.5 text-left hover:bg-gray-50 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-60',
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-3">
          {/* Search */}
          <button
            type="button"
            className="text-gray-600 hover:text-gold transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Cart */}
          <Link
            href={APP_ROUTES.CART}
            className="relative hover:text-gold transition-colors"
            aria-label={count > 0 ? `Cart, ${count} items` : 'Cart'}
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 text-xs font-semibold bg-gold text-white rounded-full h-4 w-4 flex items-center justify-center">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 hover:text-gold transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-gray-200/50">
          <nav className="px-4 py-4 space-y-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-gray-700 hover:text-gold transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-200/50 flex items-center justify-between">
              {MOBILE_ICON_ITEMS.map(({ label, href, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 text-gray-700 hover:text-gold transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
            <div className="pt-3 border-t border-gray-200/50">
              <div className="mb-2 flex items-center gap-2 text-gray-700 font-medium">
                <User className="h-4 w-4" />
                Account
              </div>
              <div className="space-y-2 pl-6">
                {renderAccountActions(
                  'block text-sm text-gray-600 hover:text-gold transition-colors',
                  'block w-full text-left text-sm text-gray-600 hover:text-gold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                )}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
