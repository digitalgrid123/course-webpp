import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { buyCourseApi, validateCouponApi } from "@/services/courseApi";
import {
  BuyCourseRequest,
  BuyCourseResponse,
  CouponValidationResponse,
} from "@/types";
import axios from "axios";

interface CartCourse {
  id: number;
  name: string;
  price: number;
  price_type: string;
  image: string;
  teacher: {
    name: string;
    image: string;
  };
  modules_count: number;
  addedAt: string;
}

interface StoredCartData {
  items: CartCourse[];
  totalAmount: number;
  totalItems: number;
}

interface CartState {
  items: CartCourse[];
  totalAmount: number;
  totalItems: number;
  purchaseLoading: boolean;
  purchaseError: string | null;
  coupon: {
    code: string;
    discount: number;
    newTotal: number;
    loading: boolean;
    error: string | null;
    validated: boolean;
    coupon_id?: number;
  };
}

const loadCartFromStorage = (): StoredCartData => {
  if (typeof window !== "undefined") {
    try {
      const savedCart = localStorage.getItem("courseCart");
      if (savedCart) {
        return JSON.parse(savedCart);
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
  }
  return {
    items: [],
    totalAmount: 0,
    totalItems: 0,
  };
};

const saveCartToStorage = (state: CartState) => {
  if (typeof window !== "undefined") {
    try {
      const cartData: StoredCartData = {
        items: state.items,
        totalAmount: state.totalAmount,
        totalItems: state.totalItems,
      };
      localStorage.setItem("courseCart", JSON.stringify(cartData));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }
};

export const validateCoupon = createAsyncThunk<
  CouponValidationResponse,
  string,
  {
    state: { cart: CartState };
    rejectValue: string;
  }
>("cart/validateCoupon", async (couponCode, { getState, rejectWithValue }) => {
  try {
    const { cart } = getState();
    const response = await validateCouponApi({
      coupon: couponCode,
      price: cart.totalAmount,
    });
    return response;
  } catch (error) {
    console.error("Coupon validation error:", error);

    if (axios.isAxiosError(error)) {
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail;

      const status = error.response?.status;

      if (backendMessage) {
        return rejectWithValue(backendMessage);
      }

      switch (status) {
        case 404:
          return rejectWithValue("שירות לא זמין (404)");
        case 400:
          return rejectWithValue("קוד קופון לא תקין (400)");
        case 500:
          return rejectWithValue("שגיאת שרת פנימית (500)");
        default:
          return rejectWithValue(`שגיאה לא ידועה (${status})`);
      }
    }

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }

    return rejectWithValue("אירעה שגיאה בלתי צפויה");
  }
});

export const purchaseCourses = createAsyncThunk<
  BuyCourseResponse,
  void,
  {
    state: { cart: CartState };
    rejectValue: string;
  }
>("cart/purchaseCourses", async (_, { getState, rejectWithValue }) => {
  try {
    const { cart } = getState();

    const courseIds = cart.items.map((course) => course.id);

    if (courseIds.length === 0) {
      return rejectWithValue("No courses in cart");
    }

    const originalPrice = cart.totalAmount;
    const finalPrice = cart.coupon.validated
      ? cart.coupon.newTotal
      : originalPrice;

    // Ensure discount_price is at least 1
    const discountPrice = Math.max(finalPrice, 1);

    const purchaseData: BuyCourseRequest = {
      course_ids: courseIds,
      price: originalPrice,
      discount_price: discountPrice, // This will be at least 1
      ...(cart.coupon.validated && {
        coupon_code: cart.coupon.code,
        coupon_id: cart.coupon.coupon_id, // Make sure to include this if available
      }),
    };

    console.log("Purchase data:", purchaseData);
    const response = await buyCourseApi(purchaseData);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail;

      const status = error.response?.status;

      if (backendMessage) {
        return rejectWithValue(backendMessage);
      }

      switch (status) {
        case 400:
          return rejectWithValue("נתונים לא תקינים (400)");
        case 422:
          return rejectWithValue("שגיאת ולידציה (422)");
        case 500:
          return rejectWithValue("שגיאת שרת פנימית (500)");
        default:
          return rejectWithValue(`שגיאה לא ידועה (${status})`);
      }
    }

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }

    return rejectWithValue("אירעה שגיאה בלתי צפויה");
  }
});

