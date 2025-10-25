import React from "react";

interface ProgressIndicatorsProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export const ProgressIndicators: React.FC<ProgressIndicatorsProps> = ({
  currentStep,
  onStepClick,
}) => {
  const steps = [1, 2]; // Corrected order

  return (
    <div className="flex justify-center items-center gap-3 sm:gap-4" dir="ltr">
      {steps.map((step) => {
        const isActive = currentStep === step;
        const isCompleted = currentStep > step;

        return (
          <div
            key={step}
            onClick={() => onStepClick(step)}
            className={`
              w-10 h-10 sm:w-14 sm:h-14
              flex items-center justify-center
              text-lg sm:text-xl font-bold rounded-full
              cursor-pointer transition-all duration-200
              ${
                isActive
                  ? "bg-dark-orange text-white shadow-glow-amber"
                  : isCompleted
                  ? "bg-orange-300 text-white"
                  : "bg-light-gray border-2 border-gray-300 text-charcoal-blue"
              }
            `}
          >
            {step}
          </div>
        );
      })}
    </div>
  );
};
