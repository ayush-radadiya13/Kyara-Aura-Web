import Header from '@/components/Header';

export const metadata = {
  title: 'Privacy Policy | Kayra Aura',
  description:
    'Learn how Kayra Aura collects, uses, protects, and shares customer information.',
};

const usageItems = [
  'Process and deliver orders for imitation jewellery',
  'Provide order confirmations, updates, and customer support',
  'Improve website performance and shopping experience',
  'Analyze visitor traffic and usage patterns',
  'Inform customers about new designs, collections, and offers',
];

const rightsItems = [
  'Request access to the personal information we hold about you',
  'Ask us to correct incomplete or inaccurate information',
  'Request deletion of information that is no longer required for lawful business purposes',
  'Opt out of promotional communications at any time',
];

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white text-gray-950">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <article className="max-w-5xl text-sm leading-6 text-gray-600">
          <header className="mb-10">
            <h1 className="font-display text-3xl font-semibold text-gray-900 sm:text-4xl">
              Privacy Policy
            </h1>
            <div className="mt-6 space-y-4">
              <p>
                Your personal information is always kept confidential. This Privacy Policy explains
                how customer information is collected and used while browsing or purchasing
                imitation jewellery from our website.
              </p>
              <p>
                By using our website, you agree to the terms and conditions mentioned in this policy.
                It applies to all visitors, registered users, and customers, whether or not a
                transaction has been completed.
              </p>
              <p>
                Personal information is mainly used to identify or contact customers. Details such as
                name, address, phone number, email ID, and payment-related information are collected
                only when necessary and are always kept secure and confidential.
              </p>
            </div>
          </header>

          <section className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Terms of Our Privacy Policy</h2>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Personal Information We Collect
              </h3>
              <p className="mt-3">
                We collect only the information required to register, subscribe, contact us, or place
                an order. This may include your name, email address, phone number, billing address,
                shipping address, and order details. Our system may automatically collect your IP
                address and basic device or browser information to analyze website traffic, which
                does not personally identify any individual. We do not knowingly collect information
                from children.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900">Use of Collected Information</h3>
              <p className="mt-3">The personal information collected may be used to:</p>
              <ul className="mt-3 list-disc space-y-1 pl-6">
                {usageItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900">Payment Information</h3>
              <p className="mt-3">
                Payment details are processed through secure payment partners. We do not store full
                card numbers, CVV details, UPI PINs, or banking passwords on our website. Payment
                information may be used only to complete, verify, refund, or resolve issues related
                to your transaction.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900">Sharing of Information</h3>
              <p className="mt-3">
                Basic information such as delivery address and contact number may be shared with
                courier and logistics partners to ensure timely delivery. Limited information may
                also be shared with vendors strictly for order fulfillment purposes.
              </p>
              <p className="mt-3">
                We do not sell or disclose personal information to unauthorized third parties.
                Information may be disclosed to legal or government authorities if required by law.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900">Cookies Policy</h3>
              <p className="mt-3">
                Cookies are used to enhance your browsing experience, remember preferences, and track
                website usage. Cookies do not store personal information such as name, email address,
                phone number, or payment details. You may disable cookies through your browser
                settings, but some website features may not work properly.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900">Data Security and Retention</h3>
              <p className="mt-3">
                We use reasonable technical and organizational safeguards to protect customer
                information from unauthorized access, misuse, loss, or alteration. We retain personal
                information only for as long as necessary to process orders, provide support, comply
                with legal obligations, resolve disputes, and maintain business records.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900">Your Choices and Rights</h3>
              <p className="mt-3">You may contact us to:</p>
              <ul className="mt-3 list-disc space-y-1 pl-6">
                {rightsItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900">Third-Party Links</h3>
              <p className="mt-3">
                Our website may contain links to third-party websites. Once you leave our website,
                this Privacy Policy no longer applies, and we are not responsible for the privacy
                practices or content of other websites.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900">Policy Updates</h3>
              <p className="mt-3">
                We may update this Privacy Policy from time to time to reflect changes in our
                services, legal requirements, or business practices. Updated terms will be posted on
                this page and will apply from the date they are published.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900">Contact Us</h3>
              <p className="mt-3">
                For questions, corrections, or privacy-related requests, please contact us at{' '}
                <a className="font-medium text-gray-900 underline" href="mailto:kayraaura4u@gmail.com">
                  kayraaura4u@gmail.com
                </a>
                .
              </p>
            </div>

            <p className="pt-4">
              We are committed to providing a safe, secure, and elegant shopping experience for
              customers purchasing imitation jewellery from our website.
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}
