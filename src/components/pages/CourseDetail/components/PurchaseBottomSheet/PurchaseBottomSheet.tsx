// components/PurchaseBottomSheet/PurchaseBottomSheet.tsx
import React, { useEffect } from "react";

import { ProgressTracker } from "../ProgressTracker/ProgressTracker";
import { ModuleList } from "../ModuleList/ModuleList";
import { CourseDetail } from "@/types";

interface PurchaseBottomSheetProps {
  isOpen: boolean;
  courseDetail: CourseDetail;
  selectedModule: number | null;
  selectedLesson: number | null;
  isInCart: boolean;
  onClose: () => void;
  onModuleClick: (moduleId: number) => void;
  onLessonClick: (
    lessonId: number,
    moduleIndex: number,
    lessonIndex: number
  ) => void;
  onCartAction: () => void;
}

export const PurchaseBottomSheet: React.FC<PurchaseBottomSheetProps> = ({
  isOpen,
  courseDetail,
  selectedModule,
  selectedLesson,
  isInCart,
  onClose,
  onModuleClick,
  onLessonClick,
  onCartAction,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto"; // cleanup
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCartClick = () => {
    onCartAction();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden">
        {/* Drag Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Sheet Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-50px)]">
          <div className="bg-linear-(--gradient-amber) rounded-t-3xl p-6 text-white">
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
              <div className="mt-6 space-y-4">
                <button
                  onClick={handleCartClick}
                  className={`w-full py-3 px-4 rounded-10 transition-all font-semibold text-sm ${
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