const loadedCart = loadCartFromStorage();
const initialState: CartState = {
  items: loadedCart.items,
  totalAmount: loadedCart.totalAmount,
  totalItems: loadedCart.totalItems,
  purchaseLoading: false,
  purchaseError: null,
  coupon: {
    code: "",
    discount: 0,
    newTotal: loadedCart.totalAmount,
    loading: false,
    error: null,
    validated: false,
  },
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartCourse>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );

      if (!existingItem) {
        state.items.push({
          ...action.payload,
          addedAt: new Date().toISOString(),
        });
        state.totalItems += 1;
        state.totalAmount += action.payload.price;

        state.coupon = {
          code: "",
          discount: 0,
          newTotal: state.totalAmount,
          loading: false,
          error: null,
          validated: false,
        };

        saveCartToStorage(state);
      }
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      const itemIndex = state.items.findIndex(
        (item) => item.id === action.payload
      );

      if (itemIndex !== -1) {
        const item = state.items[itemIndex];
        state.totalAmount -= item.price;
        state.totalItems -= 1;
        state.items.splice(itemIndex, 1);

        state.coupon = {
          code: "",
          discount: 0,
          newTotal: state.totalAmount,
          loading: false,
          error: null,
          validated: false,
        };

        saveCartToStorage(state);
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.totalItems = 0;
      state.coupon = {
        code: "",
        discount: 0,
        newTotal: 0,
        loading: false,
        error: null,
        validated: false,
      };

      saveCartToStorage(state);
    },

    updateCartFromStorage: (state) => {
      const loadedCart = loadCartFromStorage();
      state.items = loadedCart.items;
      state.totalAmount = loadedCart.totalAmount;
      state.totalItems = loadedCart.totalItems;
      state.coupon.newTotal = loadedCart.totalAmount;
    },

    clearPurchaseError: (state) => {
      state.purchaseError = null;
    },

    removeCoupon: (state) => {
      state.coupon = {
        code: "",
        discount: 0,
        newTotal: state.totalAmount,
        loading: false,
        error: null,
        validated: false,
        coupon_id: undefined,
      };
    },

    clearCouponError: (state) => {
      state.coupon.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(validateCoupon.pending, (state) => {
        state.coupon.loading = true;
        state.coupon.error = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.coupon.loading = false;

        if (action.payload.status && action.payload.data) {
          state.coupon.validated = true;
          state.coupon.discount = action.payload.data.discount;
          state.coupon.newTotal = action.payload.data.new_price;
          state.coupon.code = action.meta.arg;
          state.coupon.coupon_id = action.payload.data.coupon_id;
          state.coupon.error = null;
        } else {
          state.coupon.validated = false;
          state.coupon.error = action.payload.message;
          state.coupon.discount = 0;
          state.coupon.newTotal = state.totalAmount;
          state.coupon.coupon_id = undefined;
        }
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.coupon.loading = false;
        state.coupon.validated = false;
        state.coupon.error =
          action.payload ?? "An error occurred during coupon validation";
        state.coupon.discount = 0;
        state.coupon.newTotal = state.totalAmount;
      })

      .addCase(purchaseCourses.pending, (state) => {
        state.purchaseLoading = true;
        state.purchaseError = null;
      })
      .addCase(purchaseCourses.fulfilled, (state, action) => {
        state.purchaseLoading = false;

        if (action.payload.status) {
          state.items = [];
          state.totalAmount = 0;
          state.totalItems = 0;
          state.coupon = {
            code: "",
            discount: 0,
            newTotal: 0,
            loading: false,
            error: null,
            validated: false,
          };
          saveCartToStorage(state);
        }
      })
      .addCase(purchaseCourses.rejected, (state, action) => {
        state.purchaseLoading = false;
        state.purchaseError =
          action.payload ?? "An error occurred during purchase";
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  clearCart,
  updateCartFromStorage,
  clearPurchaseError,
  removeCoupon,
  clearCouponError,
} = cartSlice.actions;

export default cartSlice.reducer;
