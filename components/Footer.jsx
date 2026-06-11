import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { APP_ROUTES } from '@/lib/routes';

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

export default function Footer() {
  return (
    <footer className="bg-[#eee9e1] text-black">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-[1.15fr_0.8fr_0.8fr_1.15fr] lg:px-8 lg:py-20">
        <div>
          <Link href="/" className="font-display text-2xl uppercase tracking-[0.18em] text-black">
            Kyara Aura
          </Link>
          <div className="mt-8 space-y-3 text-md leading-5 text-black">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 text-black" />
              <span>Fine jewellery crafted with timeless elegance.</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-black" />
              <a href="tel:+911234567890" className="transition hover:opacity-70">
                +91 12345 67890
              </a>
            </p>
            <p className="flex items-center text-md gap-2">
              <Mail className="h-3.5 w-3.5 text-black" />
              <a href="mailto:support@kyaraaura.com" className="transition hover:opacity-70">
                support@kyaraaura.com
              </a>
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-md font-semibold">Company</h2>
          <nav className="mt-5 sm:grid-cols-2 space-y-3 text-md text-black">
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

        <div>
          <h2 className="text-md font-semibold">Newsletter</h2>
          <p className="mt-5 text-md leading-5 text-black">
            Get our latest updates and promo bi-monthly.
          </p>
          <form className="mt-5">
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              placeholder="Enter your email address ..."
              className="w-full border-0 border-b border-black bg-transparent py-3 text-ms text-black outline-none placeholder:text-black focus:border-black"
            />
            <button
              type="submit"
              className="mt-4 w-full bg-[#d8bd92] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-gray-950"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
}
