'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthFormPendingOverlay from '@/components/auth/AuthFormPendingOverlay';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import IndianPhoneInput from '@/components/ui/indian-phone-input';
import { Button } from '@/components/ui/button';
import { LoadingLabel } from '@/components/ui/loader';
import { useForgotPassword } from '@/hooks/auth';
import { APP_ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/utils/api-error';
import { forgotPasswordSchema } from '@/validations/auth-validation';

export default function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPassword();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
    try {
      const response = await forgotPasswordMutation.mutateAsync(parsed.data);
      setSuccessMessage(
        response?.message ||
          'If an account exists for this number, you will receive an OTP shortly.',
      );
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to send reset OTP.'));
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    disabled={isSubmitting}
                    className={cn(
                      'h-12 w-full rounded-none !bg-[#C99B4D] text-base font-semibold text-primary-foreground hover:!bg-[#C99B4D]/90',
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
      </main>
    </div>
  );
}
