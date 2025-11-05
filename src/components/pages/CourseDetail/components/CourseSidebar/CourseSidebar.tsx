// components/CourseSidebar/CourseSidebar.tsx
import React from "react";
import Image from "next/image";

import { ProgressTracker } from "../ProgressTracker/ProgressTracker";
import { ModuleList } from "../ModuleList/ModuleList";
import { getFullUrl } from "@/utils/helper";
import { CourseDetail } from "@/types";

interface CourseSidebarProps {
  courseDetail: CourseDetail;
  selectedModule: number | null;
  selectedLesson: number | null;
  isInCart: boolean;
  onModuleClick: (moduleId: number) => void;
  onLessonClick: (
    lessonId: number,
    moduleIndex: number,
    lessonIndex: number
  ) => void;
  onCartAction: () => void;
  onBottomSheetOpen: () => void;
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({
  courseDetail,
  selectedModule,
  selectedLesson,
  isInCart,
  onModuleClick,
  onLessonClick,
  onCartAction,
  onBottomSheetOpen,
}) => {
  const calculateCompletedModules = () => {
    if (!courseDetail.modules) return 0;

    return courseDetail.modules.filter((module) => {
      // A module is considered completed if all its lessons are 100% watched
      if (!module.lessons || module.lessons.length === 0) return false;

      return module.lessons.every((lesson) => lesson.watched_progress >= 100);
    }).length;
  };

  const completedModules = calculateCompletedModules();
  const totalModules = courseDetail.modules_count;

  return (
    <div className="sticky top-8">
      <div className="bg-linear-(--gradient-amber) rounded-2xl p-8 text-white mb-6">
        <div className="flex flex-col items-center">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-lg font-bold text-center mb-2.5">
                {courseDetail.name}
              </h1>
              <div className="flex items-center gap-2.5 justify-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4 overflow-hidden relative">
                  <Image
                    src={
                      getFullUrl(courseDetail.teacher.image) ||
                      "/assets/images/icons/instructor.svg"
                    }
                    alt="instructor"
                    fill
                  />
                </div>
                <p className="text-sm text-white">
                  שם המרצה: {courseDetail.teacher.name}
                </p>
              </div>
            </div>
          </div>

          <div dir="rtl">
            <h3 className="font-bold text-sm mb-3 text-right">קורות חיים:</h3>
            <div className="h-full max-h-64 overflow-y-auto text-xs text-white text-center space-y-3 custom-scrollbar">
              <div
                dangerouslySetInnerHTML={{
                  __html: courseDetail.teacher.bio,
                }}
              ></div>
              <div
                dangerouslySetInnerHTML={{
                  __html: courseDetail.teacher.detail,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-linear-(--gradient-amber) rounded-2xl p-8 text-white hidden sm:block">
        <h2 className="text-center font-bold text-base mb-3">
          {courseDetail.modules_count} מודולים
        </h2>

        <ProgressTracker modules={courseDetail.modules} />

        <ModuleList
          modules={courseDetail.modules}
          selectedModule={selectedModule}
          selectedLesson={selectedLesson}
          isMyCourse={courseDetail.is_my_course === 1}
          onModuleClick={onModuleClick}
          onLessonClick={onLessonClick}
        />

        {courseDetail?.is_my_course === 0 && (
          <>
            <button
              onClick={onCartAction}
              className={`w-full py-3 px-4 rounded-10 transition-all font-semibold text-sm mt-6 hidden lg:block ${
                isInCart
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-900 hover:bg-gray-800 text-white"
              }`}
            >
              {isInCart ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  נוסף לעגלה
                </span>
              ) : (
                `מחיר הקורס המלא:  ₪${courseDetail.price}`
              )}
            </button>

            <button
              onClick={onBottomSheetOpen}
              className={`w-full py-3 px-4 rounded-10 transition-all font-semibold text-sm mt-6 lg:hidden ${
                isInCart
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-900 hover:bg-gray-800 text-white"
              }`}
            >
              {isInCart ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  נוסף לעגלה
                </span>
              ) : (
                `מחיר הקורס המלא:  ₪${courseDetail.price}`
              )}
            </button>
          </>
        )}
      </div>

      <div className="fixed bottom-0 p-8 left-1/2 transform -translate-x-1/2 z-50 w-full flex flex-col items-center gap-2 bg-white  sm:hidden">
        <div className="w-full flex justify-between text-base  px-2">
          <span className="text-stone-gray">
            {completedModules}/{totalModules} בוצע
          </span>
          <span className="font-bold text-charcoal-blue">
            {totalModules} מודולים
          </span>
        </div>

        <button
          onClick={onBottomSheetOpen}
          className="w-full py-4 px-4 rounded-10 transition-all  font-semibold text-sm bg-gray-900 hover:bg-gray-800 text-white lg:hidden"
        >
          מחיר הקורס המלא: ₪{courseDetail.price}
        </button>
      </div>
    </div>
  );
};
