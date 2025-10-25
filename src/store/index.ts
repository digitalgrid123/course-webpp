import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import degreeYearsReducer from "./slices/degreeYearsSlice";
import onboardingReducer from "./slices/onboardingSlice";
import courseReducer from "./slices/courseSlice";
import cartReducer from "./slices/cartSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    degreeYears: degreeYearsReducer,
    onboarding: onboardingReducer,
    course: courseReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
