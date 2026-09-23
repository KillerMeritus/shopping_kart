import React from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../axiosCalls/axios";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/customers/logout");

      navigate("/login");
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <nav>
      <h2>Shopping Kart</h2>

      <button onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
};

export default Navbar;