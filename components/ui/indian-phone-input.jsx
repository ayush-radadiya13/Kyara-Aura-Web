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
    <div className={cn('relative', className)}>
      {showIcon ? (
        <Phone
          className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
          aria-hidden
        />
      ) : null}
      <span
        className={cn(
          'pointer-events-none absolute top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500',
          showIcon ? 'left-11' : 'left-3',
          prefixClassName,
        )}
      >
        +91
      </span>
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
          showIcon ? 'pl-[5.75rem] pr-4' : 'pl-14 pr-3',
          inputClassName,
        )}
      />
    </div>
  );
}
