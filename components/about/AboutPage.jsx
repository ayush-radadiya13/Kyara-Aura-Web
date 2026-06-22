import Image from 'next/image';
import Link from 'next/link';
import { APP_ROUTES } from '@/lib/routes';

const sections = [
  {
    image: '/assets/about-brand-portrait.png',
    alt: 'Kayra Aura fashion jewellery model',
    title: 'Who We Are',
    text: 'Kayra Aura offers trendy, high-quality imitation jewellery for every occasion — elegant pieces that look premium and feel special.',
    extra: 'We create designs for women who love fashion jewellery with a refined, luxurious look — perfect for weddings, parties, and everyday style.',
    button: { label: 'Shop Now', href: APP_ROUTES.PRODUCTS },
    imageLeft: true,
  },
  {
    image: '/assets/about-stacked-bangles.png',
    alt: 'Kayra Aura stacked bangles collection',
    title: 'Our Collection',
    text: 'From stacked bangles to statement necklaces, we bring you fashion-forward designs with a luxurious finish.',
    extra: 'Explore rings, earrings, bracelets, and more — each piece crafted to add sparkle and confidence to your look.',
    button: { label: 'Collection', href: APP_ROUTES.COLLECTIONS },
    imageLeft: false,
  },
  {
    image: '/assets/about-necklace-collection.png',
    alt: 'Kayra Aura necklace collection',
    title: 'Our Promise',
    text: 'We are committed to quality craftsmanship, secure shopping, and a premium experience with every order.',
    extra: 'Every order is carefully packed and delivered with care, so you enjoy a smooth and trusted shopping experience.',
    imageLeft: true,
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white text-gray-950">
      <section className="border-b border-gray-100 px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-3xl font-light tracking-tight text-gray-950 sm:text-4xl">
            About Us
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-gray-600 sm:text-base">
            Kayra Aura — premium fashion jewellery for the modern woman.
          </p>
        </div>
      </section>

      {sections.map((section) => (
        <section
          key={section.title}
          className="border-b border-gray-100 px-4 py-10 sm:px-6 sm:py-12"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-5 lg:grid-cols-2 lg:gap-6">
            <div className={section.imageLeft ? 'order-1' : 'order-1 lg:order-2'}>
              <Image
                src={section.image}
                alt={section.alt}
                width={1200}
                height={1500}
                className="h-auto w-full"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={section.imageLeft}
              />
            </div>

            <div className={section.imageLeft ? 'order-2' : 'order-2 lg:order-1'}>
              <h2 className="font-display text-2xl font-light tracking-tight text-gray-950 sm:text-3xl">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">{section.text}</p>
              <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">{section.extra}</p>
              {section.button ? (
                <Link
                  href={section.button.href}
                  className="mt-5 inline-flex border border-[#1e3a5f] bg-transparent px-8 py-3 text-sm font-semibold text-[#1e3a5f]"
                >
                  {section.button.label}
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      ))}

      <section className="px-4 py-10 text-center sm:px-6 sm:py-12">
        <Link
          href={APP_ROUTES.PRODUCTS}
          className="inline-flex border border-[#1e3a5f] bg-transparent px-8 py-3 text-sm font-semibold text-[#1e3a5f]"
        >
          Shop Now
        </Link>
      </section>
    </div>
  );
}
