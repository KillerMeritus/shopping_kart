import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../axiosCalls/axios";

// 1. Fetch / Refresh Cart from Backend
export const fetchCart = createAsyncThunk(
    "cart/fetchCart",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/cart");
            return response.data.cart || [];
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch cart";
            return rejectWithValue(message);
        }
    }
);

// Alias for refresh cart
export const refreshCart = fetchCart;

// 2. Add Product to Cart
export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async (productId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/cart/${productId}`);
            return response.data.cart || [];
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to add product to cart";
            return rejectWithValue(message);
        }
    }
);

// 3. Update Product Quantity in Cart
export const updateCartQuantity = createAsyncThunk(
    "cart/updateCartQuantity",
    async ({ productId, quantity }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/cart/${productId}`, {
                quantity
            });
            return response.data.cart || [];
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to update cart quantity";
            return rejectWithValue(message);
        }
    }
);

// 4. Remove Product from Cart
export const removeFromCart = createAsyncThunk(
    "cart/removeFromCart",
    async (productId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/cart/${productId}`);
            return response.data.cart || [];
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to remove product from cart";
            return rejectWithValue(message);
        }
    }
);

const initialState = {
    cartItems: [],
    loading: false,
    error: null
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        clearCartError: (state) => {
            state.error = null;
        },
        resetCart: (state) => {
            state.cartItems = [];
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Cart
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload;
                state.error = null;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Add to Cart
            .addCase(addToCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload;
                state.error = null;
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Cart Quantity
            .addCase(updateCartQuantity.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCartQuantity.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload;
                state.error = null;
            })
            .addCase(updateCartQuantity.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Remove from Cart
            .addCase(removeFromCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload;
                state.error = null;
            })
            .addCase(removeFromCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearCartError, resetCart } = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.cartItems;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;

// Derived Selectors
export const selectCartTotalCount = (state) =>
    state.cart.cartItems.reduce((total, item) => total + item.quantity, 0);

export const selectCartSubtotal = (state) =>
    state.cart.cartItems.reduce(
        (total, item) => total + (item.product?.price || 0) * item.quantity,
        0
    );

export default cartSlice.reducer;
