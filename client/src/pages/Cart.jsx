import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
    selectCartItems,
    selectCartLoading,
    selectCartError,
    selectCartTotalCount,
    selectCartSubtotal,
    updateCartQuantity,
    removeFromCart
} from "../redux/cartSlice";

const Cart = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const cartItems = useSelector(selectCartItems);
    const loading = useSelector(selectCartLoading);
    const cartError = useSelector(selectCartError);
    const totalItems = useSelector(selectCartTotalCount);
    const subtotal = useSelector(selectCartSubtotal);

    // Keep track of which item is currently being modified
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const handleQuantityChange = async (productId, newQuantity, currentStock) => {
        if (newQuantity < 1) return;
        if (newQuantity > currentStock) return;

        setActionLoadingId(productId);
        try {
            await dispatch(
                updateCartQuantity({ productId, quantity: newQuantity })
            ).unwrap();
        } catch (err) {
            console.error("Failed to update quantity:", err);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleRemove = async (productId) => {
        setActionLoadingId(productId);
        try {
            await dispatch(removeFromCart(productId)).unwrap();
        } catch (err) {
            console.error("Failed to remove item:", err);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleCheckout = () => {
        alert("Proceeding to checkout! (Ready for next lab)");
    };

    // 1. Loading State
    if (loading && cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-lg text-gray-600">
                    Loading your cart...
                </p>
            </div>
        );
    }

    // 2. Error State
    if (cartError && cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-lg text-red-600">
                        Unable to load your cart.
                    </p>
                    <button
                        onClick={() => dispatch(fetchCart())}
                        className="mt-4 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // 3. Empty State
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center max-w-md w-full">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Your cart is empty 🛒
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Looks like you haven't added anything yet.
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
            <div className="max-w-7xl mx-auto">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Cart
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
                    </p>
                </div>

                {/* Inline Error Banner for update actions */}
                {cartError && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {cartError}
                    </div>
                )}
                    /* Cart Layout */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => {
                                const product = item.product || {};
                                const isUpdating = actionLoadingId === product._id;
                                const isMaxStock =
                                    item.quantity >= (product.stock || 0);
                                const isMinQuantity = item.quantity <= 1;

                                return (
                                    <div
                                        key={product._id || item._id}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col sm:flex-row gap-5 items-center transition hover:shadow-md"
                                    >
                                        {/* Product Image */}
                                        <div
                                            onClick={() =>
                                                navigate(`/products/${product._id}`)
                                            }
                                            className="w-28 h-28 bg-gray-100 rounded-xl overflow-hidden shrink-0 cursor-pointer flex items-center justify-center"
                                        >
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover hover:scale-105 transition duration-200"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 text-center sm:text-left">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                <h3
                                                    onClick={() =>
                                                        navigate(
                                                            `/products/${product._id}`
                                                        )
                                                    }
                                                    className="text-lg font-semibold text-gray-900 hover:text-indigo-600 cursor-pointer transition line-clamp-1"
                                                >
                                                    {product.name}
                                                </h3>

                                                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium w-fit mx-auto sm:mx-0">
                                                    {product.category}
                                                </span>
                                            </div>

                                            <p className="text-gray-500 text-sm mt-1">
                                                Unit Price: ₹
                                                {(
                                                    product.price || 0
                                                ).toLocaleString("en-IN")}
                                            </p>

                                            {/* Quantity & Action Controls */}
                                            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-between gap-4">
                                                {/* Quantity Stepper */}
                                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                                                    {/* Minus Button */}
                                                    <button
                                                        onClick={() =>
                                                            handleQuantityChange(
                                                                product._id,
                                                                item.quantity - 1,
                                                                product.stock
                                                            )
                                                        }
                                                        disabled={
                                                            isMinQuantity || isUpdating
                                                        }
                                                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-base transition select-none"
                                                        title={
                                                            isMinQuantity
                                                                ? "Minimum quantity is 1. Use remove to delete."
                                                                : "Decrease quantity"
                                                        }
                                                    >
                                                        −
                                                    </button>

                                                    {/* Quantity Value */}
                                                    <span className="px-4 py-1.5 font-semibold text-gray-900 min-w-10 text-center bg-white border-x border-gray-300">
                                                        {item.quantity}
                                                    </span>

                                                    {/* Plus Button */}
                                                    <button
                                                        onClick={() =>
                                                            handleQuantityChange(
                                                                product._id,
                                                                item.quantity + 1,
                                                                product.stock
                                                            )
                                                        }
                                                        disabled={
                                                            isMaxStock || isUpdating
                                                        }
                                                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-base transition select-none"
                                                        title={
                                                            isMaxStock
                                                                ? "Maximum stock reached"
                                                                : "Increase quantity"
                                                        }
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* Line Item Total */}
                                                <div className="text-right">
                                                    <span className="text-xs text-gray-400 block sm:hidden">
                                                        Item Total:
                                                    </span>
                                                    <span className="text-lg font-bold text-gray-900">
                                                        ₹
                                                        {(
                                                            (product.price || 0) *
                                                            item.quantity
                                                        ).toLocaleString("en-IN")}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Sub-actions & Warnings */}
                                            <div className="mt-3 flex items-center justify-between">
                                                {/* Remove Button */}
                                                <button
                                                    onClick={() =>
                                                        handleRemove(product._id)
                                                    }
                                                    disabled={isUpdating}
                                                    className="text-sm font-medium text-red-600 hover:text-red-700 transition disabled:opacity-50"
                                                >
                                                    {isUpdating
                                                        ? "Updating..."
                                                        : "Remove"}
                                                </button>

                                                {/* Stock warnings */}
                                                {isMaxStock && (
                                                    <span className="text-xs text-amber-600 font-medium">
                                                        Max stock reached ({product.stock})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary Panel */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
                            <h2 className="text-xl font-bold text-gray-900 pb-4 border-b border-gray-100">
                                Order Summary
                            </h2>

                            <div className="mt-4 space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Items</span>
                                    <span className="font-medium text-gray-900">
                                        {totalItems}
                                    </span>
                                </div>

                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">
                                        Free
                                    </span>
                                </div>

                                <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                                    <span className="text-base font-semibold text-gray-900">
                                        Subtotal
                                    </span>
                                    <span className="text-2xl font-bold text-gray-900">
                                        ₹{subtotal.toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={cartItems.length === 0}
                                className="w-full mt-6 bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-sm hover:shadow disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Proceed to Checkout
                            </button>

                            <button
                                onClick={() => navigate("/products")}
                                className="w-full mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium py-2 transition text-center"
                            >
                                ← Continue Shopping
                            </button>
                        </div>
                    </div>
            </div>
        </div>
    );
};

export default Cart;
