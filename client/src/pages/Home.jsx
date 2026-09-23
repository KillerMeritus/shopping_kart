import "./Home.css";
import React, { useEffect, useState } from "react";
import { axiosInstance } from "../axiosCalls/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";

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
    return <div className="home-page">Loading...</div>;
  }

  if (err) {
    return <div className="home-page">Something went wrong.</div>;
  }

  return (
    
    <div className="home-page">
      <div className="home-container">
        <h1>Welcome to Shopping Kart!</h1>

        <div className="customer-info">
          <h2>{customer?.fullName}</h2>

          <p>
            <strong>Email:</strong> {customer?.email}
          </p>

          <p>
            <strong>Phone:</strong> {customer?.phone}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;