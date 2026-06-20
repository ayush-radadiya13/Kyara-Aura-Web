import Header from '@/components/Header';
import WishlistPage from '@/components/wishlist/WishlistPage';

export const metadata = {
  title: 'Wishlist | Kayra Aura',
  description: 'View and manage your saved Kayra Aura products.',
};

export default function WishlistRoutePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf7]">
      <Header />
      <main className="flex-1">
        <WishlistPage />
      </main>
    </div>
  );
}
