import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginApi,
  registerApi,
  sendOtpApi,
  verifyOtpApi,
  resetPasswordApi,
} from "@/services/authApi";
import {
  LoginCredentials,
  LoginData,
  RegisterCredentials,
  RegisterData,
  SendOtpCredentials,
  VerifyOtpCredentials,
  ResetPasswordCredentials,
  User,
} from "@/types";
import { AxiosError } from "axios";

interface AuthState {
  user: User | null;
  token: string | null;
  registeredUser: RegisterData | null;
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string[]> | null;
  successMessage: string | null;
}

interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

interface ResetPasswordResponseData {
  user?: User;
  token?: string;
}

const initialState: AuthState = {
  user:
    typeof window !== "undefined" && localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user") as string)
      : null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  registeredUser: null,
  loading: false,
  error: null,
  fieldErrors: null,
  successMessage: null,
};

export const loginUser = createAsyncThunk<
  { data: LoginData; message: string },
  LoginCredentials,
  { rejectValue: ErrorResponse }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const response = await loginApi(credentials);
    if (response.status && response.data) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return { data: response.data, message: response.message };
    } else {
      return rejectWithValue({
        message: response.message || "Login failed",
        errors: response.errors ?? undefined,
      });
    }
  } catch (error: unknown) {
    let message = "Login failed";
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

export const registerUser = createAsyncThunk<
  { data: RegisterData; message: string },
  RegisterCredentials,
  { rejectValue: ErrorResponse }
>("auth/registerUser", async (credentials, { rejectWithValue }) => {
  try {
    const response = await registerApi(credentials);

    if (response.status && response.data) {
      if (typeof window !== "undefined" && response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return { data: response.data, message: response.message };
    } else {
      return rejectWithValue({
        message: response.message || "Registration failed",
        errors: response.errors ?? undefined,
      });
    }
  } catch (error: unknown) {
    let message = "Registration failed";
    let errors: Record<string, string[]> | undefined;

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as AxiosError<{
        status: boolean;
        message: string;
        errors?: Record<string, string[]>;
      }>;

      if (axiosError.response) {
        message = axiosError.response.data.message || message;
        errors = axiosError.response.data.errors ?? undefined;
      }
    }

    return rejectWithValue({ message, errors });
  }
});

export const sendOtp = createAsyncThunk<
  { message: string },
  SendOtpCredentials,
  { rejectValue: ErrorResponse }
>("auth/sendOtp", async (credentials, { rejectWithValue }) => {
  try {
    const response = await sendOtpApi(credentials);
    if (response.status) {
      return { message: response.message };
    } else {
      return rejectWithValue({
        message: response.message || "OTP send failed",
        errors: response.errors ?? undefined,
      });
    }
  } catch (error: unknown) {
    let message = "OTP send failed";
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

export const verifyOtp = createAsyncThunk<
  { data: LoginData; message: string },
  VerifyOtpCredentials,
  { rejectValue: ErrorResponse }
>("auth/verifyOtp", async (credentials, { rejectWithValue }) => {
  try {
    const response = await verifyOtpApi(credentials);
    if (response.status && response.data) {
      localStorage.setItem("token", response.data.token);
      return { data: response.data, message: response.message };
    } else {
      return rejectWithValue({
        message: response.message || "Verification failed",
        errors: response.errors ?? undefined,
      });
    }
  } catch (error: unknown) {
    let message = "Verification failed";
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

export const resetPassword = createAsyncThunk<
  { data: ResetPasswordResponseData; message: string },
  ResetPasswordCredentials,
  { rejectValue: ErrorResponse }
>("auth/resetPassword", async (credentials, { rejectWithValue }) => {
  try {
    const response = await resetPasswordApi(credentials);
    if (response.status && response.data) {
      // If the API returns a token, store it
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      // If the API returns user data, store it
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return {
        data: response.data,
        message: response.message,
      };
    } else {
      return rejectWithValue({
        message: response.message || "Password reset failed",
        errors: response.errors ?? undefined,
      });
    }
  } catch (error: unknown) {
    let message = "Password reset failed";
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

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.registeredUser = null;
      if (typeof window !== "undefined") {
        localStorage.clear();
        localStorage.removeItem("isLogged");
        document.cookie =
          "isLogged=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    },

    clearAuthErrors: (state) => {
      state.error = null;
      state.fieldErrors = null;
      state.successMessage = null;
    },
    clearRegisteredUser: (state) => {
      state.registeredUser = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = null;
        state.successMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        state.successMessage = action.payload.message;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
        state.fieldErrors = action.payload?.errors || null;
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registeredUser = action.payload.data;
        state.successMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Registration failed";
        state.fieldErrors = action.payload?.errors || null;
      })
      // Send OTP cases
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = null;
        state.successMessage = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "OTP send failed";
        state.fieldErrors = action.payload?.errors || null;
      })
      // Verify OTP cases
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = null;
        state.successMessage = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        state.successMessage = action.payload.message;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Verification failed";
        state.fieldErrors = action.payload?.errors || null;
      })
      // Reset Password cases
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = null;
        state.successMessage = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        // Update user and token if provided in response
        if (action.payload.data.user) {
          state.user = action.payload.data.user;
        }
        if (action.payload.data.token) {
          state.token = action.payload.data.token;
        }
        state.successMessage = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Password reset failed";
        state.fieldErrors = action.payload?.errors || null;
      });
  },
});

export const {
  logout,
  clearAuthErrors,
  clearRegisteredUser,
  setUser,
  updateUserProfile,
} = authSlice.actions;
export default authSlice.reducer;
