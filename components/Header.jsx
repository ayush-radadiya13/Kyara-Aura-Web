'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X, Search, User, ShoppingBag, Heart } from 'lucide-react';
import { useCartStore } from '@/lib/cart/store';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((state) => state.getItemCount());

  useEffect(() => {
    setMounted(true);
  }, []);

  const count = mounted ? cartCount : 0;
  const wishCount = 0; // Static wishlist count for now

  return (
    <header className="sticky top-0 z-50 glass border-b border-gray-200/50">
      <div className="max-w-8xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* LEFT - Logo */}
        <div className="flex-shrink-0">
          <Link
            href="/"
            className="font-display text-xl tracking-wide text-gray-900 hover:text-gold transition-colors duration-300"
          >
            Kyara<span className="text-gold">-Aura</span>
          </Link>
        </div>

        {/* CENTER - Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10 text-sm font-medium">
          <Link href="/" className="text-gray-700 hover:text-gold transition-colors">
            Home
          </Link>
          <Link href="/products" className="text-gray-700 hover:text-gold transition-colors">
            Shop
          </Link>
          <Link href="/categories" className="text-gray-700 hover:text-gold transition-colors">
            Categories
          </Link>
          <Link href="/collections" className="text-gray-700 hover:text-gold transition-colors">
            Collections
          </Link>
          <Link href="/orders" className="text-gray-700 hover:text-gold transition-colors">
            Orders
          </Link>
        </nav>

        {/* RIGHT - Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Search */}
          <button className="text-gray-600 hover:text-gold transition-colors">
            <Search className="h-5 w-5" />
          </button>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="relative hover:text-gold transition-colors"
          >
            <Heart className="h-5 w-5" />
            {wishCount > 0 && (
              <span className="absolute -top-1 -right-1 text-xs font-semibold bg-gold text-white rounded-full h-4 w-4 flex items-center justify-center">
                {wishCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
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

          {/* Account */}
          <div className="relative">
            <button
              onClick={() => setAccountOpen(!accountOpen)}
              className="text-gray-600 hover:text-gold transition-colors"
            >
              <User className="h-5 w-5" />
            </button>

            {accountOpen && (
              <div className="absolute right-0 mt-2 w-40 glass-card rounded-xl overflow-hidden z-50">
                <Link
                  href="/login"
                  className="block px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700"
                  onClick={() => setAccountOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700"
                  onClick={() => setAccountOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-3">
          {/* Search */}
          <button className="text-gray-600 hover:text-gold transition-colors">
            <Search className="h-5 w-5" />
          </button>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative hover:text-gold transition-colors"
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
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 hover:text-gold transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-gray-200/50">
          <nav className="px-4 py-4 space-y-3">
            <Link
              href="/"
              className="block text-gray-700 hover:text-gold transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/products"
              className="block text-gray-700 hover:text-gold transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/categories"
              className="block text-gray-700 hover:text-gold transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/collections"
              className="block text-gray-700 hover:text-gold transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Collections
            </Link>
            <Link
              href="/orders"
              className="block text-gray-700 hover:text-gold transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Orders
            </Link>
            <div className="pt-3 border-t border-gray-200/50 flex items-center justify-between">
              <Link
                href="/wishlist"
                className="flex items-center gap-2 text-gray-700 hover:text-gold transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="h-4 w-4" />
                Wishlist
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 text-gray-700 hover:text-gold transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Account
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
