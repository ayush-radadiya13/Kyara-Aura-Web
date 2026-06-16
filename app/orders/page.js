import Header from '@/components/Header';
import MyOrders from '@/components/order/MyOrders';

export const metadata = {
  title: 'My Orders | Kyara Aura',
  description: 'View order history, order details, and cancellation options.',
};

export default function OrdersPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf7]">
      <Header />
      <main className="flex-1 lg:overflow-hidden">
        <MyOrders />
      </main>
    </div>
  );
}
