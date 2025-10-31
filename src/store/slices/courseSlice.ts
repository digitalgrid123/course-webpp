import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getDashboardHomeApi,
  getCourseDetailApi,
  updateLessonProgressApi,
  getMyCoursesApi,
  filterCoursesApi,
} from "@/services/courseApi";
import {
  UserProfile,
  CourseDetailData,
  CourseDetailRequest,
  LessonProgressRequest,
  LessonProgressData,
  Course,
} from "@/types";
import { AxiosError } from "axios";

interface CourseState {
  userProfile: UserProfile | null;
  courseDetail: CourseDetailData | null;
  myCourses: Course[] | null;
  loading: boolean;
  detailLoading: boolean;
  progressLoading: boolean;
  myCoursesLoading: boolean;
  error: string | null;
  fieldErrors: Record<string, string[]> | null;
  successMessage: string | null;
  filteredCourses: Course[] | null;
  filterLoading: boolean;
}

interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

const initialState: CourseState = {
  userProfile: null,
  courseDetail: null,
  myCourses: null,
  loading: false,
  detailLoading: false,
  progressLoading: false,
  myCoursesLoading: false,
  error: null,
  fieldErrors: null,
  successMessage: null,
  filteredCourses: null,
  filterLoading: false,
};

const saveProgressToLocalStorage = (
  courseId: number,
  lessonId: number,
  progress: number
) => {
  try {
    const key = `lesson_progress_${courseId}_${lessonId}`;
    const data = {
      progress,
      timestamp: Date.now(),
      courseId,
      lessonId,
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save progress to localStorage:", error);
  }
};

const getProgressFromLocalStorage = (
  courseId: number,
  lessonId: number
): number | null => {
  try {
    const key = `lesson_progress_${courseId}_${lessonId}`;
    const data = localStorage.getItem(key);

    if (data) {
      const parsed = JSON.parse(data);
      return parsed.progress;
    }
  } catch (error) {
    console.error("Failed to get progress from localStorage:", error);
  }
  return null;
};

export const fetchDashboardHome = createAsyncThunk<
  { data: UserProfile; message: string },
  void,
  { rejectValue: ErrorResponse }
>("course/fetchDashboardHome", async (_, { rejectWithValue }) => {
  try {
    const response = await getDashboardHomeApi();
    if (response.status && response.data) {
      return { data: response.data, message: response.message };
    } else {
      return rejectWithValue({
        message: response.message || "Failed to fetch dashboard data",
        errors: response.errors ?? undefined,
      });
    }
  } catch (error: unknown) {
    let message = "Failed to fetch dashboard data";
    let errors: Record<string, string[]> | undefined;

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as AxiosError<{
        message: string;
        errors?: Record<string, string[]> | null;
      }>;
      message = axiosError.response?.data?.message || message;
      errors = axiosError.response?.data?.errors ?? undefined;
    }

    return rejectWithValue({ message, errors });
  }
});

export const fetchMyCourses = createAsyncThunk<
  { data: Course[]; message: string },
  void,
  { rejectValue: ErrorResponse }
>("course/fetchMyCourses", async (_, { rejectWithValue }) => {
  try {
    const response = await getMyCoursesApi();
    if (response.status && response.data) {
      return {
        data: response.data.my_courses || [],
        message: response.message,
      };
    } else {
      return rejectWithValue({
        message: response.message || "Failed to fetch my courses",
        errors: response.errors ?? undefined,
      });
    }
  } catch (error: unknown) {
    let message = "Failed to fetch my courses";
    let errors: Record<string, string[]> | undefined;

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as AxiosError<{
        message: string;
        errors?: Record<string, string[]> | null;
      }>;
      message = axiosError.response?.data?.message || message;
      errors = axiosError.response?.data?.errors ?? undefined;
    }

    return rejectWithValue({ message, errors });
  }
});

export const fetchCourseDetail = createAsyncThunk<
  { data: CourseDetailData; message: string },
  CourseDetailRequest,
  { rejectValue: ErrorResponse }
