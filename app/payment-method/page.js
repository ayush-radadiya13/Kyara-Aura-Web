import Header from '@/components/Header';
import PaymentMethodFlow from '@/components/cart/PaymentMethodFlow';

export const metadata = {
  title: 'Payment Method | Kyara Aura',
  description: 'Choose a secure payment method for your Kyara Aura order.',
};

function getCheckoutIntent(searchParams = {}) {
  const checkoutType = searchParams.checkout_type === 'buy_now' ? 'buy_now' : 'cart';

  if (checkoutType === 'buy_now') {
    return {
      checkout_type: 'buy_now',
      product_size_id: searchParams.product_size_id,
      quantity: Math.max(Number(searchParams.quantity) || 1, 1),
    };
  }

  return { checkout_type: 'cart' };
}

export default async function PaymentMethodPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <PaymentMethodFlow initialCheckoutIntent={getCheckoutIntent(resolvedSearchParams)} />
      </main>
    </div>
  );
}
