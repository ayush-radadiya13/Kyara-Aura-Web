import Header from '@/components/Header';

export const metadata = {
  title: 'Terms and Conditions | Kayra Aura',
  description:
    'Review Kayra Aura terms and conditions for purchasing and using imitation jewellery.',
};

const termsSections = [
  {
    title: 'Product Information',
    items: [
      'We sell imitation (fashion) jewellery only, not solid gold, silver, or precious metals.',
      'Product images are for representation purposes only. Actual color, shine, size, or design may vary slightly due to lighting, plating processes, or screen settings.',
      'Minor variations or imperfections are normal in imitation jewellery and do not indicate defects.',
    ],
  },
  {
    title: 'Usage and Care Disclaimer',
    items: [
      'The plating or finish may fade over time depending on usage, storage, and exposure to moisture, perfume, sweat, or chemicals.',
      'Avoid contact with water, cosmetics, perfumes, and cleaning agents.',
      'We are not responsible for damage caused by improper use, storage, or care.',
    ],
  },
  {
    title: 'Pricing and Availability',
    items: [
      'All products are subject to availability.',
      'Prices may change without prior notice.',
      'We reserve the right to limit quantities per order or cancel orders due to stock or pricing issues.',
    ],
  },
  {
    title: 'Orders and Payments',
    items: [
      'Order confirmation does not guarantee acceptance.',
      'Orders may be canceled due to stock unavailability, pricing errors, incomplete information, or suspected fraudulent activity.',
      'Payments must be completed through authorized payment gateways.',
      'Customers are responsible for providing accurate billing, shipping, and contact details when placing an order.',
    ],
  },
  {
    title: 'Shipping and Delivery',
    items: [
      'Delivery timelines are estimates and may vary due to courier partners, location, weather, public holidays, or unforeseen circumstances.',
      'We are not responsible for delays beyond our control.',
      'Risk of loss or damage passes to the customer once the product has been delivered to the address provided at checkout.',
    ],
  },
  {
    title: 'Returns and Exchanges',
    items: [
      'Returns are accepted only as per our Return and Refund Policy.',
      'A return can be requested within 3 days of receiving the order, and the product must be unused, in its original condition, and returned with all original packaging and accessories.',
      'Customers must upload clear images of the product when submitting a return request.',
      'At the time of delivery, please open and inspect the package in front of the delivery person and report any issue immediately.',
      'The returned product must include all items originally delivered. If any item is missing or the product is damaged or used, the return or refund may be rejected.',
      'Refunds are processed only after the returned product passes our quality inspection.',
    ],
  },
  {
    title: 'Offers, Discounts, and Coupons',
    items: [
      'Promotional offers, discounts, and coupon codes are subject to their respective terms and availability.',
      'Offers cannot be combined unless expressly stated.',
      'We may modify, withdraw, or refuse any offer in cases of misuse, technical errors, or suspected fraud.',
    ],
  },
  {
    title: 'Account and User Conduct',
    items: [
      'Customers must keep account login details confidential and are responsible for activity under their account.',
      'Misuse of the website, false information, unauthorized access, or fraudulent transactions may result in order cancellation or account restriction.',
      'Customers must not copy, scrape, disrupt, or misuse website content, systems, or services.',
    ],
  },
  {
    title: 'Intellectual Property',
    items: [
      'All product images, designs, descriptions, logos, and branding on this website are the property of Kayra Aura.',
      'Unauthorized copying, reproduction, resale use, or commercial use is strictly prohibited.',
    ],
  },
  {
    title: 'Limitation of Liability',
    items: [
      'We are not liable for indirect, incidental, special, or consequential damages arising from the use of our website or products.',
      'Liability, if any, is limited to the purchase value of the product.',
      'We do not guarantee that the website will always be uninterrupted, error-free, or free from technical issues.',
    ],
  },
  {
    title: 'Governing Law',
    items: [
      'These terms are governed by the laws of India.',
      'Any disputes shall be subject to the jurisdiction of courts in India.',
    ],
  },
  {
    title: 'Changes to Terms',
    items: [
      'We reserve the right to modify these terms at any time.',
      'Continued use of the website constitutes acceptance of updated terms.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="bg-white text-gray-950">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <article className="max-w-5xl text-sm leading-6 text-gray-600">
          <header className="mb-8">
            <h1 className="font-display text-3xl font-semibold text-gray-900 sm:text-4xl">
              Terms and Conditions
            </h1>
            <p className="mt-5">
              These Terms and Conditions apply to the purchase and use of imitation jewellery
              sold on Kayra Aura. By accessing or purchasing from our website, you agree to
              comply with the following terms.
            </p>
          </header>

          <section className="space-y-8">
            {termsSections.map((section, index) => (
              <div key={section.title}>
                <h2 className="text-base font-semibold text-gray-900">
                  {index + 1}. {section.title}
                </h2>
                <ul className="mt-3 list-disc space-y-1 pl-6">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h2 className="text-base font-semibold text-gray-900">Contact Us</h2>
              <p className="mt-3">
                For questions about these terms, please contact us at{' '}
                <a className="font-medium text-gray-900 underline" href="mailto:kayraaura4u@gmail.com">
                  kayraaura4u@gmail.com
                </a>
                .
              </p>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
