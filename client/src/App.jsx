import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Navbar from "./components/navbar";
import RootRoute from "./components/RootRoute";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";

import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 selection:bg-indigo-500 selection:text-white">
        <main className="flex-1">
          <Routes>

            <Route
              path="/"
              element={
              <RootRoute/>
              }
            />

            {/* Public Routes */}
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Private Route */}
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <Home />
                  </>
                </PrivateRoute>
              }
            />

            <Route 
            path="/products" 
            element={
            <PrivateRoute>

              <Products />
            </PrivateRoute>
             
            }
            />
            <Route
                path="/products/:id"
                element={
                <PrivateRoute>

                  <ProductDetails />
                </PrivateRoute>
                }
            />


          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;