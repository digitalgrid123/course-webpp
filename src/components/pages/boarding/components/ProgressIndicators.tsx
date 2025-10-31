import React from "react";

interface ProgressIndicatorsProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export const ProgressIndicators: React.FC<ProgressIndicatorsProps> = ({
  currentStep,
  onStepClick,
}) => {
  const steps = [2, 1];

  return (
    <div className="flex justify-center items-center" dir="ltr">
      {steps.map((step) => {
        const isActive = currentStep === step;
        const isCompleted = currentStep > step;

        return (
          <React.Fragment key={step}>
            {step === 2 && currentStep === 2 && (
              <div
                className={`w-10 h-1 ${
                  currentStep === 2 ? "bg-amber-gold" : "bg-light-gray"
                }`}
              ></div>
            )}

            <div
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
                    : "bg-light-gray  text-charcoal-blue"
                }
              `}
            >
              {step}
            </div>

            <div
              className={`w-10 h-1 ${
                currentStep === 2 ? "bg-amber-gold" : "bg-light-gray"
              }`}
            ></div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
