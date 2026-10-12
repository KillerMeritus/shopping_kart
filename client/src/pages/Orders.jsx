import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../axiosCalls/axios";

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axiosInstance.get("/orders");
            if (response.data.success) {
                setOrders(response.data.orders || []);
            }
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            setError(
                err.response?.data?.message || "Failed to load orders."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // 1. Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your orders...</p>
                </div>
            </div>
        );
    }

    // 2. Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
                    <span className="text-4xl">⚠️</span>
                    <h2 className="text-xl font-bold text-gray-900 mt-3">Unable to Load Orders</h2>
                    <p className="text-gray-500 text-sm mt-2">{error}</p>
                    <button
                        onClick={fetchOrders}
                        className="mt-6 w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // 3. Empty state
    if (orders.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center max-w-md w-full">
                    <span className="text-5xl">📦</span>
                    <h2 className="text-xl font-bold text-gray-800 mt-4">
                        You have not placed any orders yet.
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">
                        Explore our products and start adding items to your cart.
                    </p>
                    <button
                        onClick={() => navigate("/products")}
                        className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-sm"
                    >
                        Start Shopping
                    </button>
                </div>
            </div>
        );
    }

    // 4. Orders list
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            My Orders
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {orders.length} {orders.length === 1 ? "order" : "orders"} placed
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/products")}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
                    >
                        + Shop More
                    </button>
                </div>

                {/* Orders Grid/List */}
                <div className="space-y-6">
                    {orders.map((order) => {
                        const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        });

                        return (
                            <div
                                key={order._id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition hover:shadow-md"
                            >
                                {/* Order Header: ID and Date */}
                                <div className="border-b border-gray-100 pb-3 mb-4 flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <h3 className="font-mono text-base font-bold text-gray-900">
                                            Order #{order._id}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {formattedDate}
                                        </p>
                                    </div>

                                    <span
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                            order.status === "PLACED" || order.status === "CONFIRMED"
                                                ? "bg-green-100 text-green-800"
                                                : order.status === "PENDING_PAYMENT"
                                                ? "bg-amber-100 text-amber-800"
                                                : "bg-gray-100 text-gray-800"
                                        }`}
                                    >
                                        Status: {order.status}
                                    </span>
                                </div>

                                {/* Items List: Keyboard × 2 */}
                                <div className="space-y-2 mb-4 bg-gray-50/60 rounded-xl p-4 border border-gray-100">
                                    {order.items?.map((item, idx) => (
                                        <div
                                            key={item._id || idx}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <div className="flex items-center gap-3">
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-8 h-8 object-cover rounded-lg border border-gray-200"
                                                    />
                                                )}
                                                <span className="font-medium text-gray-800">
                                                    {item.name} <span className="text-gray-500 font-normal">× {item.quantity}</span>
                                                </span>
                                            </div>
                                            <span className="font-semibold text-gray-700">
                                                ₹{((item.price || 0) * item.quantity).toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Total and Action Button */}
                                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
                                    <div>
                                        <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">
                                            Total Amount
                                        </span>
                                        <span className="text-xl font-bold text-indigo-600">
                                            ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/orders/${order._id}`)}
                                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-5 py-2.5 rounded-xl text-sm transition"
                                    >
                                        View Details →
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Orders;
