import Header from '@/components/Header';
import OrderSuccess from '@/components/order/OrderSuccess';

export const metadata = {
  title: 'Order Confirmed | Kayra Aura',
  description: 'Your Kayra Aura order has been confirmed.',
};

export default async function OrderSuccessPage({ params }) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <OrderSuccess orderId={id} />
      </main>
    </div>
  );
}
