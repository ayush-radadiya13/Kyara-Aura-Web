'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LoadingLabel } from '@/components/ui/loader';
import { useResetPassword } from '@/hooks/auth';
import { APP_ROUTES, AUTH_PAGE_ROUTES } from '@/lib/routes';
import { apiToast } from '@/lib/api-toast';
import { Eye, EyeOff } from 'lucide-react';
import { getApiErrorMessage } from '@/utils/api-error';
import { resetPasswordSchema } from '@/validations/auth-validation';

export default function ResetPasswordForm({ token = '', email = '' }) {
  const router = useRouter();
  const resetPasswordMutation = useResetPassword();
  const [values, setValues] = useState({
    token,
    email,
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});

  const setFieldValue = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      token: values.token.trim(),
      email: values.email.trim() || undefined,
      password: values.password,
      password_confirmation: values.password_confirmation,
    };
    const parsed = resetPasswordSchema.safeParse(payload);

    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [issue.path[0], issue.message]),
        ),
      );
      return;
    }

    try {
      const response = await resetPasswordMutation.mutateAsync(parsed.data);

      const successMessage =
        response?.message || 'Your password has been reset successfully.';

      // Redirect first so navigation can never be blocked by a toast failure.
      router.replace(APP_ROUTES.HOME);
      apiToast.success(successMessage);
    } catch (error) {
      apiToast.error(getApiErrorMessage(error, 'Unable to reset password.'));
    }
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold text-gray-900">Reset password</h1>
      <p className="mt-2 text-sm text-gray-500">
        Enter your reset token and choose a new password.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <Field
          id="token"
          label="Reset token"
          value={values.token}
          error={errors.token}
          onChange={(value) => setFieldValue('token', value)}
        />
        <Field
          id="email"
          label="Email"
          type="email"
          value={values.email}
          error={errors.email}
          onChange={(value) => setFieldValue('email', value)}
        />
        <Field
          id="password"
          label="New password"
          type="password"
          value={values.password}
          error={errors.password}
          onChange={(value) => setFieldValue('password', value)}
        />
        <Field
          id="password_confirmation"
          label="Confirm new password"
          type="password"
          value={values.password_confirmation}
          error={errors.password_confirmation}
          onChange={(value) => setFieldValue('password_confirmation', value)}
        />

        <Button
          type="submit"
          disabled={resetPasswordMutation.isPending}
          className="h-12 w-full rounded-none !bg-[#C99B4D] text-base font-semibold text-primary-foreground hover:!bg-[#C99B4D]/90"
        >
          {resetPasswordMutation.isPending ? (
            <LoadingLabel spinnerClassName="border-white border-t-transparent">
              Resetting...
            </LoadingLabel>
          ) : (
            'Reset password'
          )}
        </Button>

        <div className="space-y-3 text-center text-sm">
          <Link href={AUTH_PAGE_ROUTES.LOGIN} className="block font-semibold text-primary hover:text-primary/80">
            Back to login
          </Link>
          <Link href={APP_ROUTES.HOME} className="block font-semibold text-primary hover:text-primary/80">
            Go to Home
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({ id, label, value, onChange, error, type = 'text' }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`h-11 w-full rounded border border-gray-300 px-3 text-sm ${isPassword ? 'pr-10' : ''}`}
          autoComplete={type === 'password' ? 'new-password' : id}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
