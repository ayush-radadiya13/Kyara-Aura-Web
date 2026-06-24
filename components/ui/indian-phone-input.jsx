'use client';

import { Phone } from 'lucide-react';
import { sanitizeIndianPhoneDigits } from '@/lib/phone';
import { cn } from '@/lib/utils';

/**
 * @param {{
 *   id?: string;
 *   name?: string;
 *   value: string;
 *   onChange: (value: string) => void;
 *   disabled?: boolean;
 *   placeholder?: string;
 *   autoComplete?: string;
 *   showIcon?: boolean;
 *   className?: string;
 *   inputClassName?: string;
 *   prefixClassName?: string;
 * }} props
 */
export default function IndianPhoneInput({
  id,
  name,
  value,
  onChange,
  disabled = false,
  placeholder = '',
  autoComplete = 'tel-national',
  showIcon = false,
  className,
  inputClassName,
  prefixClassName,
}) {
  return (
    <div
      className={cn(
        'flex w-full min-w-0 items-center gap-2 px-3.5',
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-1">
        {showIcon ? (
          <Phone
            className="h-[18px] w-[18px] shrink-0 text-gray-400"
            aria-hidden
          />
        ) : null}
        <span
          className={cn(
            'text-sm font-medium leading-none text-gray-500',
            prefixClassName,
          )}
        >
          +91
        </span>
      </div>
      <input
        id={id}
        name={name}
        type="tel"
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(sanitizeIndianPhoneDigits(event.target.value))}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        maxLength={10}
        pattern="[6-9][0-9]{9}"
        title="Enter a valid 10-digit Indian mobile number"
        className={cn(
          'min-w-0 flex-1 border-0 bg-transparent p-0 text-sm leading-none outline-none ring-0 focus:ring-0',
          inputClassName,
        )}
      />
    </div>
  );
}
