import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchDegreeYearsApi } from "@/services/degreeYearsApi";
import { Degree } from "@/types";
import { AxiosError } from "axios";

interface DegreeYearsState {
  degrees: Degree[] | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

const initialState: DegreeYearsState = {
  degrees: null,
  loading: false,
  error: null,
  successMessage: null,
};

export const fetchDegreeYears = createAsyncThunk<
  { data: Degree[]; message: string }, // Updated return type
  void,
  { rejectValue: ErrorResponse }
>("degreeYears/fetchDegreeYears", async (_, { rejectWithValue }) => {
  try {
    const response = await fetchDegreeYearsApi();

    if (response.status && response.data) {
      console.log("API Response Data:", response.data);
      return { data: response.data, message: response.message }; // response.data is Degree[]
    } else {
      return rejectWithValue({
        message: response.message || "Failed to fetch degree years data",
        errors: response.errors,
      });
    }
  } catch (error: unknown) {
    let message = "Failed to fetch degree years data";
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

const degreeYearsSlice = createSlice({
  name: "degreeYears",
  initialState,
  reducers: {
    clearDegreeYearsErrors: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearDegreeYearsData: (state) => {
      state.degrees = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDegreeYears.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(fetchDegreeYears.fulfilled, (state, action) => {
        state.loading = false;
        state.degrees = action.payload.data || []; // Directly use data as Degree[]
        state.successMessage = action.payload.message;
        console.log("Degrees stored in state:", state.degrees);
      })
      .addCase(fetchDegreeYears.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch degree years data";
        state.successMessage = null;
      });
  },
});

export const { clearDegreeYearsErrors, clearDegreeYearsData } =
  degreeYearsSlice.actions;
export default degreeYearsSlice.reducer;
