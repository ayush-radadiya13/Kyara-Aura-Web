'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useForgotPassword } from '@/hooks/auth';
import { getApiErrorMessage } from '@/utils/api-error';
import { forgotPasswordSchema } from '@/validations/auth-validation';

export default function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPassword();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldError('');
    setSuccessMessage('');

    const parsed = forgotPasswordSchema.safeParse({ email: email.trim() });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message || 'Enter a valid email');
      return;
    }

    try {
      const response = await forgotPasswordMutation.mutateAsync(parsed.data);
      setSuccessMessage(
        response?.message ||
          'If an account exists for this email, you will receive reset instructions shortly.',
      );
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to send reset email.'));
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Forgot password</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded border border-gray-300 px-3 text-sm"
              autoComplete="email"
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
            className="h-12 w-full"
          >
            {forgotPasswordMutation.isPending ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link href="/login" className="font-semibold text-primary hover:text-primary/80">
            Back to login
          </Link>
        </p>
      </main>
    </div>
  );
}
