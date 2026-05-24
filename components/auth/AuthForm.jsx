'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AuthField from '@/components/auth/AuthField';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import { useLogin, useRegister } from '@/hooks/auth';
import { useAuthSession } from '@/hooks/auth/use-auth-session';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { buildAuthPayload } from '@/lib/auth/fields';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/utils/api-error';
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
 *   footerHref: string;
 *   footerText: string;
 *   footerLinkText: string;
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
  const { isHydrated } = useAuthGuard({ redirectTo });
  const { applyAuthResponse } = useAuthSession();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const formSchema = useMemo(
    () => buildAuthFormSchema(fieldKeys),
    [fieldKeys],
  );

  const [values, setValues] = useState(() =>
    Object.fromEntries(fieldKeys.map((key) => [key, ''])),
  );
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState(/** @type {Record<string, string>} */ ({}));
  const [formError, setFormError] = useState('');

  const isSubmitting = loginMutation.isPending || registerMutation.isPending;

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

    const payload = {
      ...buildAuthPayload(trimmed, fieldKeys),
      ...(formType === 'login' && rememberMe ? { remember: true } : {}),
    };

    try {
      const response =
        formType === 'login'
          ? await loginMutation.mutateAsync(payload)
          : await registerMutation.mutateAsync(payload);

      await applyAuthResponse(response);
      router.replace(redirectTo);
    } catch (err) {
      setFormError(
        getApiErrorMessage(
          err,
          formType === 'login'
            ? 'Unable to login. Please try again.'
            : 'Unable to create account. Please try again.',
        ),
      );
    }
  };

  const showLoginExtras =
    formType === 'login' &&
    fieldKeys.includes('email') &&
    fieldKeys.includes('password');

  if (!isHydrated) {
    return (
      <div className="flex min-h-[320px] w-full max-w-md items-center justify-center">
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    );
  }

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

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
          <div className="flex items-center justify-between gap-4 text-sm">
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
              href="/forgot-password"
              className="font-medium text-primary hover:text-primary/80"
            >
              Forgot Password?
            </Link>
          </div>
        ) : null}

        {formError ? (
          <p className="rounded-none border-none bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {formError}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="default"
          disabled={isSubmitting}
          className={cn(
            'h-12 w-full rounded-none text-base font-semibold',
            'bg-primary text-primary-foreground hover:bg-primary/90',
          )}
        >
          {isSubmitting ? 'Please wait…' : submitLabel}
        </Button>
      </form>

      <div className="mt-8">
        <SocialAuthButtons />
      </div>

      <p className="mt-8 text-center text-sm text-gray-600">
        {footerText}{' '}
        <Link href={footerHref} className="font-semibold text-primary hover:text-primary/80">
          {footerLinkText}
        </Link>
      </p>
    </div>
  );
}
