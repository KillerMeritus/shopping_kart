import React from "react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {

    const navigate = useNavigate();
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">

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

                {/* Button */}
                <button
                    onClick={()=> navigate(`/products/${product._id}`)}
                    className="w-full mt-5 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                    View Details
                </button>

            </div>
        </div>
    );
};

export default ProductCard;