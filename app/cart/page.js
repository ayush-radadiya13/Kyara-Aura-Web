import Header from '@/components/Header';
import CartCheckout from '@/components/cart/CartCheckout';

export const metadata = {
  title: 'Cart | Kayra Aura',
  description: 'Review your cart and continue to checkout.',
};

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
