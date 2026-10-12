import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { axiosInstance } from "../axiosCalls/axios";
import {
    selectCartItems,
    selectCartSubtotal,
    selectCartTotalCount,
    resetCart
} from "../redux/cartSlice";

const Checkout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartItems = useSelector(selectCartItems);
    const subtotal = useSelector(selectCartSubtotal);
    const totalCount = useSelector(selectCartTotalCount);

    const [shippingDetails, setShippingDetails] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
    });

    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingDetails((prev) => ({
            ...prev,
            [name]: value
        }));
        // Clear field error and form error on change
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: ""
            }));
        }
        if (formError) {
            setFormError("");
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Whitespace-trimmed values
        const fullName = shippingDetails.fullName.trim();
        const phone = shippingDetails.phone.trim();
        const address = shippingDetails.address.trim();
        const city = shippingDetails.city.trim();
        const state = shippingDetails.state.trim();
        const pincode = shippingDetails.pincode.trim();

        // 1. Full Name: required & non-empty
        if (!fullName) {
            newErrors.fullName = "Full Name is required.";
        }

        // 2. Phone Number: required & valid 10-digit format
        if (!phone) {
            newErrors.phone = "Phone Number is required.";
        } else if (!/^[0-9]{10}$/.test(phone)) {
            newErrors.phone = "Phone Number must contain a valid 10-digit number.";
        }

        // 3. Address Line: required & non-empty
        if (!address) {
            newErrors.address = "Address Line is required.";
        }

        // 4. City: required & non-empty
        if (!city) {
            newErrors.city = "City is required.";
        }

        // 5. State: required & non-empty
        if (!state) {
            newErrors.state = "State is required.";
        }

        // 6. Pincode: required & exactly 6 digits
        if (!pincode) {
            newErrors.pincode = "Pincode is required.";
        } else if (!/^[0-9]{6}$/.test(pincode)) {
            newErrors.pincode = "Pincode must contain 6 digits.";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            setFormError("Please correct the errors in the shipping form before placing order.");
            return false;
        }

        setFormError("");
        return true;
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setFormError("");

        try {
            const payload = {
                shippingAddress: {
                    fullName: shippingDetails.fullName.trim(),
                    phone: shippingDetails.phone.trim(),
                    addressLine1: shippingDetails.address.trim(),
                    city: shippingDetails.city.trim(),
                    state: shippingDetails.state.trim(),
                    pincode: shippingDetails.pincode.trim()
                }
            };

            const response = await axiosInstance.post("/orders/create-payment-order", payload);

            if (response.data.success) {
                const { order, razorpayOrderId, amount, currency, key } = response.data;

                // Function to verify payment and clear cart
                const completeVerification = async (paymentDetails) => {
                    try {
                        const verifyRes = await axiosInstance.post("/orders/verify-payment", {
                            razorpay_order_id: paymentDetails.razorpay_order_id,
                            razorpay_payment_id: paymentDetails.razorpay_payment_id,
                            razorpay_signature: paymentDetails.razorpay_signature,
                            orderId: order._id
                        });

                        if (verifyRes.data.success) {
                            // Clear frontend global cart state
                            dispatch(resetCart());
                            navigate(`/order-success/${order._id}`);
                        }
                    } catch (verifyError) {
                        const vMsg =
                            verifyError.response?.data?.message ||
                            "Payment verification failed. Cart was not cleared.";
                        setFormError(vMsg);
                    } finally {
                        setIsSubmitting(false);
                    }
                };

                // Check if Razorpay script is loaded and usable
                if (window.Razorpay && key && !key.includes("mock")) {
                    const options = {
                        key: key,
                        amount: amount,
                        currency: currency || "INR",
                        name: "ShopKart",
                        description: `Order #${order._id.slice(-6)}`,
                        order_id: razorpayOrderId,
                        prefill: {
                            name: shippingDetails.fullName.trim(),
                            contact: shippingDetails.phone.trim()
                        },
                        theme: {
                            color: "#4f46e5"
                        },
                        handler: function (paymentResponse) {
                            completeVerification(paymentResponse);
                        },
                        modal: {
                            ondismiss: function () {
                                setIsSubmitting(false);
                            }
                        }
                    };

                    const rzp = new window.Razorpay(options);
                    rzp.on("payment.failed", function (failResponse) {
                        setFormError("Payment failed. Please try again. Cart was not cleared.");
                        setIsSubmitting(false);
                    });
                    rzp.open();
                } else {
                    // Simulated / Lab fallback when live Razorpay API key is not in .env
                    const simPaymentId = `pay_sim_${Date.now()}`;
                    await completeVerification({
                        razorpay_order_id: razorpayOrderId,
                        razorpay_payment_id: simPaymentId,
                        razorpay_signature: "simulated_signature"
                    });
                }
            }
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                err.message ||
                "Failed to create order. Please try again.";
            setFormError(errorMsg);
            setIsSubmitting(false);
        }
    };

    // If cart is empty, show empty state
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center max-w-md w-full">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Your cart is empty 🛒
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Add items to your cart before proceeding to checkout.
                    </p>
                    <button
                        onClick={() => navigate("/products")}
                        className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm"
                    >
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/cart")}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-3 inline-flex items-center gap-1 transition"
                    >
                        ← Back to Cart
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Checkout
                    </h1>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-200">
                    {/* Shipping Details Section */}
                    <div className="p-6 sm:p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span>📦</span> Shipping Details
                        </h2>

                        {/* Form-level Error Banner */}
                        {formError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                                <span className="text-base">⚠️</span>
                                <span className="font-medium">{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label
                                    htmlFor="fullName"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={shippingDetails.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                    className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                                        errors.fullName
                                            ? "border-red-400 bg-red-50"
                                            : "border-gray-300 bg-white"
                                    }`}
                                />
                                {errors.fullName && (
                                    <p className="mt-1 text-xs text-red-600 font-medium">
                                        {errors.fullName}
                                    </p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label
                                    htmlFor="phone"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={shippingDetails.phone}
                                    onChange={handleInputChange}
                                    placeholder="10-digit mobile number"
                                    maxLength="10"
                                    className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                                        errors.phone
                                            ? "border-red-400 bg-red-50"
                                            : "border-gray-300 bg-white"
                                    }`}
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-xs text-red-600 font-medium">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            {/* Address Line */}
                            <div>
                                <label
                                    htmlFor="address"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Address Line <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="address"
                                    name="address"
                                    rows="2"
                                    value={shippingDetails.address}
                                    onChange={handleInputChange}
                                    placeholder="Street address, apartment, suite, etc."
                                    className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                                        errors.address
                                            ? "border-red-400 bg-red-50"
                                            : "border-gray-300 bg-white"
                                    }`}
                                />
                                {errors.address && (
                                    <p className="mt-1 text-xs text-red-600 font-medium">
                                        {errors.address}
                                    </p>
                                )}
                            </div>

                            {/* City, State, Pincode (3 Columns on medium+ screens) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label
                                        htmlFor="city"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={shippingDetails.city}
                                        onChange={handleInputChange}
                                        placeholder="City"
                                        className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                                            errors.city
                                                ? "border-red-400 bg-red-50"
                                                : "border-gray-300 bg-white"
                                        }`}
                                    />
                                    {errors.city && (
                                        <p className="mt-1 text-xs text-red-600 font-medium">
                                            {errors.city}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="state"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="state"
                                        name="state"
                                        value={shippingDetails.state}
                                        onChange={handleInputChange}
                                        placeholder="State"
                                        className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                                            errors.state
                                                ? "border-red-400 bg-red-50"
                                                : "border-gray-300 bg-white"
                                        }`}
                                    />
                                    {errors.state && (
                                        <p className="mt-1 text-xs text-red-600 font-medium">
                                            {errors.state}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="pincode"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Pincode <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="pincode"
                                        name="pincode"
                                        value={shippingDetails.pincode}
                                        onChange={handleInputChange}
                                        placeholder="6 digits"
                                        maxLength="6"
                                        className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                                            errors.pincode
                                                ? "border-red-400 bg-red-50"
                                                : "border-gray-300 bg-white"
                                        }`}
                                    />
                                    {errors.pincode && (
                                        <p className="mt-1 text-xs text-red-600 font-medium">
                                            {errors.pincode}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary Section */}
                    <div className="p-6 sm:p-8 bg-gray-50/50">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span>🧾</span> Order Summary
                        </h2>

                        {/* Items List */}
                        <div className="space-y-3 mb-6">
                            {cartItems.map((item) => {
                                const product = item.product || {};
                                const itemTotal = (product.price || 0) * item.quantity;

                                return (
                                    <div
                                        key={product._id || item._id}
                                        className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-none"
                                    >
                                        <div className="flex items-center gap-3">
                                            {product.image && (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                                                />
                                            )}
                                            <span className="font-medium text-gray-800">
                                                {product.name} <span className="text-gray-500 font-normal">× {item.quantity}</span>
                                            </span>
                                        </div>
                                        <span className="font-semibold text-gray-900">
                                            ₹{itemTotal.toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Totals Calculation */}
                        <div className="border-t border-gray-200 pt-4 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Total Units</span>
                                <span>{totalCount}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="flex justify-between items-baseline pt-2 border-t border-gray-200">
                                <span className="text-lg font-bold text-gray-900">Total</span>
                                <span className="text-2xl font-bold text-indigo-600">
                                    ₹{subtotal.toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>

                        {/* Place Order CTA */}
                        <div className="mt-8">
                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={isSubmitting || cartItems.length === 0}
                                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-base hover:bg-indigo-700 transition shadow-sm hover:shadow disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? "Placing Order..." : "Place Order"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
