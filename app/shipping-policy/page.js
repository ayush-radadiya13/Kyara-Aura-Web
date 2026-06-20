import Header from '@/components/Header';

export const metadata = {
  title: 'Shipping Policy | Kayra Aura',
  description: 'Review Kayra Aura shipping policy for Gold Plated Bangles for Women.',
};

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
          </header>

          <section className="space-y-4">
            <p>
              We ship all over India and strive to provide the best shipping rates to our customers.
              Orders placed Monday through Saturday (IST) are processed on the same or the following
              business day and will be shipped within two business days, subject to product
              availability in our warehouse.
            </p>
            <p>This shipping policy applies to Gold Plated Bangles for Women.</p>
            <p>
              If you would like to inquire about the delivery timeline of a specific product, please
              feel free to contact us before placing your order.
            </p>
            <p>
              Shipping charges vary depending on the order value and delivery location. The
              applicable shipping charges for your order will be calculated and displayed at checkout.
            </p>
            <p>
              The estimated delivery time for these products is 4–9 business days (maximum) from the
              date of dispatch.
            </p>
            <p>For any further questions or assistance, please don’t hesitate to contact us at</p>
          </section>
        </article>
      </main>
    </div>
  );
}
