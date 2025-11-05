// components/TeacherSidebar/TeacherStats.tsx
import { Teacher } from "@/types";
import React from "react";

interface TeacherStatsProps {
  teacher: Teacher;
}

export const TeacherStats: React.FC<TeacherStatsProps> = ({ teacher }) => {
  const totalStudents =
    teacher.courses?.reduce(
      (total, course) => total + (course.students_count || 0),
      0
    ) || 0;

  return (
    <div className="bg-linear-(--gradient-amber) rounded-2xl p-6 text-white">
      <h3 className="text-center font-bold text-base mb-4">סטטיסטיקות</h3>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm">סה&quot;כ קורסים</span>

          <span className="font-bold text-lg">{teacher.courses_count}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm">סה&quot;כ סטודנטים</span>

          <span className="font-bold text-lg">{totalStudents}</span>
        </div>
      </div>
    </div>
  );
};
