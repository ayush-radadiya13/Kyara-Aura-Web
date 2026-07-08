import { Cormorant_Garamond, Inter } from 'next/font/google';
import Header from '@/components/Header';
import AboutPage from '@/components/about/AboutPage';
import { metadataForPage } from '@/lib/seo';

const aboutDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const aboutBody = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const aboutDescription =
  'Learn about Kayra Aura — a premium fashion jewellery brand specialising in imitation and trendy pieces. Discover our passion for elegant designs and a refined shopping experience.';

export const metadata = metadataForPage({
  title: 'About Us | Kayra Aura',
  description: aboutDescription,
  path: '/about',
});

export default function AboutUsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <AboutPage
          displayClassName={aboutDisplay.className}
          bodyClassName={aboutBody.className}
        />
      </main>
    </div>
  );
}
