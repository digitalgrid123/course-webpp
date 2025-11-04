"use client";

import Breadcrumb from "@/components/common/Breadcrumb/Breadcrumb";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchTeacherDetail,
  clearTeacherDetail,
} from "@/store/slices/teacherSlice";
import { CourseCard } from "@/components/common/CourseCard/CourseCard";
import { getFullUrl } from "@/utils/helper";
import toast from "react-hot-toast";
import { SkeletonGrid } from "@/components/common/SkeletonGrid/SkeletonGrid";

interface InstructorDetailProps {
  id: string;
}

const InstructorDetail: React.FC<InstructorDetailProps> = ({ id }) => {
  const [activeTab, setActiveTab] = useState("courses");
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { teacher, loading, error } = useSelector(
    (state: RootState) => state.teacher.detail
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchTeacherDetail(parseInt(id)));
    }

    return () => {
      dispatch(clearTeacherDetail());
    };
  }, [id, dispatch]);

  // Show toast notification when there's an error
  useEffect(() => {
    if (error) {
      toast.error(error, {
        duration: 5000,
        position: "top-right",
      });
    }
  }, [error]);

  const handleBackNavigation = () => {
    router.back();
  };

  const stripHtml = (html: string) => {
    if (typeof document === "undefined") return html;
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white px-8 py-8" dir="rtl">
        {/* Breadcrumb Skeleton */}
        <div className="animate-pulse mb-8">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>

        <div className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1 order-first lg:order-last">
              <div className="sticky top-8 space-y-6">
                {/* Instructor Card Skeleton */}
                <div className="bg-gray-200 rounded-2xl p-8 h-96 animate-pulse"></div>

                {/* Stats Card Skeleton */}
                <div className="bg-gray-200 rounded-2xl p-6 h-48 animate-pulse"></div>
              </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="lg:col-span-3 space-y-6">
              {/* Header Skeleton */}
              <div className="bg-gray-200 rounded-2xl p-8 h-32 animate-pulse"></div>

              {/* Tabs Skeleton */}
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
  }

  if (error) {
    return (
      <div
        className="min-h-screen bg-white px-8 py-8 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl text-red-500 mb-2">שגיאה בטעינת המרצה</div>
          <div className="text-gray-600">{error}</div>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-charcoal-blue text-white rounded-lg hover:bg-opacity-90 transition-all"
          >
            חזור אחורה
          </button>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-white px-8 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👨‍🏫</div>
          <div className="text-xl text-gray-500">
            לא נמצאו נתונים עבור המרצה
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-charcoal-blue text-white rounded-lg hover:bg-opacity-90 transition-all"
          >
            חזור אחורה
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-8 py-8" dir="rtl">
      <Breadcrumb
        items={[{ label: "ראשי" }, { label: "מרצים" }, { label: teacher.name }]}
        onBack={handleBackNavigation}
      />

      <div className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="sticky top-8">
              <div className="bg-linear-(--gradient-amber) rounded-2xl p-8 text-white mb-6">
                <div className="flex flex-col items-center">
                  <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white/20 mb-6">
                    {teacher.image ? (
                      <Image
                        src={getFullUrl(teacher.image)}
                        alt={teacher.name}
                        fill
                        style={{ objectFit: "cover" }}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/20 text-white">
                        <svg
                          className="w-12 h-12"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Instructor Name */}
                  <h1 className="text-xl font-bold text-center mb-4">
                    {teacher.name}
                  </h1>

                  {/* Courses Count */}
                  <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
                    <svg
                      className="w-5 h-5"
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

                    <p className="text-sm font-medium">
                      <span className="ml-1 text-amber-700 font-bold">
                        {teacher.courses_count}{" "}
                      </span>
                      {teacher.courses_count === 1 ? " קורס" : " קורסים"}
                    </p>
                  </div>

                  {/* Bio */}
                  <div className="w-full">
                    <h3 className="font-bold text-sm mb-3 text-right">
                      קצת עליי:
                    </h3>
                    <div className="h-full max-h-64 overflow-y-auto text-xs text-white/90 text-right space-y-3 custom-scrollbar">
                      {teacher.bio && (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: teacher.bio,
                          }}
                        ></div>
                      )}
                      {teacher.detail && (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: teacher.detail,
                          }}
                        ></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-linear-(--gradient-amber) rounded-2xl p-6 text-white">
                <h3 className="text-center font-bold text-base mb-4">
                  סטטיסטיקות
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">סה&quot;כ קורסים</span>

                    <span className="font-bold text-lg">
                      {teacher.courses_count}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">סה&quot;כ סטודנטים</span>

                    <span className="font-bold text-lg">
                      {teacher.courses?.reduce(
                        (total, course) => total + (course.students_count || 0),
                        0
                      ) || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-orange-soft p-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-charcoal-blue mb-4">
                  {teacher.name}
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
                  {teacher.bio && stripHtml(teacher.bio)}
                </p>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-2xl shadow-orange-soft overflow-hidden">
              <div className="border-b-2 border-solid border-gray-200">
                <div className="flex justify-center">
                  <button
                    onClick={() => setActiveTab("courses")}
                    className={`px-8 py-4 transition-all relative ${
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
                    onClick={() => setActiveTab("about")}
                    className={`px-8 py-4 transition-all relative ${
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

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === "courses" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-charcoal-blue mb-6">
                      הקורסים של {teacher.name}
                    </h2>

                    {teacher.courses && teacher.courses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <div className="text-center py-12">
                        <svg
                          className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
                        <p className="text-gray-500 text-lg">
                          אין קורסים זמינים ממרצה זה עדיין
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          הקורסים יופיעו כאן ברגע שיתווספו
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "about" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-charcoal-blue">
                      אודות {teacher.name}
                    </h2>

                    <div className="prose prose-lg max-w-none text-gray-700">
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDetail;
