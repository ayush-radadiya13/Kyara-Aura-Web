'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck,
  CircleCheck,
  CreditCard,
  Edit3,
  Gem,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  Truck,
  Wallet,
  XCircle,
} from 'lucide-react';
import CheckoutSteps from '@/components/cart/CheckoutSteps';
import { formatInr } from '@/lib/cart/format';
import { useCartStore } from '@/lib/cart/store';
import { APP_ROUTES, AUTH_PAGE_ROUTES, withRedirect } from '@/lib/routes';
import {
  createAddressApi,
  createOrderApi,
  deleteAddressApi,
  getAddressesApi,
  getCheckoutSummaryApi,
  setDefaultAddressApi,
  updateAddressApi,
  verifyRazorpayPaymentApi,
} from '@/services/checkout';
import { useAuthStore } from '@/store/auth-store';
import { getApiErrorMessage } from '@/utils/api-error';

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
    description: 'Place your order now and pay when it arrives.',
    badge: 'Pay later',
    Icon: Wallet,
  },
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

function buildCheckoutPayload({ checkoutIntent, selectedAddressId, selectedMethod }) {
  const payload = {
    checkout_type: checkoutIntent.checkout_type,
    address_id: Number(selectedAddressId),
    payment_method: selectedMethod,
  };

  if (checkoutIntent.checkout_type === 'buy_now') {
    payload.product_size_id = Number(checkoutIntent.product_size_id);
    payload.quantity = Math.max(Number(checkoutIntent.quantity) || 1, 1);
  }

  return payload;
}

