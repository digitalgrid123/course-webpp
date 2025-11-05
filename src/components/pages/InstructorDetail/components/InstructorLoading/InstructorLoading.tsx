// components/InstructorLoading/InstructorLoading.tsx
import React from "react";
import { SkeletonGrid } from "@/components/common/SkeletonGrid/SkeletonGrid";

export const InstructorLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-white px-4 sm:px-8 py-8" dir="rtl">
      <div className="animate-pulse mb-8">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      </div>

      <div className="sm:py-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="sticky top-8 space-y-6">
              <div className="bg-gray-200 rounded-2xl p-8 h-96 animate-pulse"></div>

              <div className="bg-gray-200 rounded-2xl p-6 h-48 animate-pulse"></div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-gray-200 rounded-2xl p-8 h-32 animate-pulse"></div>

            <div className="bg-gray-200 rounded-2xl p-8 h-96 animate-pulse">
              <div className="flex justify-center space-x-8 mb-6">
                <div className="h-10 bg-gray-300 rounded w-32"></div>
                <div className="h-10 bg-gray-300 rounded w-32"></div>
              </div>
              <SkeletonGrid count={6} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
