import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { axiosInstance } from "../axiosCalls/axios";
import { fetchCart } from "../redux/cartSlice";
import { fetchWishlist } from "../redux/wishlistSlice";

const PrivateRoute = ({ children }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axiosInstance.get("/customers/me");
        setAuthenticated(true);
        dispatch(fetchCart());
        dispatch(fetchWishlist());
      } catch (err) {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  if (loading) {
    return <div>Checking authentication...</div>;
  }

  return authenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;