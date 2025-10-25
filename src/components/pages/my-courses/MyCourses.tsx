"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";

import { fetchMyCourses } from "@/store/slices/courseSlice";
import { CourseCard } from "@/components/common/CourseCard/CourseCard";
import { Course } from "@/types";
import { RootState, useAppDispatch, useAppSelector } from "@/store";
import { SkeletonGrid } from "@/components/common/SkeletonGrid/SkeletonGrid";

export default function MyCourses() {
  const t = useTranslations("MyCourses");
  const dispatch = useAppDispatch();

  const { myCourses, myCoursesLoading, error } = useAppSelector(
    (state: RootState) => state.course
  );

  useEffect(() => {
    dispatch(fetchMyCourses());
  }, [dispatch]);

  if (myCoursesLoading) {
    return <SkeletonGrid count={8} />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-charcoal-blue">
            {t("myCourses")}
          </h1>
        </div>
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <svg
            className="w-16 h-16 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-lg text-red-500 text-center">{t("error")}</div>
          <button
            onClick={() => dispatch(fetchMyCourses())}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  if (!myCourses || myCourses.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-charcoal-blue">
            {t("myCourses")}
          </h1>
        </div>
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <svg
            className="w-20 h-20 text-gray-400"
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
          <div className="text-lg text-gray-500 text-center">
            {t("noCourses")}
          </div>
          <p className="text-sm text-gray-400 text-center max-w-md">
            {t("noCoursesDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-charcoal-blue">
          {t("myCourses")}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        {myCourses.map((course: Course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.name}
            instructor={course.teacher?.name || t("unknownInstructor")}
            image={course.image}
          />
        ))}
      </div>
    </div>
  );
}
