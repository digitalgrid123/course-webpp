import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getDashboardHomeApi,
  getCourseDetailApi,
  updateLessonProgressApi,
  getMyCoursesApi,
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
  },
  LessonProgressRequest,
  { rejectValue: ErrorResponse }
>("course/updateLessonProgress", async (request, { rejectWithValue }) => {
  try {
    const response = await updateLessonProgressApi(request);
    if (response.status) {
      return {
        data: response.data || null,
        message: response.message || "Progress updated successfully",
        lessonId: request.lesson_id,
        progress: request.progress,
      };
    } else {
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
    // New reducer to update local progress optimistically
    updateLocalProgress: (
      state,
      action: { payload: { lessonId: number; progress: number } }
    ) => {
      if (!state.courseDetail) return;

      const { lessonId, progress } = action.payload;

      // Find and update the lesson progress
      for (const courseModule of state.courseDetail.modules) {
        const lesson = courseModule.lessons.find((l) => l.id === lessonId);
        if (lesson) {
          lesson.watched_progress = progress;

          // Recalculate module progress
          const totalLessons = courseModule.lessons.length;
          const totalProgress = courseModule.lessons.reduce(
            (sum, l) => sum + (l.watched_progress || 0),
            0
          );
          courseModule.module_watched_percentage =
            totalLessons > 0 ? Math.round(totalProgress / totalLessons) : 0;

          // Recalculate course progress
          const allLessons = state.courseDetail.modules.flatMap(
            (m) => m.lessons
          );
          const allLessonsCount = allLessons.length;
          const allLessonsProgress = allLessons.reduce(
            (sum, l) => sum + (l.watched_progress || 0),
            0
          );
          state.courseDetail.course_watched_percentage =
            allLessonsCount > 0
              ? Math.round((allLessonsProgress / allLessonsCount) * 100) / 100
              : 0;

          break;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Home
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
      // Fetch My Courses
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
      // Fetch Course Detail
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
      })
      .addCase(fetchCourseDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch course details";
        state.fieldErrors = action.payload?.errors || null;
      })
      // Update Lesson Progress
      .addCase(updateLessonProgress.pending, (state) => {
        state.progressLoading = true;
      })
      .addCase(updateLessonProgress.fulfilled, (state, action) => {
        state.progressLoading = false;
        console.log("Progress updated:", action.payload.message);

        // Update the lesson progress in the state
        if (state.courseDetail) {
          const { lessonId, progress } = action.payload;

          for (const courseModule of state.courseDetail.modules) {
            const lesson = courseModule.lessons.find((l) => l.id === lessonId);
            if (lesson) {
              lesson.watched_progress = progress;

              // Recalculate module progress
              const totalLessons = courseModule.lessons.length;
              const totalProgress = courseModule.lessons.reduce(
                (sum, l) => sum + (l.watched_progress || 0),
                0
              );
              courseModule.module_watched_percentage =
                totalLessons > 0 ? Math.round(totalProgress / totalLessons) : 0;

              // Recalculate course progress
              const allLessons = state.courseDetail.modules.flatMap(
                (m) => m.lessons
              );
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

              break;
            }
          }
        }
      })
      .addCase(updateLessonProgress.rejected, (state, action) => {
        state.progressLoading = false;
        console.error("Progress update failed:", action.payload?.message);
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
