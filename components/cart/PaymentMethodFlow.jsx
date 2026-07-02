'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Drawer } from '@base-ui/react/drawer';
import {
  BadgeCheck,
  CreditCard,
  Edit3,
  Gem,
  Mail,
  MapPin,
  PackageCheck,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  Truck,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { apiToast } from '@/lib/api-toast';
import { LoaderBlock, LoadingLabel } from '@/components/ui/loader';
import IndianPhoneInput from '@/components/ui/indian-phone-input';
import { useScrollLock } from '@/hooks/use-scroll-lock';
import { formatInr } from '@/lib/cart/format';
import { useCartStore } from '@/lib/cart/store';
import { APP_ROUTES, AUTH_PAGE_ROUTES, withRedirect } from '@/lib/routes';
import {
  createAddressApi,
  createOrderApi,
  deleteAddressApi,
  getAddressesApi,
  getCheckoutSummaryApi,
  getOrderDetailApi,
  sendCodOrderOtpApi,
  setDefaultAddressApi,
  updateAddressApi,
} from '@/services/checkout';
import { getLineItemImageSrc } from '@/services/cart';
import {
  clearPendingPayment,
  getPendingPayment,
  setPendingPayment,
} from '@/lib/payment/pending-payment';
import ScratchCardOffer, { clearStoredScratchCoupon } from '@/components/cart/ScratchCardOffer';
import AddressRegionFields from '@/components/cart/AddressRegionFields';
import OrderSummary from '@/components/cart/OrderSummary';
import { normalizeOrderSummary, withOrderSummaryItemCount } from '@/lib/cart/order-summary';
import { useAuthStore } from '@/store/auth-store';
import { useVerifyOtp } from '@/hooks/auth';
import { getApiErrorMessage } from '@/utils/api-error';
import { getAuthStorageKey } from '@/utils/auth-response';
import { sanitizePincode, validateAddressForm } from '@/lib/address-validation';
import { sanitizeIndianPhoneDigits } from '@/lib/phone';
import { cn } from '@/lib/utils';

const PAYMENT_OPTIONS = [
  {
    id: 'online',
    title: 'Pay Online',
    description: 'Cards, UPI, wallet, and net banking with Razorpay.',
    badge: 'Razorpay secured',
    Icon: CreditCard,
  },
  {
    id: 'cod',
    title: 'Cash on Delivery',
    description: 'Convenient Cash on Delivery available for your order',
    badge: 'Pay later',
    Icon: Wallet,
  },
];

const PAYMENT_METHOD_ICONS = [
  { src: '/payment-icon/upi.svg', alt: 'UPI' },
  { src: '/payment-icon/visa.svg', alt: 'Visa' },
  { src: '/payment-icon/mastercard.svg', alt: 'Mastercard' },
  { src: '/payment-icon/rupay.svg', alt: 'RuPay' },
  { src: '/payment-icon/netbanking.svg', alt: 'Net Banking' },
  { src: '/payment-icon/wallet.svg', alt: 'Wallet' },
];

const TRUST_POINTS = [
  { label: 'Secure checkout', Icon: ShieldCheck },
  { label: 'Fast dispatch', Icon: Truck },
  { label: 'Quality assured', Icon: BadgeCheck },
];

const EMPTY_ADDRESS_FORM = {
  name: '',
  email: '',
  phone: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'India',
  landmark: '',
  address_type: 'home',
  is_default: false,
};

const PAID_PAYMENT_STATUSES = new Set([
  'paid',
  'captured',
  'completed',
  'success',
  'successful',
  'confirmed',
]);

function isOrderPaid(order) {
  const paymentStatus = String(order?.payment_status ?? '').trim().toLowerCase();
  if (PAID_PAYMENT_STATUSES.has(paymentStatus)) return true;

  const orderStatus = String(order?.status ?? '').trim().toLowerCase();
  return ['confirmed', 'processing', 'shipped', 'delivered', 'completed'].includes(orderStatus);
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function getSelectedAddress(addresses) {
  return addresses.find((address) => address?.is_default) ?? addresses[0] ?? null;
}

function getSummaryTotal(summary) {
  return Number(summary?.total_amount ?? summary?.total ?? 0);
}

function getItemQuantity(item) {
  const quantity = Number(item?.quantity);
  return Number.isFinite(quantity) ? quantity : 0;
}

function getItemTotal(item) {
  const rawTotal = item?.total ?? item?.line_total ?? item?.subtotal ?? item?.amount;
  if (rawTotal === undefined || rawTotal === null) return null;

  const total = Number(rawTotal);
  return Number.isFinite(total) ? total : null;
}

function getItemUnitPrice(item) {
  const rawPrice = item?.price ?? item?.unit_price ?? item?.selling_price;
  if (rawPrice !== undefined && rawPrice !== null) {
    const price = Number(rawPrice);
    return Number.isFinite(price) ? price : null;
  }

  const quantity = getItemQuantity(item);
  const total = getItemTotal(item);
  return quantity > 0 && total !== null ? total / quantity : null;
}

function getItemOriginalPrice(item) {
  const rawPrice = item?.mrp ?? item?.original_price ?? item?.regular_price ?? item?.list_price;
  if (rawPrice === undefined || rawPrice === null) return null;

  const price = Number(rawPrice);
  return Number.isFinite(price) ? price : null;
}

function getAddressText(address) {
  if (!address) return '';

  return [address.address_line_1, address.address_line_2, address.city, address.state, address.postal_code, address.country]
    .filter(Boolean)
    .join(', ');
}

function getAddressPayload(addressForm) {
  return {
    name: addressForm.name,
    email: addressForm.email,
    phone: addressForm.phone,
    address_line_1: addressForm.address_line_1,
    address_line_2: addressForm.address_line_2,
    city: addressForm.city,
    state: addressForm.state,
    postal_code: addressForm.postal_code,
    country: addressForm.country,
    landmark: addressForm.landmark,
    address_type: addressForm.address_type,
    is_default: Boolean(addressForm.is_default),
  };
}

function buildCheckoutPayload({ checkoutIntent, selectedAddressId, selectedMethod, couponCode }) {
  const payload = {
    checkout_type: checkoutIntent.checkout_type,
    address_id: Number(selectedAddressId),
    payment_method: selectedMethod,
  };

  if (couponCode) {
    payload.coupon_code = couponCode;
  }

  if (checkoutIntent.checkout_type === 'buy_now') {
    payload.product_size_id = Number(checkoutIntent.product_size_id);
    payload.quantity = Math.max(Number(checkoutIntent.quantity) || 1, 1);
  }

  return payload;
}

export default function PaymentMethodFlow({ initialCheckoutIntent = { checkout_type: 'cart' } }) {
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const storageUserKey = getAuthStorageKey(user, token);

  const [checkoutIntent] = useState(initialCheckoutIntent);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('online');
  const [scratchCoupon, setScratchCoupon] = useState(null);
  const [summary, setSummary] = useState(null);
  const [notes, setNotes] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [addressFormErrors, setAddressFormErrors] = useState({});
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressActionId, setAddressActionId] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [codOtpDialogOpen, setCodOtpDialogOpen] = useState(false);
  const [codOtp, setCodOtp] = useState('');
  const [codOtpError, setCodOtpError] = useState('');
  const verifyOtpMutation = useVerifyOtp();
  const [error, setError] = useState('');
  const [paymentNotice, setPaymentNotice] = useState('');
  const [pendingPaymentOrderId, setPendingPaymentOrderId] = useState('');
  const [checkingPendingPayment, setCheckingPendingPayment] = useState(false);

  const selectedAddress = useMemo(
    () => addresses.find((address) => String(address.id) === String(selectedAddressId)),
    [addresses, selectedAddressId],
  );
  const summaryItems = Array.isArray(summary?.items) ? summary.items : [];
  const hasSummary = Boolean(summary);
  const displayItems = hasSummary ? summaryItems : [];
  const visibleCount = summaryItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const payableTotal = hasSummary ? getSummaryTotal(summary) : 0;
  const couponCode = scratchCoupon?.coupon_code ?? '';
  const canPlaceOrder = Boolean(selectedAddressId && hasSummary && payableTotal > 0 && !placingOrder && !summaryLoading);

  // Fallback recovery: a UPI app cannot be forced to return the user to the browser, so when
  // they come back to this page we re-check the in-flight order. If the backend already marked
  // it paid (via the redirect callback or a Razorpay webhook), we forward to order success.
  const resolvePendingPayment = useCallback(
    async ({ silent = true } = {}) => {
      const pending = getPendingPayment();
      if (!pending?.orderId) {
        setPendingPaymentOrderId('');
        return false;
      }

      setPendingPaymentOrderId(String(pending.orderId));

      try {
        const orderDetail = await getOrderDetailApi(pending.orderId);

        if (isOrderPaid(orderDetail)) {
          if (pending.checkoutType === 'cart') clearCart();
          clearStoredScratchCoupon(storageUserKey);
          setScratchCoupon(null);
          clearPendingPayment();
          setPendingPaymentOrderId('');
          router.replace(APP_ROUTES.ORDER_SUCCESS(orderDetail?.id ?? pending.orderId));
          return true;
        }

        if (!silent) {
          apiToast.error('Payment is still being confirmed. Finish it in your UPI app, then check again.');
        }
        return false;
      } catch {
        if (!silent) {
          apiToast.error('Unable to check payment status right now. Please try again.');
        }
        return false;
      }
    },
    [clearCart, router, storageUserKey],
  );

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return undefined;

    let cancelled = false;

    const runCheck = () => {
      if (cancelled) return;
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      resolvePendingPayment({ silent: true });
    };

    runCheck();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') runCheck();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', runCheck);
    window.addEventListener('pageshow', runCheck);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', runCheck);
      window.removeEventListener('pageshow', runCheck);
    };
  }, [isHydrated, isAuthenticated, resolvePendingPayment]);

  const handleManualPendingCheck = async () => {
    setCheckingPendingPayment(true);
    try {
      await resolvePendingPayment({ silent: false });
    } finally {
      setCheckingPendingPayment(false);
    }
  };

  const dismissPendingPayment = () => {
    clearPendingPayment();
    setPendingPaymentOrderId('');
  };

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) return;

    let isCurrent = true;

    async function loadCheckoutData() {
      setLoading(true);
      setError('');

      try {
        const addressList = await getAddressesApi();
        if (!isCurrent) return;

        setAddresses(Array.isArray(addressList) ? addressList : []);

        const defaultAddress = getSelectedAddress(Array.isArray(addressList) ? addressList : []);
        if (defaultAddress) {
          setSelectedAddressId(String(defaultAddress.id));
        } else {
          setShowAddressForm(true);
        }
      } catch (checkoutError) {
        if (isCurrent) {
          setError(getApiErrorMessage(checkoutError, 'Unable to load checkout details.'));
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    loadCheckoutData();

    return () => {
      isCurrent = false;
    };
  }, [isAuthenticated, isHydrated]);

  useEffect(() => {
    if (!selectedAddressId || !isAuthenticated) {
      return;
    }

    if (checkoutIntent.checkout_type === 'buy_now' && !checkoutIntent.product_size_id) {
      return;
    }

    let isCurrent = true;

    async function loadSummary() {
      setSummaryLoading(true);
      setSummary(null);
      setError('');

      try {
        const payload = buildCheckoutPayload({ checkoutIntent, selectedAddressId, selectedMethod, couponCode });
        const checkoutSummary = await getCheckoutSummaryApi(payload);
        if (isCurrent) setSummary(checkoutSummary);
      } catch (summaryError) {
        if (isCurrent) {
          setSummary(null);
          setError(getApiErrorMessage(summaryError, 'Unable to generate checkout summary.'));
        }
      } finally {
        if (isCurrent) setSummaryLoading(false);
      }
    }

    loadSummary();

    return () => {
      isCurrent = false;
    };
  }, [checkoutIntent, couponCode, isAuthenticated, selectedAddressId, selectedMethod]);

  const setAddressField = (field, value) => {
    const nextValue =
      field === 'postal_code'
        ? sanitizePincode(value)
        : field === 'phone'
          ? sanitizeIndianPhoneDigits(value)
          : value;

    setAddressForm((current) => ({ ...current, [field]: nextValue }));

    if (addressFormErrors[field]) {
      setAddressFormErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateAddressForm(addressForm);
    if (Object.keys(validationErrors).length) {
      setAddressFormErrors(validationErrors);
      return;
    }

    setSavingAddress(true);
    setError('');

    try {
      const payload = getAddressPayload(addressForm);
      const savedAddress = editingAddressId
        ? await updateAddressApi(editingAddressId, payload)
        : await createAddressApi(payload);
      const nextAddresses = await getAddressesApi();
      const normalizedAddresses = Array.isArray(nextAddresses) ? nextAddresses : [];
      const addressToSelect = savedAddress?.id ? savedAddress : getSelectedAddress(normalizedAddresses);

      setAddresses(normalizedAddresses);
      if (addressToSelect?.id) {
        setSelectedAddressId(String(addressToSelect.id));
      }
      setAddressForm(EMPTY_ADDRESS_FORM);
      setAddressFormErrors({});
      setEditingAddressId(null);
      setShowAddressForm(false);
      apiToast.success(editingAddressId ? 'Address updated successfully.' : 'Address saved successfully.');
    } catch (addressError) {
      setError(getApiErrorMessage(addressError, 'Unable to save delivery address.'));
    } finally {
      setSavingAddress(false);
    }
  };

  const startAddressEdit = (address) => {
    setEditingAddressId(address.id);
    setAddressFormErrors({});
    setAddressForm({
      ...EMPTY_ADDRESS_FORM,
      name: address.name ?? '',
      email: address.email ?? '',
      phone: sanitizeIndianPhoneDigits(address.phone ?? ''),
      address_line_1: address.address_line_1 ?? '',
      address_line_2: address.address_line_2 ?? '',
      city: address.city ?? '',
      state: address.state ?? '',
      postal_code: sanitizePincode(address.postal_code ?? ''),
      country: address.country ?? 'India',
      landmark: address.landmark ?? '',
      address_type: address.address_type ?? 'home',
      is_default: Boolean(address.is_default),
    });
    setShowAddressForm(true);
  };

  const openNewAddressDrawer = () => {
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS_FORM);
    setAddressFormErrors({});
    setShowAddressForm(true);
  };

  const closeAddressDrawer = () => {
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS_FORM);
    setAddressFormErrors({});
    setShowAddressForm(false);
  };

  const refreshAddresses = async (addressIdToSelect) => {
    const nextAddresses = await getAddressesApi();
    const normalizedAddresses = Array.isArray(nextAddresses) ? nextAddresses : [];
    setAddresses(normalizedAddresses);

    if (addressIdToSelect) {
      setSelectedAddressId(String(addressIdToSelect));
      return;
    }

    const defaultAddress = getSelectedAddress(normalizedAddresses);
    setSelectedAddressId(defaultAddress?.id ? String(defaultAddress.id) : '');
  };

  const handleSetDefaultAddress = async (addressId) => {
    setAddressActionId(addressId);
    setError('');

    try {
      await setDefaultAddressApi(addressId);
      // Update in place so the address keeps its position in the list; only the
      // default flag changes (re-fetching would reorder the default to the top).
      setAddresses((current) =>
        current.map((address) => ({
          ...address,
          is_default: String(address.id) === String(addressId),
        })),
      );
      setSelectedAddressId(String(addressId));
    } catch (addressError) {
      setError(getApiErrorMessage(addressError, 'Unable to set default address.'));
    } finally {
      setAddressActionId(null);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Delete this address?')) return;

    setAddressActionId(addressId);
    setError('');

    try {
      await deleteAddressApi(addressId);
      await refreshAddresses(String(selectedAddressId) === String(addressId) ? null : selectedAddressId);
      apiToast.success('Address deleted successfully.');
    } catch (addressError) {
      setError(getApiErrorMessage(addressError, 'Unable to delete address.'));
    } finally {
      setAddressActionId(null);
    }
  };

  const openRazorpayPayment = async ({ order, razorpay }) => {
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      throw new Error('Razorpay SDK failed to load. Please check your connection and try again.');
    }

    // Redirect mode (vs the JS `handler` callback) is Razorpay's recommended flow for
    // mobile UPI: payment happens in an external app (GPay/PhonePe/Paytm) and the browser
    // tab is frequently discarded while backgrounded. A top-level redirect to callback_url
    // survives that, whereas an in-page handler closure would be lost and the order stranded.
    const callbackUrl = new URL(APP_ROUTES.PAYMENT_CALLBACK, window.location.origin);
    callbackUrl.searchParams.set('order_id', String(order.id));
    callbackUrl.searchParams.set('checkout_type', checkoutIntent.checkout_type);

    return new Promise((resolve, reject) => {
      const paymentObject = new window.Razorpay({
        key: razorpay.key,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: razorpay.name,
        description: razorpay.description,
        order_id: razorpay.order_id,
        prefill: razorpay.prefill,
        redirect: true,
        callback_url: callbackUrl.toString(),
        modal: {
          ondismiss: () => {
            // On success the page navigates away to callback_url, so this only fires when
            // the user closes checkout without completing payment.
            reject(new Error('Payment window closed before completion. Your order is still pending — you can retry the payment.'));
          },
        },
        theme: {
          color: '#111827',
        },
      });

      paymentObject.on('payment.failed', (response) => {
        reject(new Error(response?.error?.description || 'Payment failed. Please try again.'));
      });

      paymentObject.open();

      // Intentionally no resolve(): a successful payment triggers a full-page redirect to
      // callback_url, which finalizes verification on the dedicated processing page.
      void resolve;
    });
  };

  const getOrderPayload = (extraPayload = {}) => ({
    ...buildCheckoutPayload({ checkoutIntent, selectedAddressId, selectedMethod, couponCode }),
    ...(notes.trim() ? { notes: notes.trim() } : {}),
    ...extraPayload,
  });

  const completeOrder = async (payload, paymentMethod) => {
    const orderResponse = await createOrderApi(payload);
    const order = orderResponse?.order;
    const razorpay = orderResponse?.razorpay;

    if (!order?.id) {
      throw new Error('Order response is missing order details.');
    }

    if (paymentMethod === 'cod') {
      if (checkoutIntent.checkout_type === 'cart') clearCart();
      clearStoredScratchCoupon(storageUserKey);
      setScratchCoupon(null);
      router.push(`/order-success/${order.id}`);
      return;
    }

    if (!razorpay) {
      throw new Error('Razorpay checkout data missing.');
    }

    // Persist the in-flight payment so we can recover the order if the user returns to the
    // site without the callback completing (e.g. closed the tab while in their UPI app).
    setPendingPayment({
      orderId: order.id,
      checkoutType: checkoutIntent.checkout_type,
      razorpayOrderId: razorpay.order_id,
    });
    setPendingPaymentOrderId(String(order.id));

    // On success Razorpay redirects to the callback page, which verifies the payment, clears
    // the cart/coupon, and lands on the order-success page. We only return here when the user
    // dismisses checkout without paying (openRazorpayPayment rejects in that case).
    await openRazorpayPayment({ order, razorpay });
  };

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder) return;

    setPlacingOrder(true);
    setError('');
    setPaymentNotice('');
    setCodOtpError('');

    try {
      if (selectedMethod === 'cod') {
        const response = await sendCodOrderOtpApi({ address_id: Number(selectedAddressId) });
        setCodOtp('');
        setCodOtpDialogOpen(true);
        apiToast.success(response?.message || 'OTP sent for Cash on Delivery.');
        return;
      }

      await completeOrder(getOrderPayload(), selectedMethod);
    } catch (orderError) {
      const fallbackMessage = selectedMethod === 'cod'
        ? 'Unable to send OTP for Cash on Delivery.'
        : 'Unable to place your order.';
      const message = getApiErrorMessage(orderError, fallbackMessage);
      setError(message);

      const status = orderError?.response?.status;
      if (status === 409 || message.toLowerCase().includes('manual review') || message.toLowerCase().includes('stock is no longer available')) {
        setPaymentNotice('Payment was captured, but stock could not be confirmed. Please contact support with your order details.');
      } else if (message.toLowerCase().includes('pending')) {
        setPaymentNotice(message);
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleCodOtpChange = (value) => {
    setCodOtp(value.replace(/\D/g, '').slice(0, 6));
    if (codOtpError) setCodOtpError('');
  };

  const closeCodOtpDialog = () => {
    if (placingOrder) return;

    setCodOtpDialogOpen(false);
    setCodOtp('');
    setCodOtpError('');
  };

  const handleSubmitCodOtp = async () => {
    const normalizedOtp = codOtp.trim();
    if (!/^\d{6}$/.test(normalizedOtp)) {
      apiToast.error('Please enter the 6-digit OTP.');
      return;
    }

    setPlacingOrder(true);
    setError('');
    setPaymentNotice('');
    setCodOtpError('');

    try {
      await verifyOtpMutation.mutateAsync({
        payload: {
          purpose: 'cod_order',
          address_id: Number(selectedAddressId),
          otp: normalizedOtp,
        },
        useAuth: true,
      });
      await completeOrder(getOrderPayload({ cod_otp: normalizedOtp }), 'cod');
      setCodOtpDialogOpen(false);
    } catch (orderError) {
      apiToast.error(getApiErrorMessage(orderError, 'Unable to verify OTP and place your order.'));
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!isHydrated || (isAuthenticated && loading)) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <LoaderBlock />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <ShieldCheck className="mx-auto h-12 w-12 text-gray-950" />
          <h1 className="mt-5 text-3xl font-bold text-gray-950">Sign in to checkout</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600">
            Checkout, addresses, orders, and Razorpay verification are protected. Please login before placing an order.
          </p>
          <Link
            href={withRedirect(AUTH_PAGE_ROUTES.LOGIN, APP_ROUTES.PAYMENT_METHOD)}
            className="mt-7 inline-flex h-12 items-center justify-center bg-gray-950 px-7 text-sm font-bold text-white transition hover:bg-gray-800"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="mx-auto w-full max-w-7xl px-4 py-2 sm:py-4">
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
            Payment Method
          </h1>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-start">
          <div className="space-y-4">
            <AddressSection
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              selectedAddress={selectedAddress}
              showAddressForm={showAddressForm}
              addressForm={addressForm}
              addressFormErrors={addressFormErrors}
              editingAddressId={editingAddressId}
              savingAddress={savingAddress}
              addressActionId={addressActionId}
              onSelectAddress={setSelectedAddressId}
              onOpenNewAddress={openNewAddressDrawer}
              onCloseDrawer={closeAddressDrawer}
              onAddressFieldChange={setAddressField}
              onAddressSubmit={handleAddressSubmit}
              onEditAddress={startAddressEdit}
              onDeleteAddress={handleDeleteAddress}
              onSetDefaultAddress={handleSetDefaultAddress}
            />

            <ProductDetailsSection
              items={displayItems}
              visibleCount={visibleCount}
              hasSummary={hasSummary}
              summaryLoading={summaryLoading}
            />
          </div>

          <aside className="flex flex-col gap-3 bg-white xl:sticky xl:top-24">
            <div className="shrink-0 space-y-3">
              <PaymentMethodSection selectedMethod={selectedMethod} onSelectMethod={setSelectedMethod} />

              <ScratchCardOffer
                initialCoupon={scratchCoupon}
                onCouponChange={setScratchCoupon}
                compact
              />
            </div>

            <OrderSummary
              summary={
                summary
                  ? withOrderSummaryItemCount(normalizeOrderSummary(summary), visibleCount)
                  : null
              }
              loading={summaryLoading}
              showOnlinePaymentDiscount={selectedMethod === 'online'}
              showCodCharge={selectedMethod === 'cod'}
              emptyMessage="Select a delivery address to load your order summary with subtotal, tax, shipping, and discounts."
            />

            <section className="shrink-0 rounded-xl border border-gray-200 bg-white p-4">
              <label htmlFor="order-notes" className="text-sm font-bold text-gray-950">
                Order notes
              </label>
              <textarea
                id="order-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={2}
                placeholder="Gift packing or delivery instructions"
                className="mt-3 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-950"
              />
            </section>

            <div className="grid shrink-0 grid-cols-3 gap-2 rounded-xl border border-gray-200 bg-white p-3">
              {TRUST_POINTS.map(({ label, Icon }) => (
                <div key={label} className="text-center">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-900">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="mt-2 text-[11px] font-bold leading-4 text-gray-950">{label}</p>
                </div>
              ))}
            </div>

            <CheckoutAction
              total={payableTotal}
              selectedMethod={selectedMethod}
              disabled={!canPlaceOrder}
              loading={placingOrder}
              onClick={handlePlaceOrder}
              className="hidden shrink-0 lg:flex"
            />
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white px-4 py-3 lg:hidden">
        <div className="mx-auto max-w-6xl">
          <CheckoutAction
            total={payableTotal}
            selectedMethod={selectedMethod}
            disabled={!canPlaceOrder}
            loading={placingOrder}
            onClick={handlePlaceOrder}
          />
        </div>
      </div>

      <CodOtpDialog
        open={codOtpDialogOpen}
        phone={selectedAddress?.phone}
        otp={codOtp}
        error={codOtpError}
        loading={placingOrder}
        onOtpChange={handleCodOtpChange}
        onClose={closeCodOtpDialog}
        onSubmit={handleSubmitCodOtp}
      />
    </div>
  );
}

function CodOtpDialog({ open, phone, otp, error, loading, onOtpChange, onClose, onSubmit }) {
  useScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cod-otp-title"
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close OTP popup"
        onClick={onClose}
        disabled={loading}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl" data-lenis-prevent>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="cod-otp-title" className="text-lg font-extrabold text-gray-950">
              Verify COD OTP
            </h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-gray-500">
              {phone
                ? <>Enter the 6-digit OTP sent to <span className="font-bold text-gray-950">{phone}</span> for your Cash on Delivery order.</>
                : 'Enter the 6-digit OTP sent for your Cash on Delivery order.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label htmlFor="cod-otp" className="mt-5 block text-xs font-bold uppercase tracking-wide text-gray-500">
          OTP
        </label>
        <input
          id="cod-otp"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          maxLength={6}
          value={otp}
          onChange={(event) => onOtpChange(event.target.value)}
          disabled={loading}
          autoFocus
          className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-center text-xl font-extrabold tracking-[0.45em] text-gray-950 outline-none transition placeholder:tracking-normal focus:border-gray-950 disabled:opacity-60"
          placeholder="000000"
        />
        {error ? <p className="mt-2 text-xs font-semibold text-red-600">{error}</p> : null}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-gray-200 px-4 text-sm font-bold text-gray-700 transition hover:border-gray-950 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-[#C99B4D] px-4 text-sm font-bold text-primary-foreground transition hover:bg-[#C99B4D]/90 disabled:opacity-50"
          >
            {loading ? (
              <LoadingLabel spinnerClassName="border-white border-t-transparent">
                Placing order...
              </LoadingLabel>
            ) : (
              'Verify & Place'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ProductDetailsSection({ items, visibleCount, hasSummary, summaryLoading }) {
  return (
    <section aria-labelledby="payment-bag-heading" className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-4 py-2 sm:px-5">
        <div>
          <h2 id="payment-bag-heading" className="text-lg font-bold text-gray-950">
            Product Details
          </h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-bold text-gray-950">
          <PackageCheck className="h-4 w-4" />
          {visibleCount} {visibleCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      {summaryLoading && !hasSummary ? (
        <LoaderBlock className="m-5 rounded-2xl border border-gray-100 bg-white py-12" />
      ) : items.length === 0 ? (
        <div className="m-5 rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center">
          <Gem className="mx-auto h-10 w-10 text-gray-950" />
          <p className="mt-4 text-sm font-bold text-gray-950">No products found.</p>
          <Link href={APP_ROUTES.PRODUCTS} className="mt-3 inline-flex text-sm font-bold text-gray-950 underline underline-offset-4">
            Continue shopping
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((item, index) => {
            const quantity = getItemQuantity(item);
            const productTotal = getItemTotal(item);
            const unitPrice = getItemUnitPrice(item);
            const originalPrice = getItemOriginalPrice(item);
            const productName = item.product_name ?? item.title ?? 'Product';
            const productSize = item.size_text ?? item.sizeLabel ?? item.size;
            const image = getLineItemImageSrc(item);
            const slug = item.product_slug ?? item.slug;
            const visiblePrice = unitPrice ?? productTotal;
            const discountPercent =
              originalPrice && visiblePrice && originalPrice > visiblePrice
                ? Math.round(((originalPrice - visiblePrice) / originalPrice) * 100)
                : null;

            return (
              <li key={`${item.product_size_id ?? item.productSizeId ?? item.id}-${index}`} className="p-4 sm:p-5">
                <div className="grid gap-4 rounded-2xl bg-white sm:grid-cols-[96px_minmax(0,1fr)]">
                  <Link
                    href={slug ? `${APP_ROUTES.PRODUCTS}/${slug}` : APP_ROUTES.PRODUCTS}
                    className="relative h-28 w-24 overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:bg-gray-50 sm:h-28 sm:w-24"
                  >
                    {image ? (
                      <Image src={image} alt={productName} fill className="object-cover" sizes="96px" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-950">
                        <Gem className="h-8 w-8" />
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={slug ? `${APP_ROUTES.PRODUCTS}/${slug}` : APP_ROUTES.PRODUCTS}
                          className="line-clamp-2 max-w-xl text-sm font-bold leading-5 text-gray-950 transition hover:text-gray-700 sm:text-base"
                        >
                          {productName}
                        </Link>
                        <p className="mt-1 text-xs font-semibold text-gray-500">
                          {productSize ? `${productSize} · ` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        className="inline-flex h-9 items-center rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-950"
                      >
                        Qty: {quantity || item.quantity || 1}
                      </button>

                      <div className="flex flex-wrap items-baseline gap-2 text-right">
                        {discountPercent ? <span className="text-sm font-extrabold text-gray-700">{discountPercent}% off</span> : null}
                        {originalPrice && visiblePrice && originalPrice > visiblePrice ? (
                          <span className="text-sm font-bold text-gray-400 line-through">{formatInr(originalPrice)}</span>
                        ) : null}
                        <span className="text-xl font-bold text-gray-950">
                          {visiblePrice !== null ? formatInr(visiblePrice) : '-'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-gray-500">
                      {productTotal !== null ? <span>Item total: {formatInr(productTotal)}</span> : null}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function AddressSection({
  addresses,
  selectedAddressId,
  selectedAddress,
  showAddressForm,
  addressForm,
  addressFormErrors,
  editingAddressId,
  savingAddress,
  addressActionId,
  onSelectAddress,
  onOpenNewAddress,
  onCloseDrawer,
  onAddressFieldChange,
  onAddressSubmit,
  onEditAddress,
  onDeleteAddress,
  onSetDefaultAddress,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-2 sm:px-5">
        <div>
          <h2 className="text-lg font-bold text-gray-950">Customer Details</h2>
        </div>
        <button
          type="button"
          onClick={onOpenNewAddress}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-bold text-gray-950 transition hover:border-gray-950"
        >
          {selectedAddress ? 'Change' : 'Add Address'}
        </button>
      </div>

      {selectedAddress ? (
        <div className="px-2 py-2 sm:px-4">
          <div className=" bg-white">
            <dl className="space-y-2 text-sm leading-6">
              <div className="flex gap-2">
                <dt className="shrink-0 font-bold text-gray-950">Name:</dt>
                <dd className="min-w-0 font-semibold text-gray-700">{selectedAddress.name || '-'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 font-bold text-gray-950">Mobile:</dt>
                <dd className="min-w-0 font-semibold text-gray-700">{selectedAddress.phone || '-'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 font-bold text-gray-950">Email:</dt>
                <dd className="min-w-0 break-words font-semibold text-gray-700">{selectedAddress.email || '-'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 font-bold text-gray-950">Address:</dt>
                <dd className="min-w-0 font-semibold text-gray-700">{getAddressText(selectedAddress) || '-'}</dd>
              </div>
            </dl>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4 sm:px-5">
          <button
            type="button"
            onClick={onOpenNewAddress}
            className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white p-4 text-left transition hover:border-gray-950"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-950">
              <MapPin className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-extrabold text-gray-950">No delivery address yet.</span>
            </span>
          </button>
        </div>
      )}

      <AddressDrawer
        open={showAddressForm}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        addressForm={addressForm}
        addressFormErrors={addressFormErrors}
        editingAddressId={editingAddressId}
        savingAddress={savingAddress}
        addressActionId={addressActionId}
        onOpenChange={(open) => {
          if (!open) onCloseDrawer();
        }}
        onSelectAddress={onSelectAddress}
        onOpenNewAddress={onOpenNewAddress}
        onAddressFieldChange={onAddressFieldChange}
        onAddressSubmit={onAddressSubmit}
        onEditAddress={onEditAddress}
        onDeleteAddress={onDeleteAddress}
        onSetDefaultAddress={onSetDefaultAddress}
      />
    </section>
  );
}

function AddressDrawer({
  open,
  addresses,
  selectedAddressId,
  addressForm,
  addressFormErrors,
  editingAddressId,
  savingAddress,
  addressActionId,
  onOpenChange,
  onSelectAddress,
  onOpenNewAddress,
  onAddressFieldChange,
  onAddressSubmit,
  onEditAddress,
  onDeleteAddress,
  onSetDefaultAddress,
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-[60] bg-gray-950/45 backdrop-blur-sm transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Drawer.Viewport>
          <Drawer.Popup className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-[min(100vw,35rem)] flex-col bg-white shadow-[-28px_0_80px_rgba(17,24,39,0.18)] outline-none transition-transform duration-300 data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full lg:w-[35vw]">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-5">
              <div>
                <Drawer.Title className="text-xl font-extrabold text-gray-950">
                  {editingAddressId ? 'Edit Address' : 'Address Details'}
                </Drawer.Title>
              </div>
              <Drawer.Close className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200" aria-label="Close address drawer">
                <X className="h-5 w-5" />
              </Drawer.Close>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5" data-lenis-prevent>
              {addresses.length > 0 ? (
                <div className="mb-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-extrabold text-gray-950">Saved addresses</h3>
                    <button type="button" onClick={onOpenNewAddress} className="inline-flex items-center gap-1 text-xs font-extrabold text-gray-950">
                      <Plus className="h-3.5 w-3.5" />
                      New address
                    </button>
                  </div>
                  <div className="space-y-2">
                    {addresses.map((address) => (
                      <SavedAddressCard
                        key={address.id}
                        address={address}
                        isSelected={String(address.id) === String(selectedAddressId)}
                        addressActionId={addressActionId}
                        onSelectAddress={onSelectAddress}
                        onEditAddress={onEditAddress}
                        onDeleteAddress={onDeleteAddress}
                        onSetDefaultAddress={onSetDefaultAddress}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              <AddressForm
                addressForm={addressForm}
                addressFormErrors={addressFormErrors}
                editingAddressId={editingAddressId}
                savingAddress={savingAddress}
                onAddressFieldChange={onAddressFieldChange}
                onAddressSubmit={onAddressSubmit}
              />
            </div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function SavedAddressCard({
  address,
  isSelected,
  addressActionId,
  onSelectAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefaultAddress,
}) {
  const isUpdating = addressActionId === address.id;

  const handleSelect = () => {
    if (isUpdating) return;
    onSelectAddress(String(address.id));
    if (!address.is_default) {
      onSetDefaultAddress(address.id);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      className={`cursor-pointer rounded-2xl border bg-white p-3 transition ${isSelected ? 'border-gray-950' : 'border-gray-200 hover:border-gray-400'}`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isSelected ? 'border-gray-950 bg-gray-950' : 'border-gray-300 bg-white'}`}
        >
          {isSelected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-left text-sm font-extrabold text-gray-950">{address.name}</span>
            {address.address_type ? (
              <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-700">
                {address.address_type}
              </span>
            ) : null}
            {address.is_default ? (
              <span className="rounded-full bg-gray-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Default
              </span>
            ) : null}
            {isUpdating ? <LoadingLabel className="text-[10px] font-bold text-gray-500">Setting default...</LoadingLabel> : null}
          </div>
          <p className="mt-2 text-xs leading-5 text-gray-600">{getAddressText(address)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEditAddress(address);
              }}
              disabled={isUpdating}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-bold text-gray-700 transition hover:border-gray-950 hover:text-gray-950 disabled:opacity-50"
            >
              <Edit3 className="h-3 w-3" />
              Edit
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDeleteAddress(address.id);
              }}
              disabled={isUpdating}
              className="inline-flex items-center gap-1 rounded-full border border-red-100 px-3 py-1 text-xs font-bold text-red-700 transition hover:border-red-300 disabled:opacity-50"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddressForm({
  addressForm,
  addressFormErrors,
  editingAddressId,
  savingAddress,
  onAddressFieldChange,
  onAddressSubmit,
}) {
  return (
    <form onSubmit={onAddressSubmit} noValidate className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-2">
      <AddressInput
        id="address-name"
        label="Name"
        icon={User}
        value={addressForm.name}
        onChange={(value) => onAddressFieldChange('name', value)}
        error={addressFormErrors.name}
        required
        className="sm:col-span-2"
      />
      <AddressInput
        id="address-email"
        label="Email"
        type="email"
        icon={Mail}
        value={addressForm.email}
        onChange={(value) => onAddressFieldChange('email', value)}
        error={addressFormErrors.email}
        required
        className="sm:col-span-2"
      />
      <AddressInput
        id="address-phone"
        label="Phone"
        inputKind="phone"
        value={addressForm.phone}
        onChange={(value) => onAddressFieldChange('phone', value)}
        error={addressFormErrors.phone}
        required
        className="sm:col-span-2"
      />
      <AddressTextarea
        id="address-line-1"
        label="Address line 1"
        value={addressForm.address_line_1}
        onChange={(value) => onAddressFieldChange('address_line_1', value)}
        placeholder="Flat no. / House no. / Street"
        error={addressFormErrors.address_line_1}
        required
        className="sm:col-span-2"
      />
      <AddressTextarea
        id="address-line-2"
        label="Address line 2"
        value={addressForm.address_line_2}
        onChange={(value) => onAddressFieldChange('address_line_2', value)}
        placeholder="Area / Locality / Landmark (optional)"
        className="sm:col-span-2"
      />
      <AddressRegionFields
        state={addressForm.state}
        city={addressForm.city}
        onStateChange={(value) => onAddressFieldChange('state', value)}
        onCityChange={(value) => onAddressFieldChange('city', value)}
        stateError={addressFormErrors.state}
        cityError={addressFormErrors.city}
      />
      <AddressInput
        id="address-postal-code"
        label="Pin code"
        inputMode="numeric"
        maxLength={6}
        value={addressForm.postal_code}
        onChange={(value) => onAddressFieldChange('postal_code', value)}
        error={addressFormErrors.postal_code}
        required
      />
      <AddressField label="Country" htmlFor="address-country">
        <div className="flex h-11 w-full min-w-0 items-center gap-2.5 rounded-2xl border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-600">
          <input
            id="address-country"
            type="text"
            value="India"
            readOnly
            aria-readonly="true"
            tabIndex={-1}
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm leading-none outline-none ring-0 focus:ring-0"
          />
        </div>
      </AddressField>
      <AddressInput
        id="address-landmark"
        label="Landmark"
        value={addressForm.landmark}
        onChange={(value) => onAddressFieldChange('landmark', value)}
      />
      <AddressField label="Address type" className="min-w-0">
        <select
          id="address-type"
          value={addressForm.address_type}
          onChange={(event) => onAddressFieldChange('address_type', event.target.value)}
          className="h-11 w-full min-w-0 rounded-2xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-gray-950"
        >
          <option value="home">Home</option>
          <option value="work">Work</option>
          <option value="other">Other</option>
        </select>
      </AddressField>
      <label className="flex min-w-0 items-center gap-2 self-end text-sm font-semibold text-gray-700">
        <input
          type="checkbox"
          checked={addressForm.is_default}
          onChange={(event) => onAddressFieldChange('is_default', event.target.checked)}
          className="h-4 w-4 shrink-0 rounded border-gray-300"
        />
        Set as default
      </label>
      <button
        type="submit"
        disabled={savingAddress}
        className="h-12 rounded-full bg-gray-950 px-5 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
      >
        {savingAddress ? (
          <LoadingLabel spinnerClassName="border-white border-t-transparent">
            Saving address...
          </LoadingLabel>
        ) : editingAddressId ? (
          'Update Address'
        ) : (
          'Save Address'
        )}
      </button>
    </form>
  );
}

function AddressField({ label, error, className = '', children, htmlFor }) {
  return (
    <div className={cn('min-w-0 space-y-1', className)}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className="block text-xs font-bold uppercase tracking-wide text-gray-500">
          {label}
        </label>
      ) : (
        <span className="block text-xs font-bold uppercase tracking-wide text-gray-500">{label}</span>
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function AddressTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = '',
}) {
  return (
    <AddressField label={label} error={error} htmlFor={id} className={className}>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={2}
        className={cn(
          'w-full min-w-0 resize-none rounded-2xl border bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-950',
          error ? 'border-red-300 focus:border-red-500' : 'border-gray-200',
        )}
      />
    </AddressField>
  );
}

function AddressInput({
  id,
  label,
  value,
  onChange,
  type = 'text',
  inputKind,
  inputMode,
  maxLength,
  icon: Icon,
  required = false,
  error,
  className = '',
}) {
  const fieldClassName = cn(
    'flex h-11 w-full min-w-0 items-center gap-2.5 px-3.5 outline-none transition focus-within:border-gray-950',
    error ? 'border-red-300 focus-within:border-red-500' : 'border-gray-200',
    'rounded-2xl border bg-white text-sm',
  );

  if (inputKind === 'phone') {
    return (
      <AddressField label={label} error={error} htmlFor={id} className={className}>
        <IndianPhoneInput
          id={id}
          value={value}
          onChange={onChange}
          showIcon
          className={fieldClassName}
        />
      </AddressField>
    );
  }

  return (
    <AddressField label={label} error={error} htmlFor={id} className={className}>
      <div className={cn(fieldClassName, !Icon && 'px-3.5')}>
        {Icon ? (
          <Icon
            className="h-[18px] w-[18px] shrink-0 text-gray-400"
            aria-hidden
          />
        ) : null}
        <input
          id={id}
          type={inputMode === 'numeric' ? 'tel' : type}
          inputMode={inputMode}
          maxLength={maxLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm leading-none outline-none ring-0 focus:ring-0"
        />
      </div>
    </AddressField>
  );
}

function PaymentMethodSection({ selectedMethod, onSelectMethod }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-950">
            <CreditCard className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-gray-950">Payment Method</h2>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {PAYMENT_OPTIONS.map(({ id, title, description, Icon }) => {
          const isSelected = selectedMethod === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectMethod(id)}
              className={`flex w-full items-start gap-3 rounded-xl border bg-white p-3 text-left transition sm:gap-3 ${
                isSelected ? 'border-gray-950' : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isSelected ? 'border-gray-950 bg-gray-950' : 'border-gray-300 bg-white'}`}>
                {isSelected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
              </span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-950">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-gray-950">{title}</span>
                </span>
                <span className="mt-1 block text-xs leading-5 text-gray-500">{description}</span>
                {id === 'online' ? <PaymentMethodIconRow /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PaymentMethodIconRow() {
  return (
    <span className="mt-3 flex flex-wrap items-center gap-2">
      {PAYMENT_METHOD_ICONS.map((icon) => (
        <Image key={icon.src} src={icon.src} alt={icon.alt} width={40} height={24} className="h-5 w-auto object-contain" />
      ))}
    </span>
  );
}

function CheckoutAction({ total, selectedMethod, disabled, loading, onClick, className = 'flex' }) {
  return (
    <div className={`items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 ${className}`}>
      <div>
        <p className="text-sm font-bold text-gray-500">Grand Total</p>
        <p className="text-xl font-extrabold text-gray-950">{formatInr(total)}</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="h-12 rounded-full bg-gray-950 px-7 text-sm font-extrabold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <LoadingLabel spinnerClassName="border-white border-t-transparent">
            Please wait...
          </LoadingLabel>
        ) : selectedMethod === 'online' ? (
          'Pay Now'
        ) : (
          'Place Order'
        )}
      </button>
    </div>
  );
}
