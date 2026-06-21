'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import IndianPhoneInput from '@/components/ui/indian-phone-input';
import { Button } from '@/components/ui/button';
import { LoadingLabel } from '@/components/ui/loader';
import { useForgotPassword } from '@/hooks/auth';
import { APP_ROUTES } from '@/lib/routes';
import { getApiErrorMessage } from '@/utils/api-error';
import { forgotPasswordSchema } from '@/validations/auth-validation';

export default function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPassword();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldError('');
    setSuccessMessage('');

    const parsed = forgotPasswordSchema.safeParse({ phone: phone.trim() });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message || 'Enter a valid mobile number');
      return;
    }

    try {
      const response = await forgotPasswordMutation.mutateAsync(parsed.data);
      setSuccessMessage(
        response?.message ||
          'If an account exists for this number, you will receive an OTP shortly.',
      );
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to send reset OTP.'));
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <main className="flex flex-1 items-center bg-white justify-center overflow-hidden px-4 py-4 sm:py-6">
        <AuthSplitLayout
          videoSrc="/vedio/logo_animation.mp4"
          videoLabel="Kayra Aura logo animation"
          eyebrow=""
          headline=""
          mediaClassName="h-[200px] min-h-[200px] w-full self-center sm:min-h-[200px] lg:min-h-[200px]"
        >
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold text-gray-900">Forgot password</h1>
            <p className="mt-2 text-sm text-gray-500">
              Enter your mobile number and we&apos;ll send you a reset OTP.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
              <div>
                <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                  Mobile Number
                </label>
                <IndianPhoneInput
                  id="phone"
                  value={phone}
                  onChange={setPhone}
                  inputClassName="h-11 w-full rounded border border-gray-300 text-sm outline-none transition focus:border-gray-950"
                />
                {fieldError ? (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {fieldError}
                  </p>
                ) : null}
              </div>

              {error ? (
                <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {error}
                </p>
              ) : null}

              {successMessage ? (
                <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-800" role="status">
                  {successMessage}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="h-12 w-full rounded-none !bg-[#C99B4D] text-base font-semibold text-primary-foreground hover:!bg-[#C99B4D]/90"
              >
                {forgotPasswordMutation.isPending ? (
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
              >
                Go to Home
              </Link>
            </form>
          </div>
        </AuthSplitLayout>
      </main>
    </div>
  );
}
