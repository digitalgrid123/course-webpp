import React from "react";
import Image from "next/image";
import { Year } from "@/types";
import { getFullUrl } from "@/utils/helper";

interface YearSelectionProps {
  years: Year[];
  selectedYearId: string;
  onSelect: (id: string) => void;
  t?: (key: string) => string;
}

export const YearSelection: React.FC<YearSelectionProps> = ({
  years,
  selectedYearId,
  onSelect,
}) => {
  return (
    <div className="h-96 overflow-y-auto custom-scrollbar py-4 px-3">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-12">
        {years.map((year) => {
          const isSelected = selectedYearId === year.id.toString();
          return (
            <button
              key={year.id}
              onClick={() => onSelect(year.id.toString())}
              className={`
                flex flex-col items-center justify-center gap-2 sm:gap-3
                p-6 sm:p-8 rounded-xl min-w-[100px] sm:min-w-[140px]
                transition-all duration-200
                ${
                  isSelected
                    ? "border-2 border-amber-gold shadow-glow-amber"
                    : "border-2 border-light-gray hover:border-amber-gold hover:shadow-sm"
                }
              `}
            >
              <div className="relative w-12 h-12 sm:w-16 sm:h-16">
                <Image
                  src={getFullUrl(year.image)}
                  alt={year.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-charcoal-blue text-center">
                {year.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
