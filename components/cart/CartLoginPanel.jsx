'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthField from '@/components/auth/AuthField';
import { useLogin } from '@/hooks/auth';
import { useAuthSession } from '@/hooks/auth/use-auth-session';
import { buildAuthPayload } from '@/lib/auth/fields';
import { getApiErrorMessage } from '@/utils/api-error';
import {
  buildAuthFormSchema,
  validateAuthForm,
} from '@/validations/build-auth-form-schema';

/**
 * Minimal login panel for checkout — input fields only, no social or marketing chrome.
 *
 * @param {{ fieldKeys: string[]; redirectTo?: string }} props
 */
export default function CartLoginPanel({ fieldKeys, redirectTo = '/cart' }) {
  const router = useRouter();
  const { applyAuthResponse } = useAuthSession();
  const loginMutation = useLogin();

  const formSchema = useMemo(
    () => buildAuthFormSchema(fieldKeys),
    [fieldKeys],
  );

  const [values, setValues] = useState(() =>
    Object.fromEntries(fieldKeys.map((key) => [key, ''])),
  );
  const [errors, setErrors] = useState(/** @type {Record<string, string>} */ ({}));
  const [formError, setFormError] = useState('');

  const setFieldValue = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const trimmed = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value.trim()]),
    );

    const validation = validateAuthForm(formSchema, trimmed);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    const payload = buildAuthPayload(trimmed, fieldKeys);

    try {
      const response = await loginMutation.mutateAsync(payload);
      await applyAuthResponse(response);
      router.replace(redirectTo);
    } catch (err) {
      setFormError(
        getApiErrorMessage(err, 'Something went wrong. Please try again.'),
      );
    }
  };

  return (
    <section
      aria-labelledby="cart-login-heading"
      className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8"
    >
      <h2 id="cart-login-heading" className="sr-only">
        Login
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {fieldKeys.map((key) => (
          <AuthField
            key={key}
            fieldKey={key}
            value={values[key] ?? ''}
            onChange={(v) => setFieldValue(key, v)}
            error={errors[key]}
            formType="login"
          />
        ))}

        {formError ? (
          <p
            className="rounded bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {formError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="h-12 w-full rounded bg-[#3d2b1f] text-base font-bold text-white transition-colors hover:bg-[#2d2016] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loginMutation.isPending ? 'Please wait…' : 'Continue'}
        </button>

        <p className="text-center text-xs text-gray-500">
          By proceeding, I agree to{' '}
          <Link href="/terms" className="underline underline-offset-2 hover:text-gray-700">
            T&amp;C
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-700">
            Privacy Policy
          </Link>
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link
          href="/register?from=/cart"
          className="font-semibold text-gray-900 underline underline-offset-2 hover:text-gray-700"
        >
          Register
        </Link>
      </p>
    </section>
  );
}
