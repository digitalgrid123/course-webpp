// components/MobileTeacherCard/MobileTeacherCard.tsx
import React from "react";
import Image from "next/image";

import { getFullUrl } from "@/utils/helper";
import { Teacher } from "@/types";

interface MobileTeacherCardProps {
  teacher: Teacher;
  onMoreInfo: () => void;
}

export const MobileTeacherCard: React.FC<MobileTeacherCardProps> = ({
  teacher,
  onMoreInfo,
}) => {
  return (
    <>
      <div className="lg:hidden bg-linear-(--gradient-amber) rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 rounded-full overflow-hidden border-4 border-white/20 shrink-0">
            {teacher.image ? (
              <Image
                src={getFullUrl(teacher.image)}
                alt={teacher.name}
                fill
                style={{ objectFit: "cover" }}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/20 text-white">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold mb-2 truncate">{teacher.name}</h1>
            <div className="flex items-center gap-2 text-sm">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span>
                {teacher.courses_count}{" "}
                {teacher.courses_count === 1 ? "קורס" : "קורסים"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 p-8 left-1/2 transform -translate-x-1/2 z-50 w-full flex flex-col items-center gap-2 bg-white  sm:hidden m-0">
        <button
          onClick={onMoreInfo}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white lg:hidden py-4 px-6 rounded-2xl shadow-lg font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          פרטים נוספים על המרצה
        </button>
      </div>
    </>
  );
};
