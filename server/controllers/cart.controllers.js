import mongoose from "mongoose";
import productModel from "../model/product.model.js";

// Add Product to Cart
export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate Product ID
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // 2. Find Product
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (!req.customer.cart) {
            req.customer.cart = [];
        }

        // 3. Check if already in cart
        const cartItemIndex = req.customer.cart.findIndex(
            (item) => (item.product?._id || item.product).toString() === productId
        );

        let newQuantity = 1;
        if (cartItemIndex > -1) {
            newQuantity = req.customer.cart[cartItemIndex].quantity + 1;
        }

        // 4. Validate stock availability
        if (newQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock"
            });
        }

        // 5. Update quantity or add new item
        if (cartItemIndex > -1) {
            req.customer.cart[cartItemIndex].quantity = newQuantity;
        } else {
            req.customer.cart.push({
                product: productId,
                quantity: 1
            });
        }

        // 6. Save customer and return updated cart
        await req.customer.save();
        await req.customer.populate("cart.product");

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: req.customer.cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

//  Get Current User Cart
export const getCart = async (req, res) => {
    try {
        if (!req.customer.cart) {
            req.customer.cart = [];
        }

        await req.customer.populate("cart.product");

        return res.status(200).json({
            success: true,
            cart: req.customer.cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update Product Quantity
export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        // 1. Validate Product ID
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // 2. Validate quantity input
        if (typeof quantity !== "number" || isNaN(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a number and at least 1"
            });
        }

        // 3. Find Product
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (!req.customer.cart) {
            req.customer.cart = [];
        }

        // 4. Check if product is in cart
        const cartItemIndex = req.customer.cart.findIndex(
            (item) => (item.product?._id || item.product).toString() === productId
        );

        if (cartItemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not in cart"
            });
        }

        // 5. Check if quantity exceeds stock
        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock"
            });
        }

        // 6. Update quantity and save
        req.customer.cart[cartItemIndex].quantity = quantity;
        await req.customer.save();
        await req.customer.populate("cart.product");

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: req.customer.cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Remove Product from Cart
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate Product ID
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (!req.customer.cart) {
            req.customer.cart = [];
        }

        // 2. Check if product is in cart
        const cartItemIndex = req.customer.cart.findIndex(
            (item) => (item.product?._id || item.product).toString() === productId
        );

        if (cartItemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not in cart"
            });
        }

        // 3. Remove product from cart
        req.customer.cart.splice(cartItemIndex, 1);
        await req.customer.save();
        await req.customer.populate("cart.product");

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: req.customer.cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
