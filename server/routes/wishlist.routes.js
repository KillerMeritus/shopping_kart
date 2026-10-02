import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    toggleWishlist
} from "../controllers/wishlist.controllers.js";

const wishlistRoutes = express.Router();

// Get current user's wishlist
wishlistRoutes.get("/", authMiddleware, getWishlist);

// Add product to wishlist
wishlistRoutes.post("/:productId", authMiddleware, addToWishlist);

// Toggle product in wishlist (Bonus Task 23)
wishlistRoutes.patch("/:productId/toggle", authMiddleware, toggleWishlist);

// Remove product from wishlist
wishlistRoutes.delete("/:productId", authMiddleware, removeFromWishlist);

export default wishlistRoutes;