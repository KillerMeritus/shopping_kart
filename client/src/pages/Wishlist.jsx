import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
    selectWishlistItems,
    selectWishlistLoading,
    selectWishlistError,
    fetchWishlist,
    removeFromWishlist
} from "../redux/wishlistSlice";

const Wishlist = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const wishlist = useSelector(selectWishlistItems);
    const loading = useSelector(selectWishlistLoading);
    const error = useSelector(selectWishlistError);

    useEffect(() => {
        dispatch(fetchWishlist());
    }, [dispatch]);

    const handleRemove = async (productId) => {
        dispatch(removeFromWishlist(productId));
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg text-gray-600">
                    Loading your wishlist...
                </p>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">

                    <p className="text-lg text-red-600">
                        Unable to load wishlist.
                    </p>

                    <button
                        onClick={fetchWishlist}
                        className="mt-4 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Try Again
                    </button>

                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            <div className="max-w-7xl mx-auto">

                {/* Heading */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Wishlist
                    </h1>

                    <p className="text-gray-500 mt-2">
                        {wishlist.length}{" "}
                        {wishlist.length === 1
                            ? "product"
                            : "products"}
                    </p>
                </div>

                {/* Empty State */}
                {wishlist.length === 0 ? (

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">

                        <p className="text-xl font-semibold text-gray-800">
                            Your wishlist is empty ❤️
                        </p>

                        <p className="text-gray-500 mt-2">
                            Start saving products you love.
                        </p>

                        <button
                            onClick={() => navigate("/products")}
                            className="mt-5 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Browse Products
                        </button>

                    </div>

                ) : (

                    /* Wishlist Products */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                        {wishlist.map((product) => (

                            <div
                                key={product._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                            >

                                {/* Product Image */}
                                <div className="h-52 bg-gray-100 overflow-hidden">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Product Information */}
                                <div className="p-5">

                                    <div className="flex items-start justify-between gap-3">

                                        <h2 className="text-lg font-semibold text-gray-900">
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
                                            product.stock > 0
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {product.stock > 0
                                            ? `${product.stock} units left`
                                            : "Out of stock"}
                                    </p>

                                    {/* View Details */}
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/products/${product._id}`
                                            )
                                        }
                                        className="w-full mt-5 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                                    >
                                        View Details
                                    </button>

                                    {/* Remove */}
                                    <button
                                        onClick={() =>
                                            handleRemove(product._id)
                                        }
                                        className="w-full mt-3 border border-red-300 text-red-600 py-2.5 rounded-lg font-medium hover:bg-red-50 transition-colors"
                                    >
                                        Remove from Wishlist
                                    </button>

                                </div>
                            </div>

                        ))}

                    </div>
                )}

            </div>
        </div>
    );
};

export default Wishlist;