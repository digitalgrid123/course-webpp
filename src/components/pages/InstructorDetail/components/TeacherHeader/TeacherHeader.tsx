// components/TeacherHeader/TeacherHeader.tsx
import { Teacher } from "@/types";
import React from "react";

interface TeacherHeaderProps {
  teacher: Teacher;
  strippedBio: string;
}

export const TeacherHeader: React.FC<TeacherHeaderProps> = ({
  teacher,
  strippedBio,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-orange-soft p-6 sm:p-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-blue mb-4">
          {teacher.name}
        </h1>
        <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
          {strippedBio}
        </p>
      </div>
    </div>
  );
};
