import Header from '@/components/Header';
import CartCheckout from '@/components/cart/CartCheckout';
import { noIndexMetadata } from '@/lib/seo';

export const metadata = noIndexMetadata({
  title: 'Cart | Kayra Aura',
  description: 'Review your cart and continue to checkout.',
  path: '/cart',
});

export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf7]">
      <Header />
      <main className="flex-1">
        <CartCheckout />
      </main>
    </div>
  );
}
