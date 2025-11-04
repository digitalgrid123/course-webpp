"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";

import { fetchTeachersList } from "@/store/slices/teacherSlice";
import { Teacher } from "@/types";
import { RootState, useAppDispatch, useAppSelector } from "@/store";
import { SkeletonGrid } from "@/components/common/SkeletonGrid/SkeletonGrid";
import { TeacherCard } from "./components/TeacherCard";

export default function InstructorsPage() {
  const t = useTranslations("Instructors");
  const dispatch = useAppDispatch();

  const { teachers, loading, error } = useAppSelector(
    (state: RootState) => state.teacher.list
  );

  useEffect(() => {
    dispatch(fetchTeachersList());
  }, [dispatch]);

  // Show toast notification when there's an error
  useEffect(() => {
    if (error) {
      toast.error(error, {
        duration: 5000,
        position: "top-right",
      });
    }
  }, [error]);

  if (loading) {
    return <SkeletonGrid count={8} />;
  }

  if (!teachers || teachers.length === 0) {
    return (
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-charcoal-blue">
            {t("allInstructors")}
          </h1>
        </div>
        <div className="flex flex-col justify-center items-center space-y-4 flex-1">
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <div className="text-lg text-gray-500 text-center">
            {t("noInstructors")}
          </div>
          <p className="text-sm text-gray-400 text-center max-w-md">
            {t("noInstructorsDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-charcoal-blue">
          {t("allInstructors")}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        {teachers.map((teacher: Teacher) => (
          <TeacherCard
            key={teacher.id}
            id={teacher.id}
            name={teacher.name}
            bio={teacher.bio}
            image={teacher.image}
            coursesCount={teacher.courses_count}
            detail={teacher.detail}
          />
        ))}
      </div>
    </div>
  );
}