export default function PaymentMethodFlow({ initialCheckoutIntent = { checkout_type: 'cart' } }) {
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const [checkoutIntent] = useState(initialCheckoutIntent);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('online');
  const [summary, setSummary] = useState(null);
  const [notes, setNotes] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressActionId, setAddressActionId] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [paymentNotice, setPaymentNotice] = useState('');
  const [toast, setToast] = useState(null);

  const selectedAddress = useMemo(
    () => addresses.find((address) => String(address.id) === String(selectedAddressId)),
    [addresses, selectedAddressId],
  );
  const summaryItems = Array.isArray(summary?.items) ? summary.items : [];
  const hasSummary = Boolean(summary);
  const displayItems = hasSummary ? summaryItems : [];
  const visibleCount = summaryItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const payableTotal = hasSummary ? getSummaryTotal(summary) : 0;
  const canPlaceOrder = Boolean(selectedAddressId && hasSummary && payableTotal > 0 && !placingOrder && !summaryLoading);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
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
        const payload = buildCheckoutPayload({ checkoutIntent, selectedAddressId, selectedMethod });
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
  }, [checkoutIntent, isAuthenticated, selectedAddressId, selectedMethod]);

  const setAddressField = (field, value) => {
    setAddressForm((current) => ({ ...current, [field]: value }));
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
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
      setEditingAddressId(null);
      setShowAddressForm(false);
      showToast(editingAddressId ? 'Address updated successfully.' : 'Address saved successfully.');
    } catch (addressError) {
      setError(getApiErrorMessage(addressError, 'Unable to save delivery address.'));
    } finally {
      setSavingAddress(false);
    }
  };

  const startAddressEdit = (address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      ...EMPTY_ADDRESS_FORM,
      name: address.name ?? '',
      email: address.email ?? '',
      phone: address.phone ?? '',
      address_line_1: address.address_line_1 ?? '',
      address_line_2: address.address_line_2 ?? '',
      city: address.city ?? '',
      state: address.state ?? '',
      postal_code: address.postal_code ?? '',
      country: address.country ?? 'India',
      landmark: address.landmark ?? '',
      address_type: address.address_type ?? 'home',
      is_default: Boolean(address.is_default),
    });
    setShowAddressForm(true);
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS_FORM);
    setShowAddressForm((value) => !value);
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
      await refreshAddresses(addressId);
      showToast('Default address updated.');
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
      showToast('Address deleted successfully.');
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

    return new Promise((resolve, reject) => {
      const paymentObject = new window.Razorpay({
        key: razorpay.key,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: razorpay.name,
        description: razorpay.description,
        order_id: razorpay.order_id,
        prefill: razorpay.prefill,
        handler: async (response) => {
          try {
            const verifiedOrder = await verifyRazorpayPaymentApi({
              order_id: order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            resolve(verifiedOrder);
          } catch (verifyError) {
            reject(verifyError);
          }
        },
        modal: {
          ondismiss: () => {
            reject(new Error('Payment window closed. Your order is still pending.'));
          },
        },
        theme: {
          color: '#4f3128',
        },
      });

      paymentObject.open();
    });
  };

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder) return;

    setPlacingOrder(true);
    setError('');
    setPaymentNotice('');

    try {
      const payload = {
        ...buildCheckoutPayload({ checkoutIntent, selectedAddressId, selectedMethod }),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      };
      const orderResponse = await createOrderApi(payload);
      const order = orderResponse?.order;
      const razorpay = orderResponse?.razorpay;

      if (!order?.id) {
        throw new Error('Order response is missing order details.');
      }

      if (selectedMethod === 'cod') {
        if (checkoutIntent.checkout_type === 'cart') clearCart();
        router.push(`/order-success/${order.id}`);
        return;
      }

      if (!razorpay) {
        throw new Error('Razorpay checkout data missing.');
      }

      const verifiedOrder = await openRazorpayPayment({ order, razorpay });
      if (checkoutIntent.checkout_type === 'cart') clearCart();
      router.push(`/order-success/${verifiedOrder?.id ?? order.id}`);
    } catch (orderError) {
      const message = getApiErrorMessage(orderError, 'Unable to place your order.');
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

  if (!isHydrated || (isAuthenticated && loading)) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-sm font-semibold text-gray-600">Loading secure checkout...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-[0_20px_60px_rgba(17,24,39,0.08)]">
          <ShieldCheck className="mx-auto h-12 w-12 text-[#4f3128]" />
          <h1 className="mt-5 text-3xl font-bold text-gray-950">Sign in to checkout</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600">
            Checkout, addresses, orders, and Razorpay verification are protected. Please login before placing an order.
          </p>
          <Link
            href={withRedirect(AUTH_PAGE_ROUTES.LOGIN, APP_ROUTES.PAYMENT_METHOD)}
            className="mt-7 inline-flex h-12 items-center justify-center bg-[#4f3128] px-7 text-sm font-bold text-white transition hover:bg-[#3d261f]"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white pb-24">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
        <div className="mb-8">
          <CheckoutSteps activeStep={2} />
        </div>

        {(error || paymentNotice || (checkoutIntent.checkout_type === 'buy_now' && !checkoutIntent.product_size_id)) ? (
          <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error || paymentNotice || 'Buy now checkout is missing a selected product size.'}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <ProductDetailsSection items={displayItems} visibleCount={visibleCount} hasSummary={hasSummary} summaryLoading={summaryLoading} />

          <div className="space-y-6 lg:sticky lg:top-24">
            <AddressSection
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              selectedAddress={selectedAddress}
              showAddressForm={showAddressForm}
              addressForm={addressForm}
              editingAddressId={editingAddressId}
              savingAddress={savingAddress}
              addressActionId={addressActionId}
              onSelectAddress={setSelectedAddressId}
              onToggleForm={resetAddressForm}
              onAddressFieldChange={setAddressField}
              onAddressSubmit={handleAddressSubmit}
              onEditAddress={startAddressEdit}
              onDeleteAddress={handleDeleteAddress}
              onSetDefaultAddress={handleSetDefaultAddress}
            />

            <PaymentMethodSection selectedMethod={selectedMethod} onSelectMethod={setSelectedMethod} />

            <BillDetails
              summary={summary}
              visibleCount={visibleCount}
              summaryLoading={summaryLoading}
            />

            <section className="rounded-none border border-gray-200 bg-white p-5">
              <label htmlFor="order-notes" className="text-sm font-bold text-gray-950">
                Order notes
              </label>
              <textarea
                id="order-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Gift packing or delivery instructions"
                className="mt-3 w-full resize-none border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-gray-950"
              />
            </section>

            <div className="grid grid-cols-3 gap-3 border-y border-gray-200 py-7">
              {TRUST_POINTS.map(({ label, Icon }) => (
                <div key={label} className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#d4a373] bg-[#1f2a44] text-[#d4a373]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-xs font-bold text-gray-950 sm:text-sm">{label}</p>
                </div>
              ))}
            </div>

            <CheckoutAction
              total={payableTotal}
              selectedMethod={selectedMethod}
              disabled={!canPlaceOrder}
              loading={placingOrder}
              onClick={handlePlaceOrder}
              className="hidden lg:flex"
            />
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-12px_30px_rgba(17,24,39,0.08)] lg:hidden">
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

      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
    </div>
  );
}

