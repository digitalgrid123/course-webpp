import React from "react";
import Image from "next/image";
import { Degree } from "@/types";
import { getFullUrl } from "@/utils/helper";

interface DegreeSelectionProps {
  degrees: Degree[];
  selectedDegreeId: string;
  onToggle: (id: string) => void;
  t?: (key: string) => string;
}

export const DegreeSelection: React.FC<DegreeSelectionProps> = ({
  degrees,
  selectedDegreeId,
  onToggle,
}) => {
  return (
    <div className="px-4 sm:px-6 lg:px-12">
      <div className="h-96 overflow-y-auto custom-scrollbar py-4 px-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 mb-8">
          {degrees.map((degree) => {
            const isSelected = selectedDegreeId === degree.id.toString();
            return (
              <button
                key={degree.id}
                onClick={() => onToggle(degree.id.toString())}
                className={`
                  flex flex-col items-center justify-center gap-2 sm:gap-3
                  w-full p-4 sm:p-6 rounded-xl text-center transition-all duration-200
                  ${
                    isSelected
                      ? "border-2 border-amber-gold shadow-glow-amber"
                      : "border-2 border-light-gray hover:border-amber-gold hover:shadow-sm"
                  }
                `}
              >
                <div className="relative w-6 h-6 sm:w-8 sm:h-8">
                  <Image
                    src={getFullUrl(degree.image)}
                    alt={degree.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-charcoal-blue">
                  {degree.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
