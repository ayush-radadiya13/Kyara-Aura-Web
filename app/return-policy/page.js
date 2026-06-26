import Header from '@/components/Header';

export const metadata = {
  title: 'Return & Refund Policy | Kayra Aura',
  description:
    'Review Kayra Aura return, refund, and cancellation terms for imitation jewellery, including the 3-day return window and quality inspection.',
};

const returnConditions = [
  'A return can be requested within 3 days of receiving your order.',
  'The product must be unused and in its original condition.',
  'All original packaging, tags, protective covers, and accessories must be included.',
  'You must upload clear images of the product when submitting your return request.',
  'The returned package must include every item that was originally delivered to you.',
];

const deliveryChecks = [
  'Open and inspect the package in front of the delivery person at the time of delivery.',
  'Check that the product is undamaged and that all items are present.',
  'Report any damage, missing item, or other issue immediately at the time of delivery.',
];

const rejectionReasons = [
  'Any originally delivered item is missing from the returned package.',
  'The product is damaged after delivery, used, or worn.',
  'Original packaging, tags, or accessories are missing.',
  'Clear images of the product are not provided with the return request.',
  'The return request is raised after the 3-day return window.',
];

export default function ReturnPolicyPage() {
  return (
    <div className="bg-white text-gray-950">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <article className="max-w-5xl text-sm leading-6 text-gray-600">
          <header className="mb-8">
            <h1 className="font-display text-3xl font-semibold text-gray-900 sm:text-4xl">
              Return & Refund Policy
            </h1>
            <p className="mt-5">
              We sell imitation jewellery only. This policy explains how to request a return,
              the conditions that must be met, and how refunds are processed. Please read it
              carefully before raising a return request.
            </p>
          </header>

          <section className="space-y-8">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Inspection at Delivery:</h2>
              <ul className="mt-3 list-disc space-y-1 pl-6">
                {deliveryChecks.map((check) => (
                  <li key={check}>{check}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900">Return Window and Conditions:</h2>
              <ul className="mt-3 list-disc space-y-1 pl-6">
                {returnConditions.map((condition) => (
                  <li key={condition}>{condition}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900">How to Request a Return:</h2>
              <ol className="mt-3 list-decimal space-y-1 pl-6">
                <li>
                  Raise your return request within 3 days of receiving the order by contacting us
                  at{' '}
                  <a
                    className="font-medium text-gray-900 underline"
                    href="mailto:kayraaura4u@gmail.com"
                  >
                    kayraaura4u@gmail.com
                  </a>
                  .
                </li>
                <li>Upload clear images of the product along with your return request.</li>
                <li>
                  Pack the product in its original packaging with all tags, protective covers, and
                  accessories, including every item that was originally delivered.
                </li>
              </ol>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900">When a Return or Refund May Be Rejected:</h2>
              <ul className="mt-3 list-disc space-y-1 pl-6">
                {rejectionReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900">Refund Policy:</h2>
              <ol className="mt-3 list-decimal space-y-1 pl-6">
                <li>
                  Every returned product goes through a quality inspection once we receive it.
                </li>
                <li>
                  Refunds are processed only after the returned product passes our quality
                  inspection.
                </li>
                <li>
                  Once approved, the refund is processed to the original payment method within 5–7
                  working days.
                </li>
              </ol>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900">Cancellation Policy:</h2>
              <ol className="mt-3 list-decimal space-y-1 pl-6">
                <li>Order cancellation requests must be made before the product is shipped.</li>
                <li>
                  Once the product is shipped, cancellation will not be possible through our website.
                </li>
              </ol>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900">Need Help?</h2>
              <p className="mt-3">
                For any questions or support regarding returns and refunds, contact us at{' '}
                <a
                  className="font-medium text-gray-900 underline"
                  href="mailto:kayraaura4u@gmail.com"
                >
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
