import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    createPaymentOrder,
    verifyPayment,
    getUserOrders,
    getOrderById
} from "../controllers/order.controllers.js";

const orderRoutes = express.Router();

// POST /orders/create-payment-order
orderRoutes.post("/create-payment-order", authMiddleware, createPaymentOrder);

// Also map POST /orders directly to createPaymentOrder for compatibility
orderRoutes.post("/", authMiddleware, createPaymentOrder);

// POST /orders/verify-payment
orderRoutes.post("/verify-payment", authMiddleware, verifyPayment);

// GET /orders - List authenticated customer orders
orderRoutes.get("/", authMiddleware, getUserOrders);

// GET /orders/:id - Get single order details
orderRoutes.get("/:id", authMiddleware, getOrderById);

export default orderRoutes;
