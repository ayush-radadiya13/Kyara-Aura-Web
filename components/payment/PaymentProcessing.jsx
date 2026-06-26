'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleCheck, ShieldCheck, XCircle } from 'lucide-react';
import { LoaderBlock } from '@/components/ui/loader';
import { APP_ROUTES } from '@/lib/routes';
import { useCartStore } from '@/lib/cart/store';
import { clearPendingPayment } from '@/lib/payment/pending-payment';
import { verifyRazorpayPaymentApi } from '@/services/checkout';
import { clearStoredScratchCoupon } from '@/services/scratch-card';
import { useAuthStore } from '@/store/auth-store';
import { getApiErrorMessage } from '@/utils/api-error';
import { getAuthStorageKey } from '@/utils/auth-response';

function readReturnParams() {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  return {
    orderId: params.get('order_id') ?? '',
    checkoutType: params.get('checkout_type') ?? 'cart',
    razorpayPaymentId: params.get('razorpay_payment_id') ?? '',
    razorpayOrderId: params.get('razorpay_order_id') ?? '',
    razorpaySignature: params.get('razorpay_signature') ?? '',
    error: params.get('error') ?? '',
  };
}

export default function PaymentProcessing() {
  const router = useRouter();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const clearCart = useCartStore((state) => state.clearCart);

  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');
  const startedRef = useRef(false);

  useEffect(() => {
    if (!isHydrated || startedRef.current) return;
    startedRef.current = true;

    const params = readReturnParams();
    setOrderId(params?.orderId ?? '');

    async function finalizePayment() {
      if (!isAuthenticated) {
        setStatus('error');
        setMessage('Please sign in again to confirm your payment status.');
        return;
      }

      if (!params?.razorpayPaymentId || !params?.razorpayOrderId || !params?.razorpaySignature) {
        setStatus('error');
        setMessage(
          params?.error ||
            'We could not confirm your payment. If any amount was deducted, it is safe — it will be auto-refunded or you can retry the payment.',
        );
        return;
      }

      try {
        const verifiedOrder = await verifyRazorpayPaymentApi({
          order_id: params.orderId,
          razorpay_order_id: params.razorpayOrderId,
          razorpay_payment_id: params.razorpayPaymentId,
          razorpay_signature: params.razorpaySignature,
        });

        if (params.checkoutType === 'cart') clearCart();
        clearStoredScratchCoupon(getAuthStorageKey(user, token));
        clearPendingPayment();

        const successId = verifiedOrder?.id ?? params.orderId;
        router.replace(APP_ROUTES.ORDER_SUCCESS(successId));
      } catch (verifyError) {
        setStatus('error');
        setMessage(getApiErrorMessage(verifyError, 'We could not verify your payment.'));
      }
    }

    finalizePayment();
  }, [isHydrated, isAuthenticated, user, token, clearCart, router]);

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      {status === 'verifying' ? (
        <div className="w-full">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-950 text-white">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-950">Confirming your payment</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
            Please wait while we securely verify your payment with Razorpay. Do not close or refresh
            this page.
          </p>
          <LoaderBlock className="mt-8 py-8" />
        </div>
      ) : (
        <div className="w-full">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-red-600">
            <XCircle className="h-10 w-10" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-gray-950">Payment not confirmed</h1>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {orderId ? (
              <Link
                href={APP_ROUTES.ORDER_SUCCESS(orderId)}
                className="inline-flex h-12 items-center justify-center bg-gray-950 px-7 text-sm font-bold text-white transition hover:bg-gray-800"
              >
                <CircleCheck className="mr-2 h-4 w-4" />
                Check order status
              </Link>
            ) : null}
            <Link
              href={APP_ROUTES.PAYMENT_METHOD}
              className="inline-flex h-12 items-center justify-center border border-gray-950 bg-white px-7 text-sm font-bold text-gray-950 transition hover:bg-gray-50"
            >
              Retry payment
            </Link>
            <Link
              href={APP_ROUTES.ORDERS}
              className="inline-flex h-12 items-center justify-center border border-gray-200 bg-white px-7 text-sm font-bold text-gray-700 transition hover:border-gray-950"
            >
              View my orders
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
