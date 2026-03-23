export default function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <div
            key={step}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              isActive
                ? 'bg-terracotta-500 scale-125'
                : isCompleted
                ? 'bg-terracotta-300'
                : 'bg-warm-200'
            }`}
          />
        );
      })}
    </div>
  );
}
