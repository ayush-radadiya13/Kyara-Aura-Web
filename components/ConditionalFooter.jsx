'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';

const HIDDEN_FOOTER_ROUTES = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/orders',
  '/cart',
  '/payment-method',
]);

export default function ConditionalFooter() {
  const pathname = usePathname();

  if (HIDDEN_FOOTER_ROUTES.has(pathname) || pathname?.startsWith('/order-success')) {
    return null;
  }

  return <Footer />;
}