>("course/fetchCourseDetail", async (request, { rejectWithValue }) => {
  try {
    const response = await getCourseDetailApi(request);
    if (response.status && response.data) {
      if (response.data.modules.length > 0) {
        response.data.modules.forEach((module) => {
          module.lessons.forEach((lesson) => {
            const localProgress = getProgressFromLocalStorage(
              response.data.id,
              lesson.id
            );
            const serverProgress = lesson.watched_progress || 0;
            const maxProgress = Math.max(serverProgress, localProgress || 0);

            if (maxProgress > serverProgress) {
              lesson.watched_progress = maxProgress;
            }
          });
        });
      }
      return { data: response.data, message: response.message };
    } else {
      return rejectWithValue({
        message: response.message || "Failed to fetch course details",
        errors: response.errors ?? undefined,
      });
    }
  } catch (error: unknown) {
    let message = "Failed to fetch course details";
    let errors: Record<string, string[]> | undefined;

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as AxiosError<{
        message: string;
        errors?: Record<string, string[]> | null;
      }>;
      message = axiosError.response?.data?.message || message;
      errors = axiosError.response?.data?.errors ?? undefined;
    }

    return rejectWithValue({ message, errors });
  }
});

export const updateLessonProgress = createAsyncThunk<
  {
    data: LessonProgressData | null;
    message: string;
    lessonId: number;
    progress: number;
    courseId: number;
  },
  LessonProgressRequest & { courseId: number },
  { rejectValue: ErrorResponse }
>("course/updateLessonProgress", async (request, { rejectWithValue }) => {
  try {
    const { courseId, ...apiRequest } = request;
    const response = await updateLessonProgressApi(apiRequest);
    if (response.status) {
      saveProgressToLocalStorage(courseId, request.lesson_id, request.progress);

      return {
        data: response.data || null,
        message: response.message || "Progress updated successfully",
        lessonId: request.lesson_id,
        progress: request.progress,
        courseId: courseId,
      };
    } else {
      saveProgressToLocalStorage(courseId, request.lesson_id, request.progress);

      return rejectWithValue({
        message: response.message || "Failed to update progress",
        errors: response.errors ?? undefined,
      });
    }
  } catch (error: unknown) {
    let message = "Failed to update progress";
    let errors: Record<string, string[]> | undefined;

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as AxiosError<{
        message: string;
        errors?: Record<string, string[]> | null;
      }>;
      message = axiosError.response?.data?.message || message;
      errors = axiosError.response?.data?.errors ?? undefined;
    }

    return rejectWithValue({ message, errors });
  }
});

export const filterCourses = createAsyncThunk<
  { data: Course[]; message: string },
  { keyword?: string; degree_id?: number; year_id?: number },
  { rejectValue: ErrorResponse }
