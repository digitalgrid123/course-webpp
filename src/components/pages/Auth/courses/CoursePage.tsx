"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { CourseCard } from "@/components/common/CourseCard/CourseCard";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchDashboardHome } from "@/store/slices/courseSlice";
import { Course, DegreeYear } from "@/types";
import toast from "react-hot-toast";
import { SkeletonGrid } from "@/components/common/SkeletonGrid/SkeletonGrid";

export default function CoursesPage() {
  const t = useTranslations("Courses");
  const dispatch = useDispatch<AppDispatch>();

  const { userProfile, loading, error } = useSelector(
    (state: RootState) => state.course
  );

  const categories = [t("allCourses"), "מדעים", "חשבונאות", "מתמטיקה"];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(t("allCourses"));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardHome());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  const allCourses = useMemo(() => {
    if (!userProfile?.degree_years) return [];
    return userProfile.degree_years.flatMap(
      (degreeYear: DegreeYear) => degreeYear.courses || []
    );
  }, [userProfile]);

  const filteredCourses = useMemo(() => {
    let filtered = allCourses.filter((course: Course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCategory !== t("allCourses")) {
      filtered = filtered;
    }

    return filtered;
  }, [allCourses, searchTerm, selectedCategory, t]);

  const handleSearch = () => {};

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-charcoal-blue">
          {t("ourCourses")}
        </h1>
      </div>

      <div className="grid grid-cols-10 items-center gap-4 justify-between relative">
        <div className="relative h-12 col-span-5">
          <Input
            type="text"
            placeholder={t("searchCourses")}
            className="pr-12 text-right h-full border-amber-gold rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Search
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer"
            onClick={handleSearch}
          />
        </div>

        <div className="relative col-span-5 flex justify-end">
          <button
            className="flex items-center justify-center gap-1 px-4 py-2 rounded-xl"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="text-base text-slate-gray font-medium truncate">
              {selectedCategory}
            </span>
            <Image
              src={"/assets/images/icons/circlesfour.svg"}
              width={20}
              height={20}
              alt="circle-four"
            />
          </button>

          {isDropdownOpen && (
            <ul className="absolute top-full left-2 mt-2 w-40 bg-white border-1.5 rounded shadow-md border-amber-gold z-10">
              {categories.map((cat) => (
                <li
                  key={cat}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {loading ? (
        <SkeletonGrid count={8} />
      ) : filteredCourses.length === 0 ? (
        <div className="flex items-center justify-center mt-12">
          <p className="text-xl text-gray-500">לא נמצאו קורסים</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {filteredCourses.map((course: Course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.name}
              instructor={course.teacher.name}
              level={`${course.course_point} points`}
              image={course.image}
            />
          ))}
        </div>
      )}
    </div>
  );
}
