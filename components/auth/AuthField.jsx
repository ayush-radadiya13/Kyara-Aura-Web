'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import { AUTH_FIELD_META } from '@/lib/auth/fields';
import { cn } from '@/lib/utils';

const ICONS = {
  mail: Mail,
  lock: Lock,
  user: User,
  phone: Phone,
};

/**
 * @param {{
 *   fieldKey: string;
 *   value: string;
 *   onChange: (value: string) => void;
 *   error?: string;
 *   formType?: 'login' | 'register';
 * }} props
 */
export default function AuthField({
  fieldKey,
  value,
  onChange,
  error,
  formType = 'register',
}) {
  const [showPassword, setShowPassword] = useState(false);
  const meta = AUTH_FIELD_META[fieldKey];
  if (!meta) return null;

  const isPassword = meta.type === 'password';
  const Icon = meta.icon ? ICONS[meta.icon] : null;

  const placeholder =
    fieldKey === 'password' && formType === 'register'
      ? 'Min. 8 characters'
      : meta.placeholder;

  const inputType = isPassword && showPassword ? 'text' : meta.type;

  const inputProps =
    fieldKey === 'phone'
      ? {
          inputMode: 'numeric',
          maxLength: 10,
          pattern: '[6-9][0-9]{9}',
          title: 'Enter a valid 10-digit Indian mobile number',
        }
      : {};

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldKey} className="block text-sm font-medium text-gray-800">
        {meta.label}
      </label>
      <div className="relative">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
            aria-hidden
          />
        ) : null}
        <input
          id={fieldKey}
          name={fieldKey}
          type={inputType}
          value={value}
          onChange={(e) => {
            if (fieldKey === 'phone') {
              onChange(e.target.value.replace(/\D/g, '').slice(0, 10));
              return;
            }
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          autoComplete={meta.autoComplete}
          className={cn(
            'w-full rounded-none border-none bg-gray-50 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400',
            'focus:bg-white focus:ring-2 focus:ring-primary/25',
            Icon ? 'pl-11 pr-4' : 'px-4',
            isPassword && 'pr-11',
            error && 'bg-red-50 ring-2 ring-red-200 focus:ring-red-200',
          )}
          {...inputProps}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-[18px] w-[18px]" />
            ) : (
              <Eye className="h-[18px] w-[18px]" />
            )}
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
