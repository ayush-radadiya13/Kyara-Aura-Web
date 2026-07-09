import Header from '@/components/Header';

export const metadata = {
  title: 'Shipping Policy | Kayra Aura',
  description:
    'Review Kayra Aura shipping policy, including order processing time, delivery timelines, shipping charges, and order inspection for imitation and silver jewellery.',
};

const deliveryTimeline = [
  'Orders are usually delivered within 4–6 business days from the date of dispatch.',
  'Delivery timelines may vary slightly depending on your location, public holidays, or unforeseen courier delays.',
];

export default function ShippingPolicyPage() {
  return (
    <div className="bg-white text-gray-950">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <article className="max-w-5xl text-sm leading-6 text-gray-600">
          <header className="mb-8">
            <h1 className="font-display text-3xl font-semibold text-gray-900 sm:text-4xl">
              Shipping Policy
            </h1>
            <p className="mt-5">
              We currently ship across India and strive to deliver your orders safely and on time.
            </p>
          </header>

          <section className="space-y-8">
            <div className="space-y-4">
              <p>
                All orders are processed within <strong className="font-semibold text-gray-900">1–2 business days</strong>,
                subject to product availability. Every product undergoes a quality inspection before
                dispatch to ensure it reaches you in perfect condition.
              </p>
              <p>
                Our collection includes{' '}
                <strong className="font-semibold text-gray-900">Imitation Jewellery</strong> and{' '}
                <strong className="font-semibold text-gray-900">Silver Jewellery</strong>.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900">Delivery Timeline</h2>
              <ul className="mt-3 list-disc space-y-1 pl-6">
                {deliveryTimeline.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900">Shipping Charges</h2>
              <p className="mt-3">
                Shipping charges, if applicable, will be calculated and displayed at checkout before
                you complete your purchase.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900">Cash on Delivery (COD)</h2>
              <p className="mt-3">
                Cash on Delivery (COD) is available for eligible orders. A{' '}
                <strong className="font-semibold text-gray-900">₹40 COD handling charge</strong> is
                applied by our delivery partner, <strong className="font-semibold text-gray-900">Delhivery</strong>,
                on all COD orders. This charge is collected to cover the additional handling and
                processing required for Cash on Delivery shipments.
              </p>
              <p className="mt-3">
                Customers can choose <strong className="font-semibold text-gray-900">Online Payment</strong> at
                checkout to avoid the additional COD charge.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900">Online Payment</h2>
              <p className="mt-3">
                Customers who choose <strong className="font-semibold text-gray-900">Online Payment</strong> at
                checkout are eligible for an instant discount, where applicable. The discount amount
                will be displayed during checkout before the order is placed.
              </p>
              <p className="mt-3">
                We recommend using Online Payment for a faster, more secure checkout experience and to
                enjoy available payment offers.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900">Order Inspection</h2>
              <p className="mt-3">
                Before shipping, every product is carefully checked for quality, damage, and
                completeness. We recommend that you also inspect your package at the time of
                delivery. If you receive a damaged, incorrect, or tampered package, please report it
                immediately.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900">Need Help?</h2>
              <p className="mt-3">
                If you have any questions regarding shipping, delivery, or your order, please contact
                us at{' '}
                <a
                  className="font-medium text-gray-900 underline"
                  href="mailto:kayraaura4u@gmail.com"
                >
                  kayraaura4u@gmail.com
                </a>
                . Our support team will be happy to assist you.
              </p>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
