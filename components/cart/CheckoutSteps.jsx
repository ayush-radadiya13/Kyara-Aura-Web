const STEPS = [
  { id: 1, label: 'Login' },
  { id: 2, label: 'Address' },
  { id: 3, label: 'Payment' },
];

/**
 * @param {{ activeStep?: number }} props
 */
export default function CheckoutSteps({ activeStep = 1 }) {
  return (
    <nav
      aria-label="Checkout progress"
      className="flex items-start justify-center gap-10 sm:gap-16"
    >
      {STEPS.map((step) => {
        const isActive = step.id === activeStep;
        const isComplete = step.id < activeStep;

        return (
          <div key={step.id} className="flex flex-col items-center gap-2 min-w-[72px]">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                isActive || isComplete
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 bg-white text-gray-500'
              }`}
            >
              {step.id}
            </div>
            <span
              className={`text-sm font-medium ${
                isActive ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              {step.label}
            </span>
            {isActive ? (
              <span className="h-0.5 w-full max-w-[88px] bg-gray-900 rounded-full" aria-hidden />
            ) : (
              <span className="h-0.5 w-full max-w-[88px] rounded-full" aria-hidden />
            )}
          </div>
        );
      })}
    </nav>
  );
}