>("course/filterCourses", async (filters, { rejectWithValue }) => {
  try {
    const response = await filterCoursesApi(filters);
    if (response.status && response.data) {
      return { data: response.data, message: response.message };
    } else {
      return rejectWithValue({
        message: response.message || "Failed to filter courses",
        errors: response.errors ?? undefined,
      });
    }
  } catch (error: unknown) {
    let message = "Failed to filter courses";
    let errors: Record<string, string[]> | undefined;

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as AxiosError<{
        message: string;
        errors?: Record<string, string[]> | null;
      }>;
      message = axiosError.response?.data?.message || message;
      errors = axiosError.response?.data?.errors ?? undefined;
    }

    return rejectWithValue({ message, errors });
  }
});

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    clearCourseErrors: (state) => {
      state.error = null;
      state.fieldErrors = null;
      state.successMessage = null;
    },
    clearUserProfile: (state) => {
      state.userProfile = null;
    },
    clearCourseDetail: (state) => {
      state.courseDetail = null;
    },
    clearMyCourses: (state) => {
      state.myCourses = null;
    },
    updateLocalProgress: (
      state,
      action: {
        payload: { lessonId: number; progress: number; courseId: number };
      }
    ) => {
      if (!state.courseDetail) return;

      const { lessonId, progress, courseId } = action.payload;
      const { modules } = state.courseDetail;

      if (modules.length === 0) {
        state.courseDetail.course_watched_percentage = 0;
        return;
      }

      saveProgressToLocalStorage(courseId, lessonId, progress);

      for (const courseModule of modules) {
        const lesson = courseModule.lessons.find((l) => l.id === lessonId);
        if (lesson) {
          if (progress > (lesson.watched_progress || 0)) {
            lesson.watched_progress = progress;

            const totalLessons = courseModule.lessons.length;
            const totalProgress = courseModule.lessons.reduce(
              (sum, l) => sum + (l.watched_progress || 0),
              0
            );
            courseModule.module_watched_percentage =
              totalLessons > 0 ? Math.round(totalProgress / totalLessons) : 0;

            const allLessons = modules.flatMap((m) => m.lessons);
            const allLessonsCount = allLessons.length;
            const allLessonsProgress = allLessons.reduce(
              (sum, l) => sum + (l.watched_progress || 0),
              0
            );
            state.courseDetail.course_watched_percentage =
              allLessonsCount > 0
                ? Math.round((allLessonsProgress / allLessonsCount) * 100) / 100
                : 0;
          }
          break;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardHome.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = null;
        state.successMessage = null;
      })
      .addCase(fetchDashboardHome.fulfilled, (state, action) => {
        state.loading = false;
        state.userProfile = action.payload.data;
        state.successMessage = action.payload.message;
      })
      .addCase(fetchDashboardHome.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch dashboard data";
        state.fieldErrors = action.payload?.errors || null;
      })
      .addCase(fetchMyCourses.pending, (state) => {
        state.myCoursesLoading = true;
        state.error = null;
        state.fieldErrors = null;
      })
      .addCase(fetchMyCourses.fulfilled, (state, action) => {
        state.myCoursesLoading = false;
        state.myCourses = action.payload.data;
      })
      .addCase(fetchMyCourses.rejected, (state, action) => {
        state.myCoursesLoading = false;
        state.error = action.payload?.message || "Failed to fetch my courses";
        state.fieldErrors = action.payload?.errors || null;
      })
      .addCase(fetchCourseDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
        state.fieldErrors = null;
        state.successMessage = null;
      })
      .addCase(fetchCourseDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.courseDetail = action.payload.data;
        state.successMessage = action.payload.message;

        if (state.courseDetail && state.courseDetail.modules.length === 0) {
          state.courseDetail.course_watched_percentage = 0;
        }
      })
      .addCase(fetchCourseDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch course details";
        state.fieldErrors = action.payload?.errors || null;
      })
      .addCase(updateLessonProgress.pending, (state) => {
        state.progressLoading = true;
      })
      .addCase(updateLessonProgress.fulfilled, (state, action) => {
        state.progressLoading = false;

        if (state.courseDetail) {
          const { lessonId, progress } = action.payload;
          const { modules } = state.courseDetail;

          if (modules.length === 0) {
            state.courseDetail.course_watched_percentage = 0;
            return;
          }

          for (const courseModule of modules) {
            const lesson = courseModule.lessons.find((l) => l.id === lessonId);
            if (lesson) {
              if (progress > (lesson.watched_progress || 0)) {
                lesson.watched_progress = progress;

                const totalLessons = courseModule.lessons.length;
                const totalProgress = courseModule.lessons.reduce(
                  (sum, l) => sum + (l.watched_progress || 0),
                  0
                );
                courseModule.module_watched_percentage =
                  totalLessons > 0
                    ? Math.round(totalProgress / totalLessons)
                    : 0;

                const allLessons = modules.flatMap((m) => m.lessons);
                const allLessonsCount = allLessons.length;
                const allLessonsProgress = allLessons.reduce(
                  (sum, l) => sum + (l.watched_progress || 0),
                  0
                );
                state.courseDetail.course_watched_percentage =
                  allLessonsCount > 0
                    ? Math.round((allLessonsProgress / allLessonsCount) * 100) /
                      100
                    : 0;
              }
              break;
            }
          }
        }
      })
      .addCase(updateLessonProgress.rejected, (state) => {
        state.progressLoading = false;
      })
      .addCase(filterCourses.pending, (state) => {
        state.filterLoading = true;
        state.error = null;
        state.fieldErrors = null;
      })
      .addCase(filterCourses.fulfilled, (state, action) => {
        state.filterLoading = false;
        state.filteredCourses = action.payload.data;
      })
      .addCase(filterCourses.rejected, (state, action) => {
        state.filterLoading = false;
        state.error = action.payload?.message || "Failed to filter courses";
        state.fieldErrors = action.payload?.errors || null;
      });
  },
});

export const {
  clearCourseErrors,
  clearUserProfile,
  clearCourseDetail,
  clearMyCourses,
  updateLocalProgress,
} = courseSlice.actions;

export default courseSlice.reducer;
