'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LoadingLabel } from '@/components/ui/loader';
import AuthField from '@/components/auth/AuthField';
import AuthFormPendingOverlay from '@/components/auth/AuthFormPendingOverlay';
import { useLogin, useRegister } from '@/hooks/auth';
import { useAuthSession } from '@/hooks/auth/use-auth-session';
import { buildAuthPayload } from '@/lib/auth/fields';
import { APP_ROUTES, AUTH_PAGE_ROUTES, withRedirect } from '@/lib/routes';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const showLoginExtras =
    formType === 'login' &&
    fieldKeys.includes('email') &&
    fieldKeys.includes('password');

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
          label={formType === 'login' ? 'Signing in' : 'Creating account'}
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
                  className="font-medium !text-[#0C1126] hover:text-primary/80"
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
                '!bg-[#C99B4D] text-primary-foreground hover:!bg-[#C99B4D]/90',
                isSubmitting && 'disabled:opacity-100',
              )}
            >
              {isSubmitting ? (
                <LoadingLabel spinnerClassName="border-white border-t-transparent">
                  Please wait...
                </LoadingLabel>
              ) : (
                submitLabel
              )}
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
