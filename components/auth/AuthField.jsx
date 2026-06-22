'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import IndianPhoneInput from '@/components/ui/indian-phone-input';
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
  const isRadio = meta.type === 'radio';
  const Icon = meta.icon ? ICONS[meta.icon] : null;

  if (isRadio && meta.options?.length) {
    return (
      <div className="space-y-1.5">
        <span id={`${fieldKey}-label`} className="block text-sm font-medium text-gray-800">
          {meta.label}
        </span>
        <div
          className={cn(
            'flex flex-wrap gap-4 rounded-none bg-gray-50 px-4 py-3',
            error && 'bg-red-50 ring-2 ring-red-200',
          )}
          role="radiogroup"
          aria-labelledby={`${fieldKey}-label`}
        >
          {meta.options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
            >
              <input
                type="radio"
                name={fieldKey}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary/30"
              />
              {option.label}
            </label>
          ))}
        </div>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    );
  }

  const placeholder =
    fieldKey === 'password' && formType === 'register'
      ? 'Min. 8 characters'
      : meta.placeholder;

  const inputType = isPassword && showPassword ? 'text' : meta.type;

  if (fieldKey === 'phone') {
    return (
      <div className="space-y-1.5">
        <label htmlFor={fieldKey} className="block text-sm font-medium text-gray-800">
          {meta.label}
        </label>
        <IndianPhoneInput
          id={fieldKey}
          name={fieldKey}
          value={value}
          onChange={onChange}
          showIcon
          placeholder={meta.placeholder}
          autoComplete={meta.autoComplete}
          className={cn(
            'w-full rounded-none bg-gray-50 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400',
            'focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/25',
            error && 'bg-red-50 ring-2 ring-red-200 focus-within:ring-red-200',
          )}
        />
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    );
  }

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
