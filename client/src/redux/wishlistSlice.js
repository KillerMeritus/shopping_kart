import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../axiosCalls/axios";

// 1. Fetch Wishlist from backend
export const fetchWishlist = createAsyncThunk(
    "wishlist/fetchWishlist",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/wishlist");
            return response.data.wishlist || [];
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch wishlist";
            return rejectWithValue(message);
        }
    }
);

// 2. Toggle Wishlist (Add if not present, remove if present)
export const toggleWishlist = createAsyncThunk(
    "wishlist/toggleWishlist",
    async (productId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(
                `/wishlist/${productId}/toggle`
            );
            return response.data.wishlist || [];
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to toggle wishlist";
            return rejectWithValue(message);
        }
    }
);

// 3. Remove from Wishlist
export const removeFromWishlist = createAsyncThunk(
    "wishlist/removeFromWishlist",
    async (productId, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/wishlist/${productId}`);
            return productId;
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to remove from wishlist";
            return rejectWithValue(message);
        }
    }
);

const initialState = {
    wishlistItems: [],
    loading: false,
    error: null
};

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState,
    reducers: {
        resetWishlist: (state) => {
            state.wishlistItems = [];
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Wishlist
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.wishlistItems = action.payload;
                state.error = null;
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Toggle Wishlist
            .addCase(toggleWishlist.pending, (state) => {
                state.error = null;
            })
            .addCase(toggleWishlist.fulfilled, (state, action) => {
                state.wishlistItems = action.payload;
                state.error = null;
            })
            .addCase(toggleWishlist.rejected, (state, action) => {
                state.error = action.payload;
            })

            // Remove from Wishlist
            .addCase(removeFromWishlist.fulfilled, (state, action) => {
                state.wishlistItems = state.wishlistItems.filter(
                    (item) => (item._id || item) !== action.payload
                );
                state.error = null;
            });
    }
});

export const { resetWishlist } = wishlistSlice.actions;

// Selectors
export const selectWishlistItems = (state) => state.wishlist.wishlistItems;
export const selectWishlistCount = (state) => state.wishlist.wishlistItems.length;
export const selectWishlistLoading = (state) => state.wishlist.loading;
export const selectWishlistError = (state) => state.wishlist.error;

export default wishlistSlice.reducer;
