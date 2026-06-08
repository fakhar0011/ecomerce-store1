import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Product, FilterType } from "@/types";
import { getProductsService } from "@/lib/product.service"; // import service

interface ProductState {
  products: Product[];
  filteredProducts: Product[];
  selectedFilter: FilterType;
  loading: boolean;
  error: string;
}

const initialState: ProductState = {
  products: [],
  filteredProducts: [],
  selectedFilter: "all",
  loading: false,
  error: "",
};

// ← Express Backend se products fetch ==> store in redux state
export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (category: FilterType, { rejectWithValue }) => {
    try {
      // Call backend directly via service
      const response = await getProductsService(
        category === "all" ? undefined : category,
      );

      // Response format from backend
      if (response.success) {
        return {
          data: response.data,
          category,
        };
      } else {
        return rejectWithValue(response.message || "Failed to fetch products");
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<FilterType>) => {
      state.selectedFilter = action.payload;
    },
    clearProducts: (state) => {
      state.products = [];
      state.filteredProducts = [];
      state.error = "";
    },
    clearError: (state) => {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
      state.error = "";
    });

    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload.data;
      state.filteredProducts = action.payload.data;
      state.selectedFilter = action.payload.category;
      state.error = "";
    });

    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setFilter, clearProducts, clearError } = productSlice.actions;
export default productSlice.reducer;
