
import "./Login.css";
import React, { useState } from "react";
import { axiosInstance } from "../axiosCalls/axios";
import { useNavigate } from "react-router-dom";


const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loader, setLoader] = useState(false);
  const [err, setErr] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoader(true);
    setErr(null);

    try {
      const res = await axiosInstance.post("customers/login", formData);

      console.log(res);
      console.log("User Logged In");

      setLoader(false);

      navigate("/home");
    } catch (err) {
        setLoader(false);

        if (err.response?.data?.message) {
            setErr(err.response.data.message);
        } else {
            setErr(err.message);
        }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Welcome Back</h1>
        <p>Login to continue shopping with Shopping Kart.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loader}>
            {loader ? "Logging in..." : "Login"}
          </button>

          {err && <p className="error-message">{err}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;


