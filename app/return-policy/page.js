import Header from '@/components/Header';

export const metadata = {
  title: 'Return & Refund Policy | Kyara Aura',
  description: 'Review Kyara Aura cancellation, return, and refund terms.',
};

const refundReasons = [
  'Damaged or defective product',
  'Wrong or missing item',
  'Manufacturing defect',
];

const returnNotes = [
  'Bangles must be unused, unworn, and in original condition.',
  'Products should be returned with original packaging, tags, and protective covers intact.',
  'Items showing signs of use, scratches, discoloration, or damage will not be accepted.',
  'Customized, engraved, or made-to-order bangles are non-returnable and non-exchangeable.',
  'Slight variations in color or finish due to lighting or screen resolution are not considered defects.',
  'Return/Exchange requests raised after the specified return period (as mentioned on the product page) will not be accepted.',
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
          </header>

          <section className="space-y-8">
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
              <h2 className="text-base font-semibold text-gray-900">Return Policy:</h2>
              <ol className="mt-3 list-decimal space-y-1 pl-6">
                <li>
                  Returns and exchanges are applicable only to select products. Detailed return
                  eligibility and conditions are provided on the respective product pages. For most
                  products, the standard return window is 3 days.
                </li>
                <li>The return policy for any product is subject to change without prior notice.</li>
                <li>
                  In case we do not have pick up service available at your location, you would have
                  to self-ship the product to our office Address.
                </li>
                <li>Return/Exchange charges may apply on case to case basis.</li>
              </ol>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900">Refund Policy:</h2>
              <ol className="mt-3 list-decimal space-y-4 pl-6">
                <li>
                  <p>Refund requests are accepted only in case of:</p>
                  <ul className="mt-3 list-disc space-y-1 pl-6">
                    {refundReasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </li>
                <li>
                  Once the returned product is picked up and quality-checked, the refund will be
                  processed within 5–7 working days using the original payment method.
                </li>
              </ol>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900">Important Notes for Return:</h2>
              <ul className="mt-3 list-disc space-y-1 pl-6">
                {returnNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
