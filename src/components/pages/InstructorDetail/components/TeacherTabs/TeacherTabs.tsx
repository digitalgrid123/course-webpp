// components/TeacherTabs/TeacherTabs.tsx
import React from "react";

import { CourseCard } from "@/components/common/CourseCard/CourseCard";
import { Teacher } from "@/types";

interface TeacherTabsProps {
  activeTab: string;
  teacher: Teacher;
  onTabChange: (tab: string) => void;
}

export const TeacherTabs: React.FC<TeacherTabsProps> = ({
  activeTab,
  teacher,
  onTabChange,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-orange-soft overflow-hidden">
      <div className="border-b-2 border-solid border-gray-200">
        <div className="flex justify-center">
          <button
            onClick={() => onTabChange("courses")}
            className={`px-4 sm:px-8 py-4 transition-all relative flex-1 sm:flex-none text-sm sm:text-base ${
              activeTab === "courses"
                ? "text-charcoal-blue font-bold"
                : "text-gray-400 hover:text-charcoal-blue hover:bg-gray-50"
            }`}
          >
            הקורסים שלי
            {activeTab === "courses" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal-blue"></div>
            )}
          </button>

          <button
            onClick={() => onTabChange("about")}
            className={`px-4 sm:px-8 py-4 transition-all relative flex-1 sm:flex-none text-sm sm:text-base ${
              activeTab === "about"
                ? "text-charcoal-blue font-bold"
                : "text-gray-400 hover:text-charcoal-blue hover:bg-gray-50"
            }`}
          >
            אודות המרצה
            {activeTab === "about" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal-blue"></div>
            )}
          </button>
        </div>
      </div>

      <div className="sm:p-8 p-4">
        {activeTab === "courses" && <CoursesTab teacher={teacher} />}
        {activeTab === "about" && <AboutTab teacher={teacher} />}
      </div>
    </div>
  );
};

const CoursesTab: React.FC<{ teacher: Teacher }> = ({ teacher }) => (
  <div className="space-y-6">
    <h2 className="text-xl sm:text-2xl font-bold text-charcoal-blue mb-6">
      הקורסים של {teacher.name}
    </h2>

    {teacher.courses && teacher.courses.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {teacher.courses.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.name}
            image={course.image}
            price={course.price}
            level={`${course.modules_count} מודולים • ${course.lessons_count} שיעורים`}
          />
        ))}
      </div>
    ) : (
      <EmptyCoursesState />
    )}
  </div>
);

const AboutTab: React.FC<{ teacher: Teacher }> = ({ teacher }) => (
  <div className="space-y-6">
    <h2 className="text-xl sm:text-2xl font-bold text-charcoal-blue">
      אודות {teacher.name}
    </h2>

    <div className="prose prose-sm sm:prose-lg max-w-none text-gray-700">
      {teacher.detail ? (
        <div
          dangerouslySetInnerHTML={{
            __html: teacher.detail,
          }}
        />
      ) : teacher.bio ? (
        <div
          dangerouslySetInnerHTML={{
            __html: teacher.bio,
          }}
        />
      ) : (
        <p className="text-gray-500 text-center py-8">
          אין תיאור זמין עבור מרצה זה
        </p>
      )}
    </div>
  </div>
);

const EmptyCoursesState: React.FC = () => (
  <div className="text-center py-8 sm:py-12">
    <svg
      className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4"
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
    <p className="text-gray-500 text-base sm:text-lg">
      אין קורסים זמינים ממרצה זה עדיין
    </p>
    <p className="text-sm text-gray-400 mt-2">
      הקורסים יופיעו כאן ברגע שיתווספו
    </p>
  </div>
);
