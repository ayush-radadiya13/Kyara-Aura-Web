'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Menu, X, Search, User, ShoppingBag, Heart } from 'lucide-react';
import { useLogout } from '@/hooks/auth';
import { useProductNameSearch } from '@/hooks/use-products';
import { useWishlist } from '@/hooks/use-wishlist';
import { Loader, LoadingLabel } from '@/components/ui/loader';
import { useCartStore } from '@/lib/cart/store';
import { APP_ROUTES, AUTH_PAGE_ROUTES } from '@/lib/routes';
import { useAuthStore } from '@/store/auth-store';
import { getCartApi } from '@/services/cart';
import PromotionalBanner from '@/components/PromotionalBanner';
import { usePromotionalMessages } from '@/hooks/use-promotional-messages';
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

const LOGO = '/assets/ka-logo.png';
const LOGO_WIDTH = 1367;
const LOGO_HEIGHT = 594;

export default function Header({ variant = 'default' }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const desktopSearchContainerRef = useRef(null);
  const mobileSearchContainerRef = useRef(null);
  const desktopSearchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const logoutMutation = useLogout();
  const count = useCartStore((state) => state.itemCount || state.items.reduce((total, item) => total + item.quantity, 0));
  const setCart = useCartStore((state) => state.setCart);
  const showAuthenticatedActions = isHydrated && isAuthenticated;
  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const cart = await getCartApi();
      setCart(cart);
      return cart;
    },
    enabled: showAuthenticatedActions,
    staleTime: 30_000,
  });
  const wishlistQuery = useWishlist({ enabled: showAuthenticatedActions });
  const { hasMessages: showPromoBanner } = usePromotionalMessages();
  const wishCount = wishlistQuery.data?.length ?? 0;
  const actionCounts = {
    cartCount: count,
    wishCount,
  };
  const trimmedSearchTerm = debouncedSearchTerm.trim();
  const searchProductsQuery = useProductNameSearch(trimmedSearchTerm, {
    enabled: searchOpen && trimmedSearchTerm.length >= 2,
  });
  const searchResults = (searchProductsQuery.data ?? []).slice(0, 5);
  const isHomeOverlay = variant === 'homeOverlay';
  const isHomePage = pathname === APP_ROUTES.HOME;
  const headerClassName = 'pointer-events-none fixed left-3 right-3 top-2 z-50 sm:left-4 sm:right-4';
  const shellClassName =
    'header-glass pointer-events-auto mx-auto flex h-14 max-w-8xl items-center justify-between overflow-visible rounded-full px-4 transition-all duration-500 ease-out hover:-translate-y-0.5 sm:px-6 motion-reduce:transition-none motion-reduce:hover:translate-y-0';
  const navLinkClassName = isHomeOverlay
    ? 'rounded-full px-3 py-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-gray-950/80 transition-all duration-300 hover:bg-white/55 hover:text-gray-950 dark:text-gray-950/80 dark:hover:bg-white/55 dark:hover:text-gray-950'
    : 'rounded-full px-3 py-2 text-gray-700/90 transition-all duration-300 hover:bg-white/55 hover:text-gold dark:text-gray-700/90 dark:hover:bg-white/55 dark:hover:text-gold';
  const iconClassName = isHomeOverlay
    ? 'inline-flex items-center justify-center rounded-full p-2 text-gray-950 opacity-100 drop-shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/55 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gold/30 dark:text-gray-950 dark:hover:bg-white/55 dark:hover:text-gray-950'
    : 'inline-flex items-center justify-center rounded-full p-2 text-gray-950 opacity-100 drop-shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/55 hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold/30 dark:text-gray-950 dark:hover:bg-white/55 dark:hover:text-gold';

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    if (!searchOpen) return undefined;

    const timeoutId = window.setTimeout(() => {
      const inputRef = window.matchMedia('(min-width: 768px)').matches
        ? desktopSearchInputRef
        : mobileSearchInputRef;

      inputRef.current?.focus();
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return undefined;

    const handlePointerDown = (event) => {
      const clickedInsideDesktop = desktopSearchContainerRef.current?.contains(event.target);
      const clickedInsideMobile = mobileSearchContainerRef.current?.contains(event.target);

      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [searchOpen]);

  useEffect(() => {
    if (accountOpen || !accountMenuVisible) return undefined;

    const timeoutId = window.setTimeout(() => {
      setAccountMenuVisible(false);
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [accountMenuVisible, accountOpen]);

  const handleLogout = () => {
    logoutMutation.mutate();
    setAccountOpen(false);
    setMobileMenuOpen(false);
  };

  const openSearch = () => {
    setSearchOpen(true);
    setMobileMenuOpen(false);
    setAccountOpen(false);
    setAccountMenuVisible(false);
  };

  const toggleSearch = () => {
    if (searchOpen) {
      setSearchOpen(false);
      return;
    }

    openSearch();
  };

  const closeSearch = () => {
    setSearchOpen(false);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (searchResults[0]?.slug) {
      router.push(`/products/${searchResults[0].slug}`);
      closeSearch();
    }
  };

  const renderLogo = () => (
    <Link
      href={APP_ROUTES.HOME}
      className="relative block h-10 w-[6.5rem] shrink-0 transition-opacity duration-300 hover:opacity-80 sm:h-11 sm:w-[7.25rem] md:h-[3.25rem] md:w-[8.75rem]"
      aria-label="Kayra Aura home"
    >
      <Image
        src={LOGO}
        alt="Kayra Aura"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        className="h-full w-full object-contain object-left"
        sizes="(max-width: 640px) 104px, (max-width: 768px) 116px, 140px"
        priority
      />
    </Link>
  );

  const renderSearchPanel = (containerRef, inputRef, isMobileSearch = false) => {
    const trimmedTerm = searchTerm.trim();
    const showSearchContent = searchOpen && trimmedTerm.length >= 2;
    const searchStatus = searchProductsQuery.isError
        ? 'Unable to search right now.'
        : 'No products found.';

    return (
      <form
        ref={containerRef}
        onSubmit={handleSearchSubmit}
        className={`relative z-20 min-w-0 max-w-full shrink-0 self-center origin-right transition-[width,opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
          isMobileSearch
            ? 'h-14 w-full translate-x-0 scale-x-100 opacity-100'
            : searchOpen
              ? 'h-10 w-[calc(100vw-7.25rem)] max-w-[19rem] translate-x-0 scale-x-100 opacity-100 sm:w-80 md:w-[min(34vw,22rem)]'
              : 'pointer-events-none h-10 w-0 translate-x-2 scale-x-95 opacity-0'
        }`}
        aria-hidden={!searchOpen}
      >
        <div className="relative h-full overflow-hidden rounded-full">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            ref={inputRef}
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') closeSearch();
            }}
            disabled={!searchOpen}
            placeholder="Search products"
            className={`${isMobileSearch ? 'h-full pr-12 text-base' : 'h-10 pr-4 text-base md:text-sm'} w-full rounded-full border border-gray-950/15 bg-transparent pl-10 text-gray-900 outline-none backdrop-blur-xl transition placeholder:text-gray-500 focus:border-gold/60 focus:ring-2 focus:ring-gold/15`}
          />
          {isMobileSearch && (
            <button
              type="button"
              className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-gray-950 transition hover:bg-white/55 focus:outline-none focus:ring-2 focus:ring-gold/30"
              aria-label="Close search"
              onClick={closeSearch}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {showSearchContent && (
          <div className="header-menu-glass absolute right-0 top-1 max-h-[70vh] w-full overflow-hidden rounded-3xl border border-white/55 p-2 shadow-xl">
            {searchProductsQuery.isSuccess && searchResults.length > 0 ? (
              <div className="max-h-72 overflow-y-auto" data-lenis-prevent>
                {searchResults.map((product) => (
                  <Link
                    key={product._id ?? product.id ?? product.slug}
                    href={`/products/${product.slug}`}
                    className="block truncate rounded-full px-4 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-white/55 hover:text-gold"
                    onClick={closeSearch}
                  >
                    {product.name}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-3 py-4 text-center text-sm text-gray-600">
                {searchProductsQuery.isLoading ? (
                  <LoadingLabel>
                    Searching...
                  </LoadingLabel>
                ) : (
                  searchStatus
                )}
              </div>
            )}
          </div>
        )}
      </form>
    );
  };

  const renderActionCountBadge = (itemCount, isLoading) => {
    if (isLoading) {
      return (
        <span className="absolute -right-1 -top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full !bg-[#2C2C2E] shadow-lg shadow-gold/30">
          <Loader size="xs" />
        </span>
      );
    }

    if (itemCount > 0) {
      return (
        <span className="absolute -right-1 -top-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full !bg-[#2C2C2E] px-0.5 text-[10px] font-semibold leading-none text-white shadow-lg shadow-gold/30">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      );
    }

    return null;
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
          {logoutMutation.isPending ? (
            <LoadingLabel>
              Logging out...
            </LoadingLabel>
          ) : (
            'Logout'
          )}
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
        {searchOpen && (
          <div className="header-glass pointer-events-auto mx-auto flex h-14 max-w-8xl items-center rounded-full px-0 transition-all duration-300 ease-out md:hidden motion-reduce:transition-none">
            {renderSearchPanel(mobileSearchContainerRef, mobileSearchInputRef, true)}
          </div>
        )}

        <div className={`${searchOpen ? 'hidden md:flex' : 'flex'} ${shellClassName}`}>

        {/* LEFT - Logo */}
        <div className={isHomeOverlay ? (searchOpen ? 'hidden lg:block lg:w-6/12' : 'hidden md:block md:w-6/12') : searchOpen ? 'hidden md:block md:flex-shrink-0' : 'flex-shrink-0'}>
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
            renderLogo()
          )}
        </div>

        {isHomeOverlay && (
          <div className={`${searchOpen ? 'hidden lg:flex' : 'flex'} flex-1 justify-start md:flex-none md:justify-center`}>
            {renderLogo()}
          </div>
        )}

        {/* CENTER - Desktop Navigation */}
        {!isHomeOverlay && (
          <nav className={`${searchOpen ? 'hidden lg:flex' : 'hidden md:flex'} items-center gap-2 text-sm font-medium`}>
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
          {renderSearchPanel(desktopSearchContainerRef, desktopSearchInputRef)}

          {HEADER_ICON_ITEMS.map(({ key, label, href, Icon, type, countKey }) => {

            const itemCount = countKey ? actionCounts[countKey] : 0;
            const countLoading =
              showAuthenticatedActions &&
              ((countKey === 'cartCount' && cartQuery.isLoading) ||
                (countKey === 'wishCount' && wishlistQuery.isLoading));

            if (type === 'button') {
              return (
                <button
                  key={key}
                  type="button"
                  className={iconClassName}
                  aria-label={searchOpen ? 'Close search' : label}
                  aria-expanded={searchOpen}
                  onClick={toggleSearch}
                  onMouseDown={(event) => event.stopPropagation()}
                  onTouchStart={(event) => event.stopPropagation()}
                >
                  {searchOpen ? <X className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </button>
              );
            }

            return (
              <Link
                key={key}
                href={href}
                className={`relative overflow-visible ${iconClassName}`}
                aria-label={itemCount > 0 ? `${label}, ${itemCount} items` : label}
              >
                <Icon className="h-5 w-5" />
                {renderActionCountBadge(itemCount, countLoading)}
              </Link>
            );
          })}

          {/* Account */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                const nextAccountOpen = !accountOpen;
                setAccountOpen(nextAccountOpen);
                if (nextAccountOpen) setAccountMenuVisible(true);
              }}
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
        <div className={`${searchOpen ? 'flex-1 justify-end' : ''} flex items-center gap-1 overflow-visible md:hidden`}>
          {/* Search */}
          <button
            type="button"
            className={iconClassName}
            aria-label={searchOpen ? 'Close search' : 'Search'}
            aria-expanded={searchOpen}
            onClick={toggleSearch}
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>

          {/* Cart */}
          <Link
            href={APP_ROUTES.CART}
            className={`${searchOpen ? 'hidden' : ''} relative overflow-visible ${iconClassName}`}
            aria-label={count > 0 ? `Cart, ${count} items` : 'Cart'}
          >
            <ShoppingBag className="h-5 w-5" />
            {renderActionCountBadge(
              count,
              showAuthenticatedActions && cartQuery.isLoading,
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`${searchOpen ? 'hidden' : ''} ${iconClassName}`}
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
      <PromotionalBanner />
      {!isHomeOverlay && !isHomePage && (
        <div aria-hidden="true" className={showPromoBanner ? 'h-28 shrink-0' : 'h-20 shrink-0'} />
      )}
    </>
  );
}
