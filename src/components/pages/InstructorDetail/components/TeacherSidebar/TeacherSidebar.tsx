// components/TeacherSidebar/TeacherSidebar.tsx
import React from "react";
import Image from "next/image";

import { getFullUrl } from "@/utils/helper";
import { Teacher } from "@/types";
import { TeacherStats } from "./TeacherStats";

interface TeacherSidebarProps {
  teacher: Teacher;
  isMobile?: boolean;
}

export const TeacherSidebar: React.FC<TeacherSidebarProps> = ({
  teacher,
  isMobile = false,
}) => {
  return (
    <div className={`${isMobile ? "" : "hidden lg:block"} sticky top-8`}>
      <div className="bg-linear-(--gradient-amber) rounded-2xl p-8 text-white mb-6">
        <div className="flex flex-col items-center">
          <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white/20 mb-6">
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
                  className="w-12 h-12"
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

          <h1 className="text-xl font-bold text-center mb-4">{teacher.name}</h1>

          <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
            <svg
              className="w-5 h-5"
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

            <p className="text-sm font-medium">
              <span className="ml-1 text-amber-700 font-bold">
                {teacher.courses_count}{" "}
              </span>
              {teacher.courses_count === 1 ? " קורס" : " קורסים"}
            </p>
          </div>

          <div className="w-full">
            <h3 className="font-bold text-sm mb-3 text-right">קצת עליי:</h3>
            <div className="h-full max-h-64 overflow-y-auto text-xs text-white/90 text-right space-y-3 custom-scrollbar">
              {teacher.bio && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: teacher.bio,
                  }}
                ></div>
              )}
              {teacher.detail && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: teacher.detail,
                  }}
                ></div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TeacherStats teacher={teacher} />
    </div>
  );
};
