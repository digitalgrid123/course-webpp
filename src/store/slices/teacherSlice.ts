import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getTeachersListApi,
  getTeacherDetailApi,
} from "../../services/teacherApi";
import { AxiosError } from "axios";
import { Teacher, TeacherDetail } from "@/types";

// State Interfaces
interface TeachersListState {
  teachers: Teacher[];
  loading: boolean;
  error: string | null;
}

interface TeacherDetailState {
  teacher: TeacherDetail | null;
  loading: boolean;
  error: string | null;
}

interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

// Initial States
const initialTeachersListState: TeachersListState = {
  teachers: [],
  loading: false,
  error: null,
};

const initialTeacherDetailState: TeacherDetailState = {
  teacher: null,
  loading: false,
  error: null,
};

// Combined State
interface TeacherState {
  list: TeachersListState;
  detail: TeacherDetailState;
}

const initialState: TeacherState = {
  list: initialTeachersListState,
  detail: initialTeacherDetailState,
};

// Async Thunks
export const fetchTeachersList = createAsyncThunk<
  Teacher[],
  void,
  { rejectValue: ErrorResponse }
>("teacher/fetchTeachersList", async (_, { rejectWithValue }) => {
  try {
    const response = await getTeachersListApi();

    if (response.status) {
      return response.data;
    } else {
      return rejectWithValue({
        message: response.message || "Failed to fetch teachers list",
        errors: response.errors,
      });
    }
  } catch (error: unknown) {
    let message = "Failed to fetch teachers list";
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

export const fetchTeacherDetail = createAsyncThunk<
  TeacherDetail,
  number,
  { rejectValue: ErrorResponse }
>("teacher/fetchTeacherDetail", async (teacherId, { rejectWithValue }) => {
  try {
    const response = await getTeacherDetailApi(teacherId);

    if (response.status) {
      return response.data;
    } else {
      return rejectWithValue({
        message: response.message || "Failed to fetch teacher details",
        errors: response.errors,
      });
    }
  } catch (error: unknown) {
    let message = "Failed to fetch teacher details";
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

// Slice
const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    clearTeachersList: (state) => {
      state.list = initialTeachersListState;
    },
    clearTeacherDetail: (state) => {
      state.detail = initialTeacherDetailState;
    },
    clearTeacherErrors: (state) => {
      state.list.error = null;
      state.detail.error = null;
    },
  },
  extraReducers: (builder) => {
    // Teachers List
    builder
      .addCase(fetchTeachersList.pending, (state) => {
        state.list.loading = true;
        state.list.error = null;
      })
      .addCase(fetchTeachersList.fulfilled, (state, action) => {
        state.list.loading = false;
        state.list.teachers = action.payload;
        state.list.error = null;
      })
      .addCase(fetchTeachersList.rejected, (state, action) => {
        state.list.loading = false;
        state.list.error =
          action.payload?.message || "Failed to fetch teachers list";
        state.list.teachers = [];
      });

    // Teacher Detail
    builder
      .addCase(fetchTeacherDetail.pending, (state) => {
        state.detail.loading = true;
        state.detail.error = null;
      })
      .addCase(fetchTeacherDetail.fulfilled, (state, action) => {
        state.detail.loading = false;
        state.detail.teacher = action.payload;
        state.detail.error = null;
      })
      .addCase(fetchTeacherDetail.rejected, (state, action) => {
        state.detail.loading = false;
        state.detail.error =
          action.payload?.message || "Failed to fetch teacher details";
        state.detail.teacher = null;
      });
  },
});

export const { clearTeachersList, clearTeacherDetail, clearTeacherErrors } =
  teacherSlice.actions;
export default teacherSlice.reducer;
