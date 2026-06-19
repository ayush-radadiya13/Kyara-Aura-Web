'use client';

export default function BuyTwoGetOneOfferMessage({ message }) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="rounded-2xl border border-[#d3b987]/50 bg-gradient-to-r from-[#fff8ea] via-[#fffdf8] to-[#fff8ea] px-4 py-3 text-sm font-semibold leading-6 text-[#6b4518] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
    >
      {message}
    </div>
  );
}
