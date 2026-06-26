import Header from '@/components/Header';
import WishlistPage from '@/components/wishlist/WishlistPage';
import { noIndexMetadata } from '@/lib/seo';

export const metadata = noIndexMetadata({
  title: 'Wishlist | Kayra Aura',
  description: 'View and manage your saved Kayra Aura products.',
  path: '/wishlist',
});

export default function WishlistRoutePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#fbfaf7]">
      <Header />
      <main className="flex-1">
        <WishlistPage />
      </main>
    </div>
  );
}
