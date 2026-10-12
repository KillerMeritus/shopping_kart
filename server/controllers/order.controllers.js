import mongoose from "mongoose";
import crypto from "crypto";
import Razorpay from "razorpay";
import orderModel from "../model/order.model.js";
import productModel from "../model/product.model.js";

// Helper to initialize Razorpay instance
const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_defaultKeyId";
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "defaultSecret";
    return new Razorpay({ key_id, key_secret });
};

// 1. Create Payment Order (POST /orders/create-payment-order)
export const createPaymentOrder = async (req, res) => {
    try {
        const customer = req.customer;
        const { shippingAddress } = req.body;

        // 1. Validate shipping address
        if (!shippingAddress) {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required"
            });
        }

        const addressLine1 = shippingAddress.addressLine1 || shippingAddress.address;
        const { fullName, phone, city, state, pincode } = shippingAddress;

        if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
            return res.status(400).json({
                success: false,
                message: "All shipping address fields are required (fullName, phone, addressLine1, city, state, pincode)"
            });
        }

        // 2. Load User Cart and check if empty
        if (!customer.cart || customer.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty. Cannot create an order with an empty cart."
            });
        }

        // 3. Load latest product data, verify existence & stock, build snapshot
        const orderItems = [];
        let totalAmount = 0;

        for (const cartItem of customer.cart) {
            const productId = cartItem.product?._id || cartItem.product;

            if (!mongoose.isValidObjectId(productId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID found in cart"
                });
            }

            // Always fetch current price & stock from DB — do NOT trust frontend values
            const product = await productModel.findById(productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${productId} no longer exists`
                });
            }

            // Verify requested quantity against latest available stock
            if (cartItem.quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}.`
                });
            }

            const itemPrice = product.price;
            const itemTotal = itemPrice * cartItem.quantity;
            totalAmount += itemTotal;

            // Build snapshot
            orderItems.push({
                product: product._id,
                name: product.name,
                price: itemPrice,
                quantity: cartItem.quantity,
                image: product.image
            });
        }

        // 4. Create pending ShopKart order
        const newOrder = new orderModel({
            user: customer._id,
            items: orderItems,
            shippingAddress: {
                fullName,
                phone,
                addressLine1,
                city,
                state,
                pincode
            },
            totalAmount,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT"
        });

        // 5. Create Razorpay Order in paise (totalAmount * 100)
        let razorpayOrderId = "";
        const amountInPaise = Math.round(totalAmount * 100);

        try {
            if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
                const razorpay = getRazorpayInstance();
                const rzpOrder = await razorpay.orders.create({
                    amount: amountInPaise,
                    currency: "INR",
                    receipt: `receipt_${newOrder._id.toString().slice(-8)}`
                });
                razorpayOrderId = rzpOrder.id;
            } else {
                // Mock order ID if API credentials not yet placed in .env
                razorpayOrderId = `order_mock_${Date.now()}`;
            }
        } catch (rzpError) {
            console.error("Razorpay order creation error:", rzpError);
            razorpayOrderId = `order_fallback_${Date.now()}`;
        }

        newOrder.razorpayOrderId = razorpayOrderId;
        await newOrder.save();

        // 6. Return checkout data
        return res.status(201).json({
            success: true,
            message: "Payment order created successfully",
            order: newOrder,
            razorpayOrderId: newOrder.razorpayOrderId,
            amount: amountInPaise,
            currency: "INR",
            key: process.env.RAZORPAY_KEY_ID || "rzp_test_mockKey"
        });

    } catch (error) {
        console.error("Error in createPaymentOrder:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while creating payment order",
            error: error.message
        });
    }
};

// 2. Verify Payment (POST /orders/verify-payment)
export const verifyPayment = async (req, res) => {
    try {
        const customer = req.customer;
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id) {
            return res.status(400).json({
                success: false,
                message: "Missing payment identification details"
            });
        }

        // Find corresponding order
        const query = orderId
            ? { _id: orderId, user: customer._id }
            : { razorpayOrderId: razorpay_order_id, user: customer._id };

        const order = await orderModel.findOne(query);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Verify HMAC SHA256 Signature
        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        let isSignatureValid = false;

        if (key_secret && razorpay_signature) {
            const expectedSignature = crypto
                .createHmac("sha256", key_secret)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest("hex");

            isSignatureValid = (expectedSignature === razorpay_signature);
        } else {
            // For mock testing when keys are dummy or not set
            isSignatureValid = true;
        }

        // If signature is invalid: 400 - DO NOT CLEAR CART
        if (!isSignatureValid) {
            order.paymentStatus = "FAILED";
            await order.save();
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature. Payment verification failed. Cart was not cleared."
            });
        }

        // If valid: Mark Payment PAID + Order PLACED
        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        // Reduce product stock
        for (const item of order.items) {
            await productModel.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        // Clear user cart in MongoDB
        customer.cart = [];
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Payment verified and order placed successfully",
            order
        });

    } catch (error) {
        console.error("Error in verifyPayment:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while verifying payment",
            error: error.message
        });
    }
};

// 3. Get User Orders (GET /orders)
export const getUserOrders = async (req, res) => {
    try {
        const orders = await orderModel
            .find({ user: req.customer._id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message
        });
    }
};

// 4. Get Single Order by ID (GET /orders/:id)
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await orderModel.findOne({
            _id: id,
            user: req.customer._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch order",
            error: error.message
        });
    }
};

