import Header from '@/components/Header';
import MyOrders from '@/components/order/MyOrders';
import { noIndexMetadata } from '@/lib/seo';

export const metadata = noIndexMetadata({
  title: 'My Orders | Kayra Aura',
  description: 'View order history, order details, and cancellation options.',
  path: '/orders',
});

export default function OrdersPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#fbfaf7]">
      <Header />
      <main className="flex-1 lg:overflow-hidden">
        <MyOrders />
      </main>
    </div>
  );
}
