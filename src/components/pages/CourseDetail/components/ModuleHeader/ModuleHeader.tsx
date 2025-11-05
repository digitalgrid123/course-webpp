// components/ModuleList/ModuleHeader.tsx
import { CourseModule } from "@/types";
import React from "react";

interface ModuleHeaderProps {
  module: CourseModule;
  isSelected: boolean;
  isAccessible: boolean;
  onClick: () => void;
}

export const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  module,
  isSelected,
  isAccessible,
  onClick,
}) => {
  return (
    <div
      onClick={isAccessible ? onClick : undefined}
      className={`flex items-center justify-between p-4 rounded-lg transition-all ${
        !isAccessible
          ? "opacity-50 cursor-not-allowed bg-white/5"
          : isSelected
          ? "bg-amber-gold cursor-pointer"
          : "hover:bg-amber-gold cursor-pointer"
      }`}
    >
      <div className="w-8 h-8 bg-soft-gray shadow-soft-dark rounded-lg flex items-center justify-center text-charcoal-blue font-bold text-sm flex-shrink-0">
        {module.sorting_order}
      </div>
      <span className="text-white font-medium text-sm flex-1 text-right mr-4 flex items-center gap-2">
        {module.name}
        {!isAccessible && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </span>
    </div>
  );
};
