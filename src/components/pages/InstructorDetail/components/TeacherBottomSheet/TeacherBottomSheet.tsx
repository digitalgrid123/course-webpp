// components/TeacherBottomSheet/TeacherBottomSheet.tsx
import React, { useEffect } from "react";

import { TeacherSidebar } from "../TeacherSidebar/TeacherSidebar";
import { Teacher } from "@/types";

interface TeacherBottomSheetProps {
  isOpen: boolean;
  teacher: Teacher;
  onClose: () => void;
  onBackdropClick: (e: React.MouseEvent) => void;
}

export const TeacherBottomSheet: React.FC<TeacherBottomSheetProps> = ({
  isOpen,
  teacher,
  onClose,
  onBackdropClick,
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

  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300"
      onClick={onBackdropClick}
    >
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden">
        {/* Drag Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Sheet Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-50px)]">
          <TeacherSidebar teacher={teacher} isMobile={true} />

          {/* Close Button */}
          <div className="p-6 bg-white">
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-charcoal-blue py-3 px-6 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all duration-200"
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
