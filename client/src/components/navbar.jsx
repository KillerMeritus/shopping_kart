import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../axiosCalls/axios";

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/customers/logout");

            navigate("/login");
        } catch (error) {
            console.error(
                "Logout failed:",
                error.response?.data?.message || error.message
            );
        }
    };

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                {/* Logo */}
                <Link
                    to="/home"
                    className="text-2xl font-bold text-indigo-600"
                >
                    ShopKart
                </Link>

                {/* Navigation */}
                <div className="flex items-center gap-6">

                    <Link
                        to="/home"
                        className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                    >
                        Home
                    </Link>

                    <Link
                        to="/products"
                        className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                    >
                        Products
                    </Link>

                    <Link
                        to="/wishlist"
                        className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                    >
                        Wishlist ❤️
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                        Logout
                    </button>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;