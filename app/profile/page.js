import Header from '@/components/Header';
import UserProfile from '@/components/profile/UserProfile';
import { noIndexMetadata } from '@/lib/seo';

export const metadata = noIndexMetadata({
  title: 'User Profile | Kayra Aura',
  description: 'View your account profile information.',
  path: '/profile',
});

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf7]">
      <Header />
      <main className="flex-1">
        <UserProfile />
      </main>
    </div>
  );
}
