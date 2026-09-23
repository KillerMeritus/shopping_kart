import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { axiosInstance } from "../axiosCalls/axios";

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axiosInstance.get("/customers/me");
        setAuthenticated(true);
      } catch (err) {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Checking authentication...</div>;
  }

  return authenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;