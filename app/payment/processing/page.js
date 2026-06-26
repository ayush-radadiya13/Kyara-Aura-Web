import Header from '@/components/Header';
import PaymentProcessing from '@/components/payment/PaymentProcessing';
import { noIndexMetadata } from '@/lib/seo';

export const metadata = noIndexMetadata({
  title: 'Confirming Payment | Kayra Aura',
  description: 'Confirming your Kayra Aura payment.',
  path: '/payment/processing',
});

export default function PaymentProcessingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <PaymentProcessing />
      </main>
    </div>
  );
}
