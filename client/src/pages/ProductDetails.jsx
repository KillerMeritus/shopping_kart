import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../axiosCalls/axios";

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getProduct = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await axiosInstance.get(`/products/${id}`);

            setProduct(res.data);
        } catch (err) {
            console.log(err);

            if (err.response?.status === 404) {
                setError("Product not found.");
            } else {
                setError("Failed to load product.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProduct();
    }, [id]);

    // Loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500 text-lg">
                    Loading product...
                </p>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
                <h1 className="text-2xl font-bold text-gray-900">
                    {error}
                </h1>

                <button
                    onClick={() => navigate("/products")}
                    className="mt-5 rounded-lg bg-indigo-600 px-5 py-3 text-white font-medium hover:bg-indigo-700 transition"
                >
                    Back to Products
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Back */}
                <button
                    onClick={() => navigate("/products")}
                    className="mb-6 text-sm font-medium text-gray-600 hover:text-indigo-600 transition"
                >
                    ← Back to Products
                </button>

                {/* Product */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                    <div className="grid grid-cols-1 md:grid-cols-2">

                        {/* Image */}
                        <div className="bg-gray-100 min-h-[400px] md:min-h-[600px] flex items-center justify-center">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full max-h-[600px] object-cover"
                            />
                        </div>

                        {/* Details */}
                        <div className="p-8 md:p-12 flex flex-col">

                            {/* Category */}
                            <span className="w-fit px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
                                {product.category}
                            </span>

                            {/* Name */}
                            <h1 className="mt-5 text-3xl md:text-4xl font-bold text-gray-900">
                                {product.name}
                            </h1>

                            {/* Description */}
                            <p className="mt-5 text-gray-600 leading-7">
                                {product.description}
                            </p>

                            {/* Price */}
                            <div className="mt-8">
                                <p className="text-sm text-gray-500">
                                    Price
                                </p>

                                <p className="mt-1 text-4xl font-bold text-gray-900">
                                    ₹{product.price.toLocaleString("en-IN")}
                                </p>
                            </div>

                            {/* Stock */}
                            <div className="mt-6">
                                {product.stock > 0 ? (
                                    <div className="flex items-center gap-2 text-green-600 font-medium">
                                        <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>

                                        {product.stock} units available
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-600 font-medium">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>

                                        Out of stock
                                    </div>
                                )}
                            </div>

                            {/* Add to Cart */}
                            <button
                                disabled={product.stock === 0}
                                className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold transition"
                            >
                                {product.stock > 0
                                    ? "Add to Cart"
                                    : "Out of Stock"}
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;