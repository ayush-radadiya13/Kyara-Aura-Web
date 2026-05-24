import Header from '@/components/Header';
import CartCheckout from '@/components/cart/CartCheckout';
import { getAuthFieldKeys } from '@/lib/auth/get-auth-field-keys';

export const metadata = {
  title: 'Bag | Kyara Aura',
  description: 'Review your bag and sign in to continue checkout.',
};

export default async function CartPage() {
  const fieldKeys = await getAuthFieldKeys('login');

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <CartCheckout fieldKeys={fieldKeys} />
      </main>
    </div>
  );
}
