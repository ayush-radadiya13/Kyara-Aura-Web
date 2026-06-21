'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone,MapPin  } from 'lucide-react';
import { APP_ROUTES } from '@/lib/routes';
import SocialLinks from '@/components/SocialLinks';
import { useWebSettings } from '@/hooks/use-web-settings';

const companyLinks = [
  { label: 'About Us', href: '/' },
  { label: 'Terms & Conditions', href: APP_ROUTES.TERMS },
  { label: 'Latest Update', href: '/products' },
];

const supportLinks = [
  { label: 'Privacy Policy', href: APP_ROUTES.PRIVACY },
  { label: 'Shipping Policy', href: APP_ROUTES.SHIPPING_POLICY },
  { label: 'Return Policy', href: '/return-policy' },
];

const DEFAULT_LOGO = '/assets/ka1.png';

export default function Footer() {
  const { data: settings } = useWebSettings();
  const logoUrl = settings?.logo_url?.trim() || DEFAULT_LOGO;
  const email = settings?.email?.trim();
  const address = settings?.address?.trim();

  const mobileNumber = settings?.mobile_number?.trim();

  return (
    <footer className="bg-[#eee9e1] text-black">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-[1.15fr_0.8fr_0.8fr_1.15fr] lg:px-8 lg:py-20">
        <div>
          <Link href="/" className="relative block h-12 w-40 overflow-hidden rounded-full transition-opacity hover:opacity-80 sm:w-48">
            <Image
              src={logoUrl}
              alt="Kayra Aura"
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 160px, 192px"
              unoptimized={logoUrl.startsWith('http')}
            />
          </Link>
          <div className="mt-8 space-y-3 text-md leading-5 text-black">
             {address && (
              <p className="flex items-center gap-2">
                <MapPin className="h-5 w-5 shrink-0 text-black" />
                <a href={`tel:${address.replace(/\s/g, '')}`} className="transition hover:opacity-70">
                  {address}
                </a>
              </p>
            )}
            {mobileNumber && (
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-black" />
                <a href={`tel:${mobileNumber.replace(/\s/g, '')}`} className="transition hover:opacity-70">
                  {mobileNumber}
                </a>
              </p>
            )}
            {email && (
              <p className="flex items-center text-md gap-2">
                <Mail className="h-3.5 w-3.5 text-black" />
                <a href={`mailto:${email}`} className="transition hover:opacity-70">
                  {email}
                </a>
              </p>
            )}
          </div>
          <SocialLinks className="mt-6" />
        </div>

        <div className="grid grid-cols-2 gap-6 lg:contents">
          <div>
            <h2 className="text-md font-semibold">Company</h2>
            <nav className="mt-5 space-y-3 text-md text-black">
              {companyLinks.map((item) => (
                <Link key={item.label} href={item.href} className="block transition hover:opacity-70">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-md font-semibold">Support</h2>
            <nav className="mt-5 space-y-3 text-md text-black">
              {supportLinks.map((item) => (
                <Link key={item.label} href={item.href} className="block transition hover:opacity-70">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div>
          <h2 className="text-md font-semibold">Collections</h2>
          <p className="mt-5 text-md leading-5 text-black">
            Discover selected pieces designed to complement every celebration and everyday look.
          </p>
          <p className="mt-3 text-md leading-5 text-black">
            Explore curated bangles, rings, earrings, and elegant fashion jewellery for special occasions.
          </p>
          <Link
            href={APP_ROUTES.COLLECTIONS}
            className="mt-5 inline-block w-full bg-[#d8bd92] px-6 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-gray-950"
          >
            View Collections
          </Link>
        </div>
      </div>
    </footer>
  );
}
