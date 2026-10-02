import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart
} from "../controllers/cart.controllers.js";

const cartRoutes = express.Router();

// GET /cart - Get current user cart
cartRoutes.get("/", authMiddleware, getCart);

// POST /cart/:productId - Add product to cart or increase quantity
cartRoutes.post("/:productId", authMiddleware, addToCart);

// PATCH /cart/:productId - Update product quantity in cart
cartRoutes.patch("/:productId", authMiddleware, updateCartQuantity);

// DELETE /cart/:productId - Remove product from cart
cartRoutes.delete("/:productId", authMiddleware, removeFromCart);

export default cartRoutes;
