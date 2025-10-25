import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { buyCourseApi } from "@/services/courseApi";
import { BuyCourseResponse } from "@/types";

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

interface CartState {
  items: CartCourse[];
  totalAmount: number;
  totalItems: number;
  purchaseLoading: boolean;
  purchaseError: string | null;
}

// Load cart from localStorage on initialization
const loadCartFromStorage = (): Omit<
  CartState,
  "purchaseLoading" | "purchaseError"
> => {
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

// Save cart to localStorage
const saveCartToStorage = (state: CartState) => {
  if (typeof window !== "undefined") {
    try {
      const cartData = {
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

// Async thunk for purchasing courses
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

    const response = await buyCourseApi({
      course_ids: courseIds,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("An error occurred during purchase");
  }
});

const loadedCart = loadCartFromStorage();
const initialState: CartState = {
  ...loadedCart,
  purchaseLoading: false,
  purchaseError: null,
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

        saveCartToStorage(state);
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.totalItems = 0;

      saveCartToStorage(state);
    },

    updateCartFromStorage: (state) => {
      const loadedCart = loadCartFromStorage();
      state.items = loadedCart.items;
      state.totalAmount = loadedCart.totalAmount;
      state.totalItems = loadedCart.totalItems;
    },

    clearPurchaseError: (state) => {
      state.purchaseError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(purchaseCourses.pending, (state) => {
        state.purchaseLoading = true;
        state.purchaseError = null;
      })
      .addCase(purchaseCourses.fulfilled, (state, action) => {
        state.purchaseLoading = false;

        // Clear cart on successful purchase
        if (action.payload.status) {
          state.items = [];
          state.totalAmount = 0;
          state.totalItems = 0;
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
} = cartSlice.actions;

export default cartSlice.reducer;
