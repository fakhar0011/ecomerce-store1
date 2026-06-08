import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product, CartItem } from "@/types";

// State structure
interface CartState {
  items: CartItem[];
  totalAmount: number;
}

// Helper function to calculate total amount
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );
};

// Initial state
const initialState: CartState = {
  items: [],
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // ← Product add karo
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
    },

    // ← Product remove
    removeFromCart: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      state.items = state.items.filter(
        (item) => item.product._id !== productId,
      );
      state.totalAmount = calculateTotal(state.items);
    },

    // ← Quantity update
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) => {
      const { productId, quantity } = action.payload;

      if (quantity < 1) {
        state.items = state.items.filter(
          (item) => item.product._id !== productId,
        );
      } else {
        const item = state.items.find((item) => item.product._id === productId);
        if (item) {
          item.quantity = quantity;
        }
      }
      state.totalAmount = calculateTotal(state.items);
    },

    // cart ko reset karne ke liye
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
