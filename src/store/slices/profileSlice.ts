import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { updateProfileApi } from "@/services/profileApi";
import { UpdateProfileRequest, User } from "@/types";
import { AxiosError } from "axios";

interface ProfileState {
  user: User | null;
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string[]> | null;
  successMessage: string | null;
}

interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

const initialState: ProfileState = {
  user: null,
  loading: false,
  error: null,
  fieldErrors: null,
  successMessage: null,
};

export const updateProfile = createAsyncThunk<
  { data: User; message: string },
  UpdateProfileRequest,
  { rejectValue: ErrorResponse }
>("profile/updateProfile", async (request, { rejectWithValue }) => {
  try {
    const response = await updateProfileApi(request);
    if (response.status && response.data) {
      // Update localStorage with new user data
      const existingUser = localStorage.getItem("user");
      if (existingUser) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return {
        data: response.data.user,
        message: response.message,
      };
    } else {
      return rejectWithValue({
        message: response.message || "Failed to update profile",
        errors: response.errors ?? undefined,
      });
    }
  } catch (error: unknown) {
    let message = "Failed to update profile";
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

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileErrors: (state) => {
      state.error = null;
      state.fieldErrors = null;
      state.successMessage = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = null;
        state.successMessage = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.successMessage = action.payload.message;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update profile";
        state.fieldErrors = action.payload?.errors || null;
      });
  },
});

export const { clearProfileErrors, setUser, clearUser } = profileSlice.actions;

export default profileSlice.reducer;
