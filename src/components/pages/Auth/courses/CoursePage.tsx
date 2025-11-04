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
import { Dropdown, DropdownOption } from "@/components/common/Form/Dropdown";

// Local storage keys
const FILTER_STORAGE_KEY = "course_filters";

interface StoredFilters {
  search: string;
  degree: string;
  year: string;
}

export default function CoursesPage() {
  const t = useTranslations("Courses");
  const dispatch = useDispatch<AppDispatch>();

  const {
    userProfile,
    loading,
    error,
    filteredCourses: apiFilteredCourses,
    filterLoading,
    errorType,
  } = useSelector((state: RootState) => state.course);

  const { degrees, loading: degreesLoading } = useSelector(
    (state: RootState) => state.degreeYears
  );

  // Load filters from localStorage on component mount
  const getStoredFilters = (): StoredFilters => {
    if (typeof window === "undefined") {
      return { search: "", degree: "", year: "" };
    }

    try {
      const stored = localStorage.getItem(FILTER_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error loading filters from localStorage:", error);
    }

    return { search: "", degree: "", year: "" };
  };

  // Initialize state from localStorage
  const [searchInput, setSearchInput] = useState(
    () => getStoredFilters().search
  );
  const [selectedDegree, setSelectedDegree] = useState(
    () => getStoredFilters().degree
  );
  const [selectedYear, setSelectedYear] = useState(
    () => getStoredFilters().year
  );

  const searchTimeoutRef = useRef<number | null>(null);

  // Save filters to localStorage
  const saveFiltersToStorage = useCallback(
    (search: string, degree: string, year: string) => {
      if (typeof window === "undefined") return;

      try {
        const filters: StoredFilters = { search, degree, year };
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
      } catch (error) {
        console.error("Error saving filters to localStorage:", error);
      }
    },
    []
  );

  // Clear all filters from storage
  const clearFiltersFromStorage = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(FILTER_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing filters from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    dispatch(fetchDashboardHome());
    dispatch(fetchDegreeYears());
  }, [dispatch]);

  useEffect(() => {
    if (error && errorType !== "filter") {
      toast.error(`Error: ${error}`);
    }
  }, [error, errorType]);

  // Check if filters are applied (not showing default user courses)
  const hasValidFiltersForAPI = useCallback(() => {
    const hasKeyword = searchInput.trim() !== "";
    const hasDegreeFilter = selectedDegree !== "";
    const hasYearFilter = selectedYear !== "";

    return hasKeyword || hasDegreeFilter || hasYearFilter;
  }, [searchInput, selectedDegree, selectedYear]);

  const handleFilter = useCallback(() => {
    // Save filters to localStorage
    saveFiltersToStorage(searchInput, selectedDegree, selectedYear);

    // If no filters applied, don't call API (show default user courses)
    if (!hasValidFiltersForAPI()) {
      return;
    }

    const filters: {
      keyword?: string;
      degree_id?: number;
      year_id?: number;
      all_degrees?: number;
      all_years?: number;
    } = {};

    // Add keyword if present
    if (searchInput.trim()) {
      filters.keyword = searchInput.trim();
    }

    // Handle degree selection
    if (selectedDegree === "כל התארים") {
      filters.all_degrees = 1;
    } else if (selectedDegree !== "") {
      const selectedDegreeData = degrees?.find(
        (d) => d.name === selectedDegree
      );
      if (selectedDegreeData) {
        filters.degree_id = selectedDegreeData.id;
      }
    }

    // Handle year selection
    if (selectedYear === "כל השנים") {
      filters.all_years = 1;
    } else if (selectedYear !== "") {
      let selectedYearData;

      if (selectedDegree !== "" && selectedDegree !== "כל התארים") {
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

    // Dispatch the filter action
    dispatch(filterCourses(filters));
  }, [
    searchInput,
    selectedDegree,
    selectedYear,
    degrees,
    dispatch,
    hasValidFiltersForAPI,
    saveFiltersToStorage,
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

  // Prepare dropdown options
  const degreeOptions: DropdownOption[] = useMemo(() => {
    if (!degrees)
      return [
        { value: "", label: "התואר שלי" },
        { value: "כל התארים", label: "כל התארים" },
      ];

    const degreeOptions = degrees.map((degree) => ({
      value: degree.name,
      label: degree.name,
    }));

    return [
      { value: "", label: "התואר שלי" },
      { value: "כל התארים", label: "כל התארים" },
      ...degreeOptions,
    ];
  }, [degrees]);

  const yearOptions: DropdownOption[] = useMemo(() => {
    if (!degrees)
      return [
        { value: "", label: "השנה שלי" },
        { value: "כל השנים", label: "כל השנים" },
      ];

    let years: string[] = [];

    if (selectedDegree === "" || selectedDegree === "כל התארים") {
      years = degrees.flatMap(
        (degree) => degree.years?.map((year) => year.name) || []
      );
    } else {
      const selectedDegreeData = degrees.find((d) => d.name === selectedDegree);
      years = selectedDegreeData?.years?.map((year) => year.name) || [];
    }

    const uniqueYears = Array.from(new Set(years));
    const yearOptions = uniqueYears.map((year) => ({
      value: year,
      label: year,
    }));

    return [
      { value: "", label: "השנה שלי" },
      { value: "כל השנים", label: "כל השנים" },
      ...yearOptions,
    ];
  }, [degrees, selectedDegree]);

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
      (selectedDegree !== "" || selectedYear !== "") &&
      userProfile?.degree_years &&
      degrees
    ) {
      const selectedDegreeData = degrees.find((d) => d.name === selectedDegree);
      const selectedDegreeId = selectedDegreeData?.id;

      let selectedYearId: number | undefined;

      if (
        selectedYear !== "" &&
        selectedYear !== "כל השנים" &&
        selectedDegreeData
      ) {
        const selectedYearData = (selectedDegreeData.years ?? []).find(
          (y) => y.name === selectedYear
        );
        selectedYearId = selectedYearData?.id;
      }

      const matchingDegreeYears = userProfile.degree_years.filter(
        (degreeYear: DegreeYear) => {
          const degreeMatch =
            selectedDegree === "" ||
            selectedDegree === "כל התארים" ||
            degreeYear.degree_id === selectedDegreeId;
          const yearMatch =
            selectedYear === "" ||
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

  // Show API results when filters are applied, otherwise show user's courses
  const displayCourses = useMemo(() => {
    if (hasValidFiltersForAPI() && apiFilteredCourses) {
      return apiFilteredCourses;
    }
    return clientFilteredCourses;
  }, [hasValidFiltersForAPI, apiFilteredCourses, clientFilteredCourses]);

  const handleDegreeSelect = (degree: string) => {
    setSelectedDegree(degree);
    // Reset year when degree changes
    setSelectedYear("");
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSelectedDegree("");
    setSelectedYear("");
    clearFiltersFromStorage();
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

        <div className="flex gap-1 lg:col-span-2 lg:justify-end justify-center">
          <Dropdown
            options={degreeOptions}
            selectedValue={selectedDegree}
            onSelect={handleDegreeSelect}
            placeholder="התואר שלי"
            searchPlaceholder="חיפוש תואר..."
            iconSrc="/assets/images/icons/circlesfour.svg"
            iconAlt="degree-filter"
            disabled={degreesLoading}
            loading={degreesLoading}
          />

          <Dropdown
            options={yearOptions}
            selectedValue={selectedYear}
            onSelect={handleYearSelect}
            placeholder="השנה שלי"
            searchPlaceholder="חיפוש שנה..."
            iconSrc="/assets/images/icons/chartBar.svg"
            iconAlt="year-filter"
          />
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
