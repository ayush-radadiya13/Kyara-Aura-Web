import { CircleCheck, Info, XCircle } from 'lucide-react';

export default function CartToast({ message, type = 'info' }) {
  const isError = type === 'error';
  if (isError) {
    return null;
  }
  const isSuccess = type === 'success';
  const Icon = isError ? XCircle : isSuccess ? CircleCheck : Info;
  const iconClassName = isError
    ? 'text-red-600'
    : isSuccess
      ? 'text-green-700'
      : 'text-amber-600';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 top-4 z-[80] max-w-sm rounded-2xl border border-gray-100 bg-white p-4 text-sm font-semibold text-gray-900 shadow-[0_18px_50px_rgba(17,24,39,0.18)]"
    >
      <span className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClassName}`} />
        <span>{message}</span>
      </span>
    </div>
  );
}
