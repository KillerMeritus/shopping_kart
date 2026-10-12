import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { axiosInstance } from "../axiosCalls/axios";

const OrderSuccess = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/orders/${id}`);
                if (response.data.success) {
                    setOrder(response.data.order);
                }
            } catch (err) {
                console.error("Failed to load order:", err);
                setError(
                    err.response?.data?.message ||
                    "Could not load order details."
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading order confirmation...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
                    <span className="text-4xl">⚠️</span>
                    <h2 className="text-xl font-bold text-gray-900 mt-3">Order Not Found</h2>
                    <p className="text-gray-500 text-sm mt-2">{error || "We couldn't retrieve this order."}</p>
                    <button
                        onClick={() => navigate("/products")}
                        className="mt-6 w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-10 text-center">
                    {/* Success Icon */}
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">
                        ✓
                    </div>

                    {/* Title & Subtitle */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Order Placed Successfully
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm sm:text-base">
                        Your order has been saved successfully.
                    </p>

                    {/* Order Details Card */}
                    <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200 text-left space-y-4">
                        {/* Order ID */}
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                            <div>
                                <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">
                                    Order ID
                                </span>
                                <span className="font-mono text-sm font-semibold text-gray-800 break-all">
                                    {order._id}
                                </span>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                Status
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                {order.status}
                            </span>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-baseline pt-1">
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                Total
                            </span>
                            <span className="text-2xl font-bold text-indigo-600">
                                ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>

                    {/* Ordered Items Preview */}
                    {order.items && order.items.length > 0 && (
                        <div className="mt-6 text-left">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                                Items Ordered ({order.items.length})
                            </h3>
                            <div className="space-y-2 border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                                {order.items.map((item, index) => (
                                    <div
                                        key={item._id || index}
                                        className="flex items-center justify-between text-sm py-1.5"
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.image && (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                                                />
                                            )}
                                            <span className="font-medium text-gray-900">
                                                {item.name}{" "}
                                                <span className="text-gray-500 font-normal">
                                                    × {item.quantity}
                                                </span>
                                            </span>
                                        </div>
                                        <span className="font-semibold text-gray-800">
                                            ₹{((item.price || 0) * item.quantity).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Shipping Address Preview */}
                    {order.shippingAddress && (
                        <div className="mt-4 text-left p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600">
                            <span className="font-semibold text-gray-800 block mb-1">
                                Delivery To: {order.shippingAddress.fullName} ({order.shippingAddress.phone})
                            </span>
                            <span>
                                {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                            </span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => navigate("/orders")}
                            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-sm"
                        >
                            View My Orders
                        </button>
                        <button
                            onClick={() => navigate("/products")}
                            className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
