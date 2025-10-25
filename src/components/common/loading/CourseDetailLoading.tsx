"use client";
import React from "react";

const CourseDetailLoading = () => {
  return (
    <div className="min-h-screen bg-white px-8 py-8">
      <div className="animate-pulse">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
      </div>

      <div className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="sticky top-8 space-y-6">
              <div className="bg-gray-100 rounded-2xl p-8 animate-pulse">
                <div className="flex flex-col items-center">
                  <div className="w-full mb-6">
                    <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
                    <div className="flex items-center gap-2.5 justify-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div className="h-4 bg-gray-300 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="w-full space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                    <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-300 rounded w-4/6"></div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 rounded-2xl p-8 animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-32 mx-auto mb-6"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 bg-gray-200 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-gray-300 rounded-lg flex-shrink-0"></div>
                      <div className="h-4 bg-gray-300 rounded flex-1"></div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 h-12 bg-gray-300 rounded-lg"></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-gray-100 rounded-4xl shadow-md overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-300 flex items-center justify-center">
                <div className="w-20 h-20 bg-gray-400 rounded-full"></div>
              </div>
            </div>

            <div className="p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto mb-5"></div>
              <div className="flex items-center justify-between gap-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>

            <div className="animate-pulse">
              <div className="border-b-2 border-gray-200 flex justify-center gap-4">
                <div className="h-12 bg-gray-200 rounded-t w-32"></div>
                <div className="h-12 bg-gray-200 rounded-t w-32"></div>
              </div>
              <div className="p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailLoading;
