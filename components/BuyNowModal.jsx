'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

const SIZES = [
  { value: '2.4', label: '2.4 (Small)' },
  { value: '2.6', label: '2.6 (Regular)' },
  { value: '2.8', label: '2.8(Medium)' },
  { value: '2.10', label: '2.10 (Large)' },
  { value: '2.2', label: '2.2 (Smallest)' },
  { value: '2.12', label: '2.12 (Largest)' },
];

export default function BuyNowModal({
  open,
  onClose,
  selectedSize,
  onSizeChange,
  quantity,
  onQuantityChange,
  sizeOptions = SIZES,
  onConfirm,
  confirmLabel = 'BUY NOW',
}) {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="buy-now-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white rounded-lg shadow-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-5">
          <h2 id="buy-now-modal-title" className="text-lg font-bold text-gray-900">
            Quantity &amp; Size:
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 transition-colors p-1 -mr-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {sizeOptions.map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() => onSizeChange(size.value)}
              className={`px-1 py-2.5 text-[11px] sm:text-xs border rounded text-gray-900 font-medium transition-colors ${
                selectedSize === size.value
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-300 hover:border-gray-500'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="w-full py-2.5 mb-6 border border-gray-900 rounded text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
        >
          Size Chart
        </button>

        <div className="flex items-center justify-between mb-8">
          <span className="text-sm font-medium text-gray-900">Select Quantity</span>
          <div className="flex items-center border border-gray-300 rounded">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-10 text-center font-semibold text-gray-900">{quantity}</span>
            <button
              type="button"
              onClick={() => onQuantityChange(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-900 rounded font-bold text-sm text-gray-900 hover:bg-gray-50 transition-colors"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 rounded font-bold text-sm text-white bg-[#3d2b1f] hover:bg-[#2d2016] transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
