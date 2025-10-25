import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  submitOnboardingApi,
  OnboardingPayload,
} from "../../services/onboardingApi";
import { AxiosError } from "axios";

interface OnboardingState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

const initialState: OnboardingState = {
  loading: false,
  error: null,
  successMessage: null,
};

export const submitOnboarding = createAsyncThunk<
  { message: string },
  OnboardingPayload,
  { rejectValue: ErrorResponse }
>("onboarding/submitOnboarding", async (payload, { rejectWithValue }) => {
  try {
    const response = await submitOnboardingApi(payload);

    if (response.status) {
      return { message: response.message };
    } else {
      return rejectWithValue({
        message: response.message || "Failed to complete onboarding",
        errors: response.errors,
      });
    }
  } catch (error: unknown) {
    let message = "Failed to complete onboarding";
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

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    clearOnboardingErrors: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOnboarding.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(submitOnboarding.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.error = null;
      })
      .addCase(submitOnboarding.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to complete onboarding";
        state.successMessage = null;
      });
  },
});

export const { clearOnboardingErrors } = onboardingSlice.actions;
export default onboardingSlice.reducer;
