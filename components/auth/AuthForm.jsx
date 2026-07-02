'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LoadingLabel } from '@/components/ui/loader';
import AuthField from '@/components/auth/AuthField';
import AuthFormPendingOverlay from '@/components/auth/AuthFormPendingOverlay';
import { useLogin, useRegister, useVerifyOtp } from '@/hooks/auth';
import { useAuthSession } from '@/hooks/auth/use-auth-session';
import { useScrollLock } from '@/hooks/use-scroll-lock';
import { buildAuthPayload } from '@/lib/auth/fields';
import { APP_ROUTES, AUTH_PAGE_ROUTES, withRedirect } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { apiToast } from '@/lib/api-toast';
import { getApiErrorMessage } from '@/utils/api-error';
import { sendOtpApi } from '@/services/auth/send-otp';
import {
  buildAuthFormSchema,
  validateAuthForm,
} from '@/validations/build-auth-form-schema';

/**
 * @param {{
 *   formType: 'login' | 'register';
 *   fieldKeys: string[];
 *   title: string;
 *   subtitle: string;
 *   submitLabel: string;
 *   footerHref?: string;
 *   footerText?: string;
 *   footerLinkText?: string;
 *   redirectTo?: string;
 * }} props
 */
export default function AuthForm({
  formType,
  fieldKeys,
  title,
  subtitle,
  submitLabel,
  footerHref,
  footerText,
  footerLinkText,
  redirectTo = '/',
}) {
  const router = useRouter();
  const { applyAuthResponse } = useAuthSession();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const verifyOtpMutation = useVerifyOtp();

  const formSchema = useMemo(
    () => buildAuthFormSchema(fieldKeys, formType),
    [fieldKeys, formType],
  );

  const [values, setValues] = useState(() =>
    Object.fromEntries(fieldKeys.map((key) => [key, ''])),
  );
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState(/** @type {Record<string, string>} */ ({}));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  const setFieldValue = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const closeOtpModal = () => {
    setIsOtpModalOpen(false);
    setOtpError('');
    if (!otpVerified) {
      setOtpCode('');
    }
  };

  const getTrimmedValues = () =>
    Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value.trim()]),
    );

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const trimmed = getTrimmedValues();
    const validation = validateAuthForm(formSchema, trimmed);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    if (!otpVerified) {
      setIsSubmitting(true);
      setOtpError('');
      try {
        await sendOtpApi(buildAuthPayload(trimmed, fieldKeys));
        setOtpCode('');
        setOtpVerified(false);
        setIsOtpModalOpen(true);
        apiToast.success('OTP sent successfully. Please verify to continue.');
      } catch (err) {
        apiToast.error(getApiErrorMessage(err, 'Unable to send OTP. Please try again.'));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const normalizedOtp = otpCode.trim();
    if (!/^\d{6}$/.test(normalizedOtp)) {
      setOtpError('Please enter the 6-digit OTP.');
      return;
    }

    const payload = {
      ...buildAuthPayload(trimmed, fieldKeys),
      otp: normalizedOtp,
    };

    setIsSubmitting(true);
    setOtpError('');
    try {
      const response = await registerMutation.mutateAsync(payload);
      await applyAuthResponse(response);
      router.replace(redirectTo);
      apiToast.success(response?.message || 'Account created successfully.');
    } catch (err) {
      apiToast.error(getApiErrorMessage(err, 'Unable to create account. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    const normalizedOtp = otpCode.trim();
    if (!/^\d{6}$/.test(normalizedOtp)) {
      setOtpError('Please enter the 6-digit OTP.');
      return;
    }

    setOtpError('');
    setIsSubmitting(true);
    try {
      await verifyOtpMutation.mutateAsync({
        payload: {
          purpose: 'register',
          phone: values.phone?.trim() || '',
          otp: normalizedOtp,
        },
      });

      const payload = {
        ...buildAuthPayload(getTrimmedValues(), fieldKeys),
        otp: normalizedOtp,
      };

      const response = await registerMutation.mutateAsync(payload);
      await applyAuthResponse(response);
      setOtpVerified(true);
      setOtpCode(normalizedOtp);
      setIsOtpModalOpen(false);
      router.replace(redirectTo);
      apiToast.success(response?.message || 'Account created successfully.');
    } catch (err) {
      setOtpError(getApiErrorMessage(err, 'Unable to verify OTP and create account. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    if (formType === 'register') {
      await handleRegisterSubmit(e);
      return;
    }

    e.preventDefault();

    const trimmed = getTrimmedValues();

    const validation = validateAuthForm(formSchema, trimmed);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    const payload = {
      ...buildAuthPayload(trimmed, fieldKeys),
      ...(rememberMe ? { remember: true } : {}),
    };

    setIsSubmitting(true);
    try {
      const response = await loginMutation.mutateAsync(payload);
      await applyAuthResponse(response);

      const successMessage = response?.message || 'Logged in successfully.';

      router.replace(redirectTo);
      apiToast.success(successMessage);
    } catch (err) {
      apiToast.error(getApiErrorMessage(err, 'Unable to login. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const showLoginExtras =
    formType === 'login' &&
    fieldKeys.includes('email') &&
    fieldKeys.includes('password');

  const submitButtonLabel = formType === 'register' ? 'Continue' : submitLabel;

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-sm text-gray-500 sm:text-base">{subtitle}</p>
        ) : null}
      </div>

      <div className="relative">
        <AuthFormPendingOverlay
          visible={isSubmitting}
          label={formType === 'login' ? 'Signing in' : otpVerified ? 'Creating account' : 'Sending OTP'}
        />

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          noValidate
          aria-busy={isSubmitting}
        >
          <fieldset
            disabled={isSubmitting}
            className="m-0 min-w-0 space-y-5 border-0 p-0"
          >
            {fieldKeys.map((key) => (
              <AuthField
                key={key}
                fieldKey={key}
                value={values[key] ?? ''}
                onChange={(v) => setFieldValue(key, v)}
                error={errors[key]}
                formType={formType}
              />
            ))}

            {showLoginExtras ? (
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm sm:gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded-none border-none text-primary focus:ring-primary/30"
                  />
                  Remember me
                </label>
                <Link
                  href={AUTH_PAGE_ROUTES.FORGOT_PASSWORD}
                  className="font-medium text-[#0C1126]! hover:text-primary/80"
                  tabIndex={isSubmitting ? -1 : undefined}
                  aria-disabled={isSubmitting}
                >
                  Forgot Password?
                </Link>
              </div>
            ) : null}

            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
              className={cn(
                'h-12 w-full rounded-none text-base font-semibold',
                'bg-[#C99B4D]! text-primary-foreground hover:bg-[#C99B4D]/90!',
                isSubmitting && 'disabled:opacity-100',
              )}
            >
              {isSubmitting ? 'Please wait...' : submitButtonLabel}
            </Button>

            <div className="space-y-3 text-center text-sm">
              {formType === 'login' ? (
                <p className="text-gray-600">
                  Don&apos;t have an account?{' '}
                  <Link
                    href={withRedirect(AUTH_PAGE_ROUTES.REGISTER, redirectTo)}
                    className="font-semibold text-primary hover:text-primary/80"
                    tabIndex={isSubmitting ? -1 : undefined}
                    aria-disabled={isSubmitting}
                  >
                    Register
                  </Link>
                </p>
              ) : null}
              <Link
                href={APP_ROUTES.HOME}
                className="block font-semibold text-primary hover:text-primary/80"
                tabIndex={isSubmitting ? -1 : undefined}
                aria-disabled={isSubmitting}
              >
                Go to Home
              </Link>
            </div>
          </fieldset>
        </form>
      </div>

      {isOtpModalOpen
        ? createPortal(
            <OtpVerificationModal
              open={isOtpModalOpen}
              phone={values.phone?.trim() || ''}
              otp={otpCode}
              error={otpError}
              loading={isSubmitting}
              otpVerified={otpVerified}
              onOtpChange={(nextValue) => {
                const digits = nextValue.replace(/\D/g, '').slice(0, 6);
                setOtpCode(digits);
                if (otpError) {
                  setOtpError('');
                }
              }}
              onClose={closeOtpModal}
              onSubmit={handleVerifyOtp}
            />,
            document.body,
          )
        : null}

      {footerHref && footerText && footerLinkText ? (
        <p className="mt-8 text-center text-sm text-gray-600">
          {footerText}{' '}
          <Link href={footerHref} className="font-semibold text-primary hover:text-primary/80">
            {footerLinkText}
          </Link>
        </p>
      ) : null}
    </div>
  );
}

function OtpVerificationModal({
  open,
  phone,
  otp,
  error,
  loading,
  otpVerified,
  onOtpChange,
  onClose,
  onSubmit,
}) {
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
      className="fixed inset-0 z-80 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-otp-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" data-lenis-prevent>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="register-otp-title" className="text-xl font-semibold text-gray-900">
              Verify OTP
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {phone ? (
                <>Enter the 6-digit OTP sent to {phone} and complete your registration.</>
              ) : (
                'Enter the 6-digit OTP sent to complete your registration.'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-sm font-medium text-gray-500 transition hover:text-gray-800 disabled:opacity-50"
            aria-label="Close verification dialog"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="register-otp" className="mb-1 block text-sm font-medium text-gray-700">
              OTP
            </label>
            <input
              id="register-otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) => onOtpChange(event.target.value)}
              disabled={loading}
              autoFocus
              className="h-11 w-full rounded border border-gray-300 px-3 text-sm outline-none transition focus:border-gray-950 disabled:opacity-60"
              placeholder="Enter 6-digit OTP"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="h-12 w-full rounded-none bg-[#C99B4D] text-base font-semibold text-primary-foreground transition hover:bg-[#C99B4D]/90 disabled:opacity-60"
          >
            {loading ? (
              <LoadingLabel spinnerClassName="border-white border-t-transparent">
                Creating account...
              </LoadingLabel>
            ) : (
              'Register'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
