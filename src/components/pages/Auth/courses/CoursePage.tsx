"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { Search } from "lucide-react";
import { CourseCard } from "@/components/common/CourseCard/CourseCard";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchDashboardHome } from "@/store/slices/courseSlice";
import { fetchDegreeYears } from "@/store/slices/degreeYearsSlice";
import { filterCourses } from "@/store/slices/courseSlice";
import { Course, DegreeYear } from "@/types";
import toast from "react-hot-toast";
import { SkeletonGrid } from "@/components/common/SkeletonGrid/SkeletonGrid";

export default function CoursesPage() {
  const t = useTranslations("Courses");
  const dispatch = useDispatch<AppDispatch>();

  const {
    userProfile,
    loading,
    error,
    filteredCourses: apiFilteredCourses,
    filterLoading,
  } = useSelector((state: RootState) => state.course);

  const { degrees, loading: degreesLoading } = useSelector(
    (state: RootState) => state.degreeYears
  );

  const [searchInput, setSearchInput] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("כל התארים");
  const [selectedYear, setSelectedYear] = useState("כל השנים");
  const [isDegreeDropdownOpen, setIsDegreeDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [degreeSearch, setDegreeSearch] = useState("");
  const [yearSearch, setYearSearch] = useState("");

  const degreeDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  const searchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    dispatch(fetchDashboardHome());
    dispatch(fetchDegreeYears());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        degreeDropdownRef.current &&
        !degreeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDegreeDropdownOpen(false);
      }
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(event.target as Node)
      ) {
        setIsYearDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (error) toast.error(`Error: ${error}`);
  }, [error]);

  const hasValidFiltersForAPI = useCallback(() => {
    const hasKeyword = searchInput.trim() !== "";
    const hasDegree = selectedDegree !== "כל התארים";
    const hasYear = selectedYear !== "כל השנים";

    return hasKeyword || hasDegree || hasYear;
  }, [searchInput, selectedDegree, selectedYear]);

  const handleFilter = useCallback(() => {
    if (!hasValidFiltersForAPI()) {
      return;
    }

    const filters: {
      keyword?: string;
      degree_id?: number;
      year_id?: number;
    } = {};

    if (searchInput.trim()) {
      filters.keyword = searchInput.trim();
    }

    if (selectedDegree !== "כל התארים") {
      const selectedDegreeData = degrees?.find(
        (d) => d.name === selectedDegree
      );
      if (selectedDegreeData) {
        filters.degree_id = selectedDegreeData.id;
      }
    }

    if (selectedYear !== "כל השנים") {
      let selectedYearData;

      if (selectedDegree !== "כל התארים") {
        const selectedDegreeData = degrees?.find(
          (d) => d.name === selectedDegree
        );
        selectedYearData = selectedDegreeData?.years?.find(
          (y) => y.name === selectedYear
        );
      } else {
        for (const degree of degrees || []) {
          const foundYear = degree.years?.find((y) => y.name === selectedYear);
          if (foundYear) {
            selectedYearData = foundYear;
            break;
          }
        }
      }

      if (selectedYearData) {
        filters.year_id = selectedYearData.id;
      }
    }

    if (Object.keys(filters).length > 0) {
      dispatch(filterCourses(filters));
    }
  }, [
    searchInput,
    selectedDegree,
    selectedYear,
    degrees,
    dispatch,
    hasValidFiltersForAPI,
  ]);

  useEffect(() => {
    if (searchTimeoutRef.current !== null) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = window.setTimeout(() => {
      handleFilter();
    }, 500);

    return () => {
      if (searchTimeoutRef.current !== null) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [handleFilter]);

  const availableDegrees = useMemo(() => {
    if (!degrees) return ["כל התארים"];
    const degreeNames = degrees.map((degree) => degree.name);
    return ["כל התארים", ...degreeNames];
  }, [degrees]);

  const availableYears = useMemo(() => {
    if (!degrees) return ["כל השנים"];

    if (selectedDegree === "כל התארים") {
      const allYears = degrees.flatMap(
        (degree) => degree.years?.map((year) => year.name) || []
      );
      return ["כל השנים", ...Array.from(new Set(allYears))];
    } else {
      const selectedDegreeData = degrees.find((d) => d.name === selectedDegree);
      if (!selectedDegreeData?.years) return ["כל השנים"];
      const years = selectedDegreeData.years.map((year) => year.name);
      return ["כל השנים", ...years];
    }
  }, [degrees, selectedDegree]);

  const filteredDegrees = useMemo(() => {
    return availableDegrees.filter((degree) =>
      degree.toLowerCase().includes(degreeSearch.toLowerCase())
    );
  }, [availableDegrees, degreeSearch]);

  const filteredYears = useMemo(() => {
    return availableYears.filter((year) =>
      year.toLowerCase().includes(yearSearch.toLowerCase())
    );
  }, [availableYears, yearSearch]);

  const allCourses = useMemo(() => {
    if (!userProfile?.degree_years) return [];
    return userProfile.degree_years.flatMap(
      (degreeYear: DegreeYear) => degreeYear.courses || []
    );
  }, [userProfile]);

  const clientFilteredCourses = useMemo(() => {
    let filtered = allCourses;

    if (searchInput.trim()) {
      filtered = filtered.filter((course: Course) =>
        course.name.toLowerCase().includes(searchInput.toLowerCase())
      );
    }

    if (
      (selectedDegree !== "כל התארים" || selectedYear !== "כל השנים") &&
      userProfile?.degree_years &&
      degrees
    ) {
      const selectedDegreeData = degrees.find((d) => d.name === selectedDegree);
      const selectedDegreeId = selectedDegreeData?.id;

      let selectedYearId: number | undefined;

      if (selectedYear !== "כל השנים" && selectedDegreeData) {
        const selectedYearData = (selectedDegreeData.years ?? []).find(
          (y) => y.name === selectedYear
        );
        selectedYearId = selectedYearData?.id;
      }

      const matchingDegreeYears = userProfile.degree_years.filter(
        (degreeYear: DegreeYear) => {
          const degreeMatch =
            selectedDegree === "כל התארים" ||
            degreeYear.degree_id === selectedDegreeId;
          const yearMatch =
            selectedYear === "כל השנים" ||
            degreeYear.year_id === selectedYearId;
          return degreeMatch && yearMatch;
        }
      );

      const filteredCoursesFromDegreeYears = matchingDegreeYears.flatMap(
        (degreeYear: DegreeYear) => degreeYear.courses || []
      );

      filtered = filtered.filter((course: Course) =>
        filteredCoursesFromDegreeYears.some((c: Course) => c.id === course.id)
      );
    }

    return filtered;
  }, [
    allCourses,
    searchInput,
    selectedDegree,
    selectedYear,
    userProfile,
    degrees,
  ]);

  const displayCourses = useMemo(() => {
    if (hasValidFiltersForAPI() && apiFilteredCourses) {
      return apiFilteredCourses;
    }

    return clientFilteredCourses;
  }, [hasValidFiltersForAPI, apiFilteredCourses, clientFilteredCourses]);

  const handleDegreeSelect = (degree: string) => {
    setSelectedDegree(degree);
    setIsDegreeDropdownOpen(false);
    setSelectedYear("כל השנים");
    setDegreeSearch("");
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    setIsYearDropdownOpen(false);
    setYearSearch("");
  };

  const handleClearSearch = () => {
    setSearchInput("");
  };

  const isLoading = loading || filterLoading;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-charcoal-blue">
          {t("ourCourses")}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-4">
        <div className="relative lg:col-span-1">
          <div className="relative">
            <Input
              type="text"
              placeholder={t("searchCourses")}
              className="pr-4 pr-10 text-right h-12 border-amber-gold rounded-xl w-full"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  handleClearSearch();
                }
              }}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        <div className="flex lg:col-span-2 justify-end">
          <div className="relative" ref={degreeDropdownRef}>
            <button
              className="flex items-center justify-center gap-1 px-4 py-2 rounded-xl   transition-colors min-w-[160px]"
              onClick={() => setIsDegreeDropdownOpen(!isDegreeDropdownOpen)}
              disabled={degreesLoading}
            >
              <span className="text-base text-slate-gray font-bold ">
                {degreesLoading ? "טוען..." : selectedDegree}
              </span>
              <Image
                src={"/assets/images/icons/circlesfour.svg"}
                width={20}
                height={20}
                alt="degree-filter"
              />
            </button>

            {isDegreeDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border-1.5 rounded shadow-md border-amber-gold z-10">
                <div className="p-2 border-b border-gray-200">
                  <Input
                    type="text"
                    placeholder="חיפוש תואר..."
                    value={degreeSearch}
                    onChange={(e) => setDegreeSearch(e.target.value)}
                    className="text-right"
                  />
                </div>
                <ul className="max-h-60 overflow-y-auto">
                  {filteredDegrees.map((degree) => (
                    <li
                      key={degree}
                      className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-right ${
                        selectedDegree === degree ? "bg-amber-50" : ""
                      }`}
                      onClick={() => handleDegreeSelect(degree)}
                    >
                      {degree}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="relative" ref={yearDropdownRef}>
            <button
              className="flex items-center justify-center gap-1 px-4 py-2 rounded-xl   transition-colors min-w-[140px]"
              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
            >
              <span className="text-base text-slate-gray font-bold">
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
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border-1.5 rounded shadow-md border-amber-gold z-10">
                <div className="p-2 border-b border-gray-200">
                  <Input
                    type="text"
                    placeholder="חיפוש שנה..."
                    value={yearSearch}
                    onChange={(e) => setYearSearch(e.target.value)}
                    className="text-right"
                  />
                </div>
                <ul className="max-h-60 overflow-y-auto">
                  {filteredYears.map((year) => (
                    <li
                      key={year}
                      className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-right ${
                        selectedYear === year ? "bg-amber-50" : ""
                      }`}
                      onClick={() => handleYearSelect(year)}
                    >
                      {year}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <SkeletonGrid count={8} />
      ) : displayCourses.length === 0 ? (
        <div className="flex items-center justify-center mt-12">
          <p className="text-xl text-gray-500">לא נמצאו קורסים</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {displayCourses.map((course: Course) => (
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
