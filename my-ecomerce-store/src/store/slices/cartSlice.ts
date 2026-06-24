import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types";

// ─── Types ────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
}

// ─── LocalStorage Helpers ─────────────────────────────────
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("cart", JSON.stringify(items));
  } catch {
    // ignore
  }
};

// ─── Initial State ────────────────────────────────────────
const initialState: CartState = {
  items: loadCartFromStorage(),
  totalAmount: 0,
};

// ─── Helper: Calculate total ─────────────────────────────
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
};

// ─── Slice ────────────────────────────────────────────────
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const existing = state.items.find(
        (item) => item.product._id === product._id,
      );
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ product, quantity: 1 });
      }
      state.totalAmount = calculateTotal(state.items);
      saveCartToStorage(state.items);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      state.items = state.items.filter(
        (item) => item.product._id !== productId,
      );
      state.totalAmount = calculateTotal(state.items);
      saveCartToStorage(state.items);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.product._id === productId);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i.product._id !== productId);
        } else {
          item.quantity = quantity;
        }
      }
      state.totalAmount = calculateTotal(state.items);
      saveCartToStorage(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      saveCartToStorage([]);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