function ProductDetailsSection({ items, visibleCount, hasSummary, summaryLoading }) {
  return (
    <section aria-labelledby="payment-bag-heading" className="min-w-0">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6aab8e]">
            {hasSummary ? 'Backend summary' : 'Your selection'}
          </p>
          <h2 id="payment-bag-heading" className="mt-2 text-2xl font-bold text-gray-950">
            Order Items
          </h2>
        </div>
        <span className="rounded-full bg-[#f5f0ea] px-4 py-2 text-sm font-bold text-[#4f3128]">
          {visibleCount} {visibleCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      {summaryLoading && !hasSummary ? (
        <div className="mt-6 space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="h-36 animate-pulse rounded-3xl bg-gray-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 border border-dashed border-gray-300 bg-white p-8 text-center">
          <Gem className="mx-auto h-10 w-10 text-[#4f3128]" />
          <p className="mt-4 text-sm font-bold text-gray-950">Backend checkout summary has not loaded yet.</p>
          <Link href={APP_ROUTES.PRODUCTS} className="mt-3 inline-flex text-sm font-bold text-[#4f3128] underline underline-offset-4">
            Continue shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {items.map((item, index) => {
            const isSummaryItem = 'product_name' in item;
            const productTotal = item.total;
            const productName = item.product_name ?? item.title ?? 'Product';
            const productSize = item.size_text ?? item.sizeLabel ?? item.size;
            const image = item.image;
            const slug = item.product_slug ?? item.slug;

            return (
              <li key={`${item.product_size_id ?? item.productSizeId ?? item.id}-${index}`}>
                <Link
                  href={slug ? `${APP_ROUTES.PRODUCTS}/${slug}` : APP_ROUTES.PRODUCTS}
                  className="group block overflow-hidden border border-gray-200 bg-white shadow-[0_16px_45px_rgba(17,24,39,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(17,24,39,0.1)]"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative min-h-44 bg-[#f7f1ea] sm:min-h-0 sm:w-44 sm:shrink-0">
                      {image && !isSummaryItem ? (
                        <Image src={image} alt={productName} fill className="object-cover" sizes="(max-width: 640px) 100vw, 176px" />
                      ) : (
                        <div className="flex h-full min-h-44 items-center justify-center text-[#4f3128]">
                          <Gem className="h-10 w-10" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
                      <div>
                        <h3 className="text-base font-bold leading-snug text-gray-950 sm:text-lg">
                          {productName}
                          {productSize ? ` (${productSize})` : ''}
                        </h3>
                        <p className="mt-2 text-sm font-semibold text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
                        <span className="text-lg font-bold text-gray-950">
                          {productTotal !== undefined && productTotal !== null ? formatInr(Number(productTotal)) : '-'}
                        </span>
                        {hasSummary ? (
                          <span className="bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                            Server verified
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Link>
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
  editingAddressId,
  savingAddress,
  addressActionId,
  onSelectAddress,
  onToggleForm,
  onAddressFieldChange,
  onAddressSubmit,
  onEditAddress,
  onDeleteAddress,
  onSetDefaultAddress,
}) {
  return (
    <section className="border-b border-gray-200 pb-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-950">Delivery Address</h1>
        <button type="button" onClick={onToggleForm} className="inline-flex items-center gap-2 text-sm font-bold text-[#4f63d9]">
          <Plus className="h-4 w-4" />
          {showAddressForm ? 'Close' : 'Add'}
        </button>
      </div>

      {addresses.length > 0 ? (
        <div className="mt-4 space-y-3">
          {addresses.map((address) => {
            const isSelected = String(address.id) === String(selectedAddressId);

            return (
              <div
                key={address.id}
                className={`w-full border p-4 text-left transition ${
                  isSelected ? 'border-[#4f3128] bg-[#f8f4ef]' : 'border-gray-200 bg-white hover:border-gray-400'
                }`}
              >
                <span className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectAddress(String(address.id))}
                    className={`mt-1 h-4 w-4 shrink-0 rounded-full border ${isSelected ? 'border-[#4f3128] bg-[#4f3128]' : 'border-gray-400'}`}
                    aria-label={`Select ${address.name} address`}
                  />
                  <span className="min-w-0 flex-1">
                    <button type="button" onClick={() => onSelectAddress(String(address.id))} className="block text-left font-bold text-gray-950">
                      {address.name} {address.address_type ? `(${address.address_type})` : ''}
                    </button>
                    {address.is_default ? (
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                        <Star className="h-3 w-3 fill-current" />
                        Default
                      </span>
                    ) : null}
                    <span className="mt-1 block text-sm leading-5 text-gray-700">
                      {[address.address_line_1, address.address_line_2, address.city, address.state, address.postal_code, address.country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                    <span className="mt-2 block text-sm font-semibold text-gray-950">Mobile: {address.phone}</span>
                    <span className="mt-3 flex flex-wrap gap-2">
                      {!address.is_default ? (
                        <button
                          type="button"
                          onClick={() => onSetDefaultAddress(address.id)}
                          disabled={addressActionId === address.id}
                          className="rounded-full border border-gray-200 px-3 py-1 text-xs font-bold text-gray-700 transition hover:border-[#4f3128] hover:text-[#4f3128] disabled:opacity-50"
                        >
                          Set default
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => onEditAddress(address)}
                        disabled={addressActionId === address.id}
                        className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-bold text-gray-700 transition hover:border-[#4f3128] hover:text-[#4f3128] disabled:opacity-50"
                      >
                        <Edit3 className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteAddress(address.id)}
                        disabled={addressActionId === address.id}
                        className="inline-flex items-center gap-1 rounded-full border border-red-100 px-3 py-1 text-xs font-bold text-red-700 transition hover:border-red-300 disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </span>
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 border border-dashed border-gray-300 p-4 text-sm text-gray-600">
          Add a delivery address to generate your checkout summary.
        </p>
      )}

      {selectedAddress ? (
        <div className="mt-4 bg-[#f2eee8] px-4 py-2 text-center text-sm font-bold text-gray-900">
          Free Delivery within 3-6 days
        </div>
      ) : null}

      {showAddressForm ? (
        <AddressForm
          addressForm={addressForm}
          editingAddressId={editingAddressId}
          savingAddress={savingAddress}
          onAddressFieldChange={onAddressFieldChange}
          onAddressSubmit={onAddressSubmit}
        />
      ) : null}
    </section>
  );
}

function AddressForm({ addressForm, editingAddressId, savingAddress, onAddressFieldChange, onAddressSubmit }) {
  return (
    <form onSubmit={onAddressSubmit} className="mt-5 grid gap-3 border border-gray-200 bg-white p-4 sm:grid-cols-2">
      <AddressInput label="Name" value={addressForm.name} onChange={(value) => onAddressFieldChange('name', value)} required />
      <AddressInput label="Email" type="email" value={addressForm.email} onChange={(value) => onAddressFieldChange('email', value)} required />
      <AddressInput label="Phone" value={addressForm.phone} onChange={(value) => onAddressFieldChange('phone', value)} required />
      <AddressInput label="City" value={addressForm.city} onChange={(value) => onAddressFieldChange('city', value)} required />
      <AddressInput label="State" value={addressForm.state} onChange={(value) => onAddressFieldChange('state', value)} required />
      <AddressInput label="Postal code" value={addressForm.postal_code} onChange={(value) => onAddressFieldChange('postal_code', value)} required />
      <AddressInput label="Country" value={addressForm.country} onChange={(value) => onAddressFieldChange('country', value)} required />
      <AddressInput label="Landmark" value={addressForm.landmark} onChange={(value) => onAddressFieldChange('landmark', value)} />
      <label>
        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Address type</span>
        <select
          value={addressForm.address_type}
          onChange={(event) => onAddressFieldChange('address_type', event.target.value)}
          className="mt-1 h-11 w-full border border-gray-200 px-3 text-sm outline-none transition focus:border-gray-950"
        >
          <option value="home">Home</option>
          <option value="work">Work</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="sm:col-span-2">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Address line 1</span>
        <textarea
          value={addressForm.address_line_1}
          onChange={(event) => onAddressFieldChange('address_line_1', event.target.value)}
          required
          rows={2}
          className="mt-1 w-full resize-none border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-gray-950"
        />
      </label>
      <label className="sm:col-span-2">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Address line 2</span>
        <textarea
          value={addressForm.address_line_2}
          onChange={(event) => onAddressFieldChange('address_line_2', event.target.value)}
          rows={2}
          className="mt-1 w-full resize-none border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-gray-950"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <input
          type="checkbox"
          checked={addressForm.is_default}
          onChange={(event) => onAddressFieldChange('is_default', event.target.checked)}
        />
        Set as default
      </label>
      <button
        type="submit"
        disabled={savingAddress}
        className="h-11 bg-[#4f3128] px-5 text-sm font-bold text-white transition hover:bg-[#3d261f] disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
      >
        {savingAddress ? 'Saving address...' : editingAddressId ? 'Update Address' : 'Save Address'}
      </button>
    </form>
  );
}

function AddressInput({ label, value, onChange, type = 'text', required = false }) {
  return (
    <label>
      <span className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="mt-1 h-11 w-full border border-gray-200 px-3 text-sm outline-none transition focus:border-gray-950"
      />
    </label>
  );
}

function PaymentMethodSection({ selectedMethod, onSelectMethod }) {
  return (
    <section className="border-b border-gray-200 pb-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-950">Payment Method</h2>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#4f63d9]">
          <ShieldCheck className="h-4 w-4" />
          100% safe payments
        </div>
      </div>

      <div className="mt-5 divide-y divide-gray-200">
        {PAYMENT_OPTIONS.map(({ id, title, description, badge, Icon }) => {
          const isSelected = selectedMethod === id;

          return (
            <button key={id} type="button" onClick={() => onSelectMethod(id)} className="flex w-full items-start gap-3 py-5 text-left sm:gap-4">
              <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isSelected ? 'border-[#4f3128]' : 'border-gray-400'}`}>
                {isSelected ? <span className="h-2.5 w-2.5 rounded-full bg-[#4f3128]" /> : null}
              </span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5f0ea] text-[#4f3128]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-gray-950">{title}</span>
                </span>
                <span className="mt-1 block text-sm leading-5 text-gray-500">{description}</span>
              </span>
              <span className="hidden shrink-0 text-sm font-bold text-[#4f63d9] sm:block">{badge}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function BillDetails({ summary, visibleCount, summaryLoading }) {
  const subtotal = Number(summary?.subtotal ?? 0);
  const taxAmount = Number(summary?.tax_amount ?? 0);
  const shippingAmount = Number(summary?.shipping_amount ?? 0);
  const totalAmount = getSummaryTotal(summary);

  return (
    <section className="pb-2">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-950">Bill Details</h2>
        {summaryLoading ? <span className="text-xs font-bold text-gray-500">Refreshing...</span> : null}
      </div>
      {summaryLoading && !summary ? (
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-5 animate-pulse rounded-full bg-gray-100" />
          ))}
        </div>
      ) : !summary ? (
        <p className="mt-4 rounded border border-dashed border-gray-300 p-4 text-sm font-semibold text-gray-600">
          Select a delivery address to load backend-calculated subtotal, tax, shipping, and total.
        </p>
      ) : (
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="font-semibold text-gray-700">Items</dt>
          <dd className="font-bold text-gray-950">{visibleCount}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="font-semibold text-gray-700">Subtotal</dt>
          <dd className="font-bold text-gray-950">{formatInr(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="font-semibold text-gray-700">Tax</dt>
          <dd className="font-bold text-gray-950">{formatInr(taxAmount)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="font-semibold text-gray-700">Delivery fee</dt>
          <dd className="font-bold text-gray-950">{formatInr(shippingAmount)}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
          <dt className="font-bold text-gray-950">Total amount</dt>
          <dd className="font-bold text-gray-950">{formatInr(totalAmount)}</dd>
        </div>
      </dl>
      )}

      {summary ? (
        <div className="mt-4 flex items-center justify-center gap-3 bg-[#eef1ff] px-4 py-4 text-center font-bold text-[#4f63d9]">
          <CircleCheck className="h-5 w-5 shrink-0" />
          <span>Total verified by backend before payment</span>
        </div>
      ) : null}
    </section>
  );
}

function CheckoutAction({ total, selectedMethod, disabled, loading, onClick, className = 'flex' }) {
  return (
    <div className={`items-center justify-between gap-4 border-t border-gray-200 pt-5 ${className}`}>
      <div>
        <p className="text-sm font-bold text-gray-950">Total amount</p>
        <p className="text-xl font-bold text-gray-950">{formatInr(total)}</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="h-12 bg-[#4f3128] px-7 text-sm font-bold text-white transition hover:bg-[#3d261f] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Please wait...' : selectedMethod === 'online' ? 'Pay Now' : 'Place Order'}
      </button>
    </div>
  );
}

function Toast({ message, type }) {
  const isError = type === 'error';

  return (
    <div className="fixed right-4 top-20 z-[70] max-w-sm rounded-2xl border border-gray-100 bg-white p-4 text-sm font-semibold text-gray-900 shadow-[0_18px_50px_rgba(17,24,39,0.18)]">
      <span className="flex items-start gap-3">
        {isError ? <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" /> : <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />}
        <span>{message}</span>
      </span>
    </div>
  );
}
