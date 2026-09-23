import React from "react";
import { useState, useEffect } from "react";
import { axiosInstance } from "../axiosCalls/axios";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");

    const navigate = useNavigate();

    const params = new URLSearchParams();

    if (search) {
        params.append("search", search);
    }

    if (category) {
        params.append("category", category);
    }

    const fetchProducts = async () => {
        try {
            const res = await axiosInstance.get("/products", {
                params: params
            });

            setProducts(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [search, category]);

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-8">

                    <h1 className="text-3xl font-bold text-gray-900">
                        Products
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Discover products from our catalog
                    </p>

                    {/* Search & Filter */}
                    <div className="flex flex-col md:flex-row gap-4 mt-6">

                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Categories</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Fashion">Fashion</option>
                            <option value="Books">Books</option>
                            <option value="Home">Home</option>
                            <option value="Furniture">Furniture</option>
                            <option value="Stationery">Stationery</option>
                        </select>

                    </div>
                </div>
            </div>

            {/* Products */}
            <div className="max-w-7xl mx-auto px-6 py-8">

                {products.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">
                            No products found.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                            />
                        ))}
                    </div>
                )}

            </div>

        </div>
    );
};

export default Products;