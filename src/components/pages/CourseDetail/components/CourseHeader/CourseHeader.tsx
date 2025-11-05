// components/CourseHeader/CourseHeader.tsx
import React from "react";
import Image from "next/image";
import { CourseDetail } from "@/types";

interface CourseHeaderProps {
  courseDetail: CourseDetail;
  lessonName: string | null;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({
  courseDetail,
  lessonName,
}) => {
  return (
    <>
      <div className="sm:p-6">
        <h1 className="text-3xl font-bold text-charcoal-blue mb-5 text-center sm:block hidden">
          {lessonName || courseDetail.name}
        </h1>
        <div className="flex items-center sm:justify-between justify-center gap-6 sm:gap-4 text-charcoal-blue text-sm">
          <div className="flex items-center gap-2">
            מרצה: {courseDetail.teacher.name}
          </div>

          <div className="flex items-center gap-2">
            {courseDetail.modules_count} מודולים
            <Image
              src={"/assets/images/icons/module.svg"}
              width={16}
              height={16}
              alt="module"
            />
          </div>
        </div>
      </div>
    </>
  );
};
