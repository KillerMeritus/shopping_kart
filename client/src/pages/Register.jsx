import "./Register.css";
import React, { useState } from "react";
import { axiosInstance } from '../axiosCalls/axios'
import { useNavigate } from "react-router-dom";


const Register = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

    const [loader, setLoader] = useState(false)
    const [err, setErr] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(e.target);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true)
    console.log("Registration data:", formData);
    try{
    const res = await axiosInstance.post('customers/register', formData)
    setLoader(false)
    console.log(res)
    console.log("User Registered")
    
    navigate("/login")

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
    <div className="register-page">
      <div className="register-container">
        <h1>Create Account</h1>
        <p>Register to start shopping with Shopping Kart.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {err && <p style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{err}</p>}

          <button type="submit" disabled={loader}>
            {loader ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;


// ### How it works

// * `useState` stores all four form values in one object.
// * `handleChange` updates only the field the user is currently typing into.
// * `handleSubmit` prevents the browser's default form submission and currently logs the data.
// * `required` gives you basic browser-side validation.
// * `type="email"` and `type="password"` provide appropriate browser input behaviour.
// * The backend call can later be added inside `handleSubmit`, probably to your `/customers/register` endpoint.

// One important thing: **the field names must match what your backend expects**. If your MongoDB model uses names like `name` and `phone` instead of `fullName` and `phoneNumber`, we should align those before connecting the API.

// If you want, next try implementing the **Login.jsx** yourself using the same controlled-form concept.
