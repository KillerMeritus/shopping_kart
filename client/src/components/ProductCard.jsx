import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { axiosInstance } from "../axiosCalls/axios";
import { addToCart, selectCartItems } from "../redux/cartSlice";
import { toggleWishlist, selectWishlistItems } from "../redux/wishlistSlice";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const cartItems = useSelector(selectCartItems);
    const cartItem = cartItems.find(
        (item) => (item.product?._id || item.product) === product._id
    );
    const isInCart = Boolean(cartItem);

    const wishlistItems = useSelector(selectWishlistItems);
    const isInWishlist = wishlistItems.some(
        (item) => (item._id || item) === product._id
    );

    const [addingToCart, setAddingToCart] = useState(false);
    const [cartError, setCartError] = useState("");

    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [wishlistError, setWishlistError] = useState("");

    const handleToggleWishlist = async () => {
        if (wishlistLoading) return;

        setWishlistLoading(true);
        setWishlistError("");

        try {
            const resultAction = await dispatch(toggleWishlist(product._id));
            if (toggleWishlist.rejected.match(resultAction)) {
                setWishlistError(
                    resultAction.payload || "Failed to update wishlist"
                );
            }
        } catch (error) {
            setWishlistError("Failed to update wishlist");
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (addingToCart || product.stock === 0) return;

        if (cartItem && cartItem.quantity >= product.stock) {
            setCartError("Reached maximum available stock");
            return;
        }

        setAddingToCart(true);
        setCartError("");

        try {
            const resultAction = await dispatch(addToCart(product._id));
            if (addToCart.rejected.match(resultAction)) {
                setCartError(resultAction.payload || "Failed to add to cart");
            }
        } catch (error) {
            setCartError("Failed to add to cart");
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between">
            {/* Top Section */}
            <div>
                {/* Product Image */}
                <div className="h-52 bg-gray-100 overflow-hidden">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Product Information */}
                <div className="p-5 pb-0">
                    <div className="flex items-start justify-between gap-3">
                        <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {product.name}
                        </h2>

                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full whitespace-nowrap">
                            {product.category}
                        </span>
                    </div>

                    <p className="text-2xl font-bold text-gray-900 mt-4">
                        ₹{product.price.toLocaleString("en-IN")}
                    </p>

                    {/* Stock */}
                    <p
                        className={`text-sm mt-2 font-medium ${
                            product.stock > 0 ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        {product.stock > 0
                            ? `${product.stock} units left`
                            : "Out of stock"}
                    </p>
                </div>
            </div>

            {/* Actions Section */}
            <div className="p-5 pt-4">
                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={
                        addingToCart ||
                        product.stock === 0 ||
                        (cartItem && cartItem.quantity >= product.stock)
                    }
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {addingToCart
                        ? "Adding..."
                        : product.stock === 0
                        ? "Out of Stock"
                        : isInCart
                        ? "Add Another"
                        : "Add to Cart"}
                </button>

                {/* Cart Error */}
                {cartError && (
                    <p className="text-sm text-red-600 mt-2 text-center">
                        {cartError}
                    </p>
                )}

                {/* Wishlist Button (Bonus Task 23) */}
                <button
                    onClick={handleToggleWishlist}
                    disabled={wishlistLoading}
                    className={`w-full mt-2.5 border py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed text-sm ${
                        isInWishlist
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                    {wishlistLoading
                        ? "⏳ Updating..."
                        : isInWishlist
                        ? "♥ Remove from Wishlist"
                        : "♡ Add to Wishlist"}
                </button>

                {/* Wishlist Error */}
                {wishlistError && (
                    <p className="text-sm text-red-600 mt-1.5 text-center">
                        {wishlistError}
                    </p>
                )}

                {/* View Details */}
                <button
                    onClick={() => navigate(`/products/${product._id}`)}
                    className="w-full mt-2 text-indigo-600 hover:text-indigo-800 py-1.5 rounded-lg font-medium transition-colors text-sm text-center"
                >
                    View Details →
                </button>
            </div>
        </div>
    );
};

export default ProductCard;