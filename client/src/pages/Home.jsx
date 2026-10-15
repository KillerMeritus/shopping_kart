import React, { useEffect, useState } from "react";
import { axiosInstance } from "../axiosCalls/axios";
import { useNavigate, Link } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loader, setLoader] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const getCustomer = async () => {
      try {
        const res = await axiosInstance.get("/customers/me");
        setCustomer(res.data.customer);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
          return;
        }
        console.log(err.message);
        setErr(err.message);
      } finally {
        setLoader(false);
      }
    };

    getCustomer();
  }, [navigate]);

  if (loader) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Something went wrong.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {customer?.fullName?.split(" ")[0]}!
          </h1>
          <p className="text-gray-500 mt-1">Good to have you here. What would you like to do today?</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Account Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Info</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="w-16 text-gray-400 font-medium">Name</span>
              <span>{customer?.fullName}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="w-16 text-gray-400 font-medium">Email</span>
              <span>{customer?.email}</span>
            </div>
            {customer?.phone && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="w-16 text-gray-400 font-medium">Phone</span>
                <span>{customer?.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/products"
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Browse Products
            </Link>
            <Link
              to="/cart"
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              My Cart
            </Link>
            <Link
              to="/wishlist"
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Wishlist
            </Link>
            <Link
              to="/orders"
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              My Orders
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
