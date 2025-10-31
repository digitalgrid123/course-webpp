"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  const [selectedYear, setSelectedYear] = useState("כל השנים");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchDashboardHome());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(event.target as Node)
      ) {
        setIsYearDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  // Extract unique years from degree_years
  const availableYears = useMemo(() => {
    if (!userProfile?.degree_years) return [];
    const years = userProfile.degree_years.map((degreeYear: DegreeYear) => {
      // The year property can be either a string or a Year object
      const yearValue = degreeYear.year as string | { name: string };
      if (typeof yearValue === "string") {
        return yearValue;
      }
      return yearValue?.name || "";
    });
    return ["כל השנים", ...Array.from(new Set(years)).filter(Boolean)];
  }, [userProfile]);

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

    // Note: Category filtering is commented out since there's no category field in the data
    // If you want to implement category filtering, you'll need to add a category field to your Course type
    // and populate it in your data
    // if (selectedCategory !== t("allCourses")) {
    //   filtered = filtered.filter((course: Course) =>
    //     course.category === selectedCategory
    //   );
    // }

    // Filter by year
    if (selectedYear !== "כל השנים" && userProfile?.degree_years) {
      const yearCourses = userProfile.degree_years
        .filter((degreeYear: DegreeYear) => {
          const yearValue = degreeYear.year as string | { name: string };
          const yearName =
            typeof yearValue === "string" ? yearValue : yearValue?.name || "";
          return yearName === selectedYear;
        })
        .flatMap((degreeYear: DegreeYear) => degreeYear.courses || []);

      filtered = filtered.filter((course: Course) =>
        yearCourses.some((yearCourse: Course) => yearCourse.id === course.id)
      );
    }

    return filtered;
  }, [allCourses, searchTerm, selectedYear, userProfile]);

  const handleSearch = () => {};

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsCategoryDropdownOpen(false);
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    setIsYearDropdownOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-charcoal-blue">
          {t("ourCourses")}
        </h1>
      </div>

      <div className="grid grid-cols-2 items-center gap-4 relative">
        <div className="relative h-12">
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

        <div className="flex gap-4 justify-end">
          <div className="relative" ref={categoryDropdownRef}>
            <button
              className="flex items-center justify-center gap-1 px-4 py-2 rounded-xl w-full"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            >
              <span className="text-base text-slate-gray font-bold truncate">
                {selectedCategory}
              </span>
              <Image
                src={"/assets/images/icons/circlesfour.svg"}
                width={20}
                height={20}
                alt="circle-four"
              />
            </button>

            {isCategoryDropdownOpen && (
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
          <div className="relative" ref={yearDropdownRef}>
            <button
              className="flex items-center justify-center gap-1 px-4 py-2 rounded-xl w-full"
              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
            >
              <span className="text-base text-slate-gray font-bold truncate">
                {selectedYear}
              </span>
              <Image
                src={"/assets/images/icons/chartBar.svg"}
                width={20}
                height={20}
                alt="year-filter"
              />
            </button>

            {isYearDropdownOpen && (
              <ul className="absolute top-full left-2 mt-2 w-40 bg-white border-1.5 rounded shadow-md border-amber-gold z-10">
                {availableYears.map((year) => (
                  <li
                    key={year}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleYearSelect(year)}
                  >
                    {year}
                  </li>
                ))}
              </ul>
            )}
          </div>
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
              level={`${course.course_point} נק״ז`}
              image={course.image}
            />
          ))}
        </div>
      )}
    </div>
  );
}
