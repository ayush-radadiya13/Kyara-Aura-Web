'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import AuthFormPendingOverlay from '@/components/auth/AuthFormPendingOverlay';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import OtpVerificationModal from '@/components/auth/OtpVerificationModal';
import IndianPhoneInput from '@/components/ui/indian-phone-input';
import { Button } from '@/components/ui/button';
import { LoadingLabel } from '@/components/ui/loader';
import { useForgotPassword, useResetPassword, useVerifyOtp } from '@/hooks/auth';
import { APP_ROUTES, AUTH_PAGE_ROUTES } from '@/lib/routes';
import { apiToast } from '@/lib/api-toast';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/utils/api-error';
import { forgotPasswordSchema, resetPasswordSchema } from '@/validations/auth-validation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPassword();
  const resetPasswordMutation = useResetPassword();
  const verifyOtpMutation = useVerifyOtp();
  const [phone, setPhone] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordValues, setPasswordValues] = useState({
    password: '',
    password_confirmation: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const resetFormState = () => {
    setOtp('');
    setOtpError('');
    setPasswordValues({ password: '', password_confirmation: '' });
    setPasswordErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldError('');

    const parsed = forgotPasswordSchema.safeParse({ phone: phone.trim() });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message || 'Enter a valid mobile number');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await forgotPasswordMutation.mutateAsync(parsed.data);
      resetFormState();
      setShowOtpModal(true);
      apiToast.success(
        response?.message ||
          'If an account exists for this number, you will receive an OTP shortly.',
      );
    } catch (err) {
      apiToast.error(getApiErrorMessage(err, 'Unable to send reset OTP.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async () => {
    const normalizedOtp = otp.replace(/\D/g, '').slice(0, 6);
    setOtp(normalizedOtp);

    if (!/^\d{6}$/.test(normalizedOtp)) {
      setOtpError('Please enter the 6-digit OTP.');
      return;
    }

    setOtpError('');
    setIsVerifyingOtp(true);
    try {
      await verifyOtpMutation.mutateAsync({
        payload: {
          purpose: 'forgot_password',
          phone: phone.trim(),
          otp: normalizedOtp,
        },
      });
      setShowOtpModal(false);
      setShowPasswordModal(true);
      apiToast.success('OTP verified. Please set your new password.');
    } catch (err) {
      setOtpError(getApiErrorMessage(err, 'Unable to verify OTP. Please try again.'));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      phone: phone.trim(),
      otp: otp.trim(),
      password: passwordValues.password,
      password_confirmation: passwordValues.password_confirmation,
    };

    const parsed = resetPasswordSchema.safeParse(payload);
    if (!parsed.success) {
      setPasswordErrors(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [issue.path[0], issue.message]),
        ),
      );
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync(parsed.data);
      setShowPasswordModal(false);
      resetFormState();
      setPhone('');
      router.replace(AUTH_PAGE_ROUTES.LOGIN);
      apiToast.success('Your password has been changed successfully.');
    } catch (err) {
      apiToast.error(getApiErrorMessage(err, 'Unable to change your password.'));
    }
  };

  const setFieldValue = (key, value) => {
    setPasswordValues((current) => ({ ...current, [key]: value }));
    setPasswordErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtp('');
    setOtpError('');
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    resetFormState();
  };

  const otpDescription = phone.trim() ? (
    <>Enter the 6-digit OTP sent to {phone.trim()} and complete your registration.</>
  ) : (
    'Enter the 6-digit OTP sent to complete your registration.'
  );

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center bg-white px-4 py-4 sm:py-6">
        <AuthSplitLayout
          imageSrc="/assets/ka-logo.png"
          imageAlt="Kayra Aura"
          eyebrow=""
          headline=""
          mediaClassName="h-[200px] min-h-[200px] w-full self-center bg-white sm:min-h-[200px] lg:min-h-[200px]"
        >
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold text-gray-900">Forgot password</h1>
            <p className="mt-2 text-sm text-gray-500">
              Enter your mobile number and we&apos;ll send you a reset OTP.
            </p>

            <div className="relative mt-8">
              <AuthFormPendingOverlay visible={isSubmitting} label="Sending reset OTP" />

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
                noValidate
                aria-busy={isSubmitting}
              >
                <fieldset
                  disabled={isSubmitting}
                  className="m-0 min-w-0 space-y-4 border-0 p-0"
                >
                  <div>
                    <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                      Mobile Number
                    </label>
                    <IndianPhoneInput
                      id="phone"
                      value={phone}
                      onChange={setPhone}
                      className="h-11 w-full rounded border border-gray-300 text-sm outline-none transition focus-within:border-gray-950"
                    />
                    {fieldError ? (
                      <p className="mt-2 text-sm text-red-600">{fieldError}</p>
                    ) : null}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      'h-12 w-full rounded-none bg-[#C99B4D]! text-base font-semibold text-primary-foreground hover:bg-[#C99B4D]/90!',
                      isSubmitting && 'disabled:opacity-100',
                    )}
                  >
                    {isSubmitting ? (
                      <LoadingLabel spinnerClassName="border-white border-t-transparent">
                        Sending...
                      </LoadingLabel>
                    ) : (
                      'Send reset OTP'
                    )}
                  </Button>

                  <Link
                    href={APP_ROUTES.HOME}
                    className="block text-center text-sm font-semibold text-primary hover:text-primary/80"
                    tabIndex={isSubmitting ? -1 : undefined}
                    aria-disabled={isSubmitting}
                  >
                    Go to Home
                  </Link>
                </fieldset>
              </form>
            </div>
          </div>
        </AuthSplitLayout>

        <OtpVerificationModal
          open={showOtpModal}
          phone={phone.trim()}
          otp={otp}
          error={otpError}
          loading={isVerifyingOtp}
          description={otpDescription}
          submitLabel="Verify OTP"
          loadingLabel="Verifying..."
          inputId="forgot-password-otp"
          titleId="forgot-password-otp-title"
          onOtpChange={(value) => {
            const digits = value.replace(/\D/g, '').slice(0, 6);
            setOtp(digits);
            if (otpError) setOtpError('');
          }}
          onClose={closeOtpModal}
          onSubmit={handleOtpSubmit}
        />

        {showPasswordModal ? (
          <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" data-lenis-prevent>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Change password</h2>
                  <p className="mt-1 text-sm text-gray-500">Choose a new password for your account.</p>
                </div>
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="text-sm font-medium text-gray-500 transition hover:text-gray-800"
                  aria-label="Close password dialog"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4" noValidate>
                  <div>
                    <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                      New password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordValues.password}
                        onChange={(event) => setFieldValue('password', event.target.value)}
                        className="h-11 w-full rounded border border-gray-300 px-3 pr-10 text-sm outline-none transition focus:border-gray-950"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordErrors.password ? (
                      <p className="mt-2 text-sm text-red-600">{passwordErrors.password}</p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="password_confirmation" className="mb-1 block text-sm font-medium text-gray-700">
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        id="password_confirmation"
                        type={showPasswordConfirmation ? 'text' : 'password'}
                        value={passwordValues.password_confirmation}
                        onChange={(event) => setFieldValue('password_confirmation', event.target.value)}
                        className="h-11 w-full rounded border border-gray-300 px-3 pr-10 text-sm outline-none transition focus:border-gray-950"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordConfirmation((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showPasswordConfirmation ? 'Hide password' : 'Show password'}
                      >
                        {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordErrors.password_confirmation ? (
                      <p className="mt-2 text-sm text-red-600">{passwordErrors.password_confirmation}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 flex-1 rounded-none border-gray-300 text-base font-semibold text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        setShowPasswordModal(false);
                        setShowOtpModal(true);
                        setActiveStep('otp');
                        setPasswordErrors({});
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={resetPasswordMutation.isPending}
                      className="h-12 flex-1 rounded-none bg-[#C99B4D]! text-base font-semibold text-primary-foreground hover:bg-[#C99B4D]/90!"
                    >
                      {resetPasswordMutation.isPending ? (
                        <LoadingLabel spinnerClassName="border-white border-t-transparent">
                          Updating...
                        </LoadingLabel>
                      ) : (
                        'Change password'
                      )}
                    </Button>
                  </div>
                </form>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
