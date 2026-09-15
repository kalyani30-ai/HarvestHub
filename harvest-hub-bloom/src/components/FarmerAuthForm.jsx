import React, { useState } from "react";
import "./FarmerAuthForm.css";

const API_URL = (import.meta.env.VITE_API_BASE_URL?.replace(/\/$|\/api$/i, '') || import.meta.env.VITE_API_URL || "http://localhost:5000");

export default function FarmerAuthForm() {
  const [isLogin, setIsLogin] = useState(false);
  const [registerFields, setRegisterFields] = useState({
    name: "",
    email: "",
    location: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loginFields, setLoginFields] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [accountNotFound, setAccountNotFound] = useState(false);

  // Handle input changes
  const handleChange = (e, form) => {
    const { name, value } = e.target;
    if (form === "register") {
      setRegisterFields((prev) => ({ ...prev, [name]: value }));
    } else {
      setLoginFields((prev) => ({ ...prev, [name]: value }));
    }
    setError("");
    setSuccess("");
    setAccountNotFound(false); // Reset account not found state when user types
  };

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Registration submit
  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, location, phone, password, confirmPassword } = registerFields;
    
    if (!name || !email || !location || !phone || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (!/^[0-9]{10,}$/.test(phone)) {
      setError("Enter a valid phone number.");
      return;
    }
    
    try {
      // First, register the farmer
      const registerRes = await fetch(`${API_URL}/api/farmers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          farmAddress: location,
        }),
      });
      const registerData = await registerRes.json();
      if (!registerRes.ok) throw new Error(registerData.message || "Registration failed");
      
      // After successful registration, automatically log in
      const loginRes = await fetch(`${API_URL}/api/farmers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.message || "Auto-login failed");
      
      // Store JWT token and farmer data
      localStorage.setItem("token", loginData.token);
      localStorage.setItem("farmerData", JSON.stringify(loginData.farmer));
      
      setSuccess("Registration successful! You are now logged in.");
      setRegisterFields({
        name: "",
        email: "",
        location: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      
      // Redirect to farmer dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/farmer-dashboard';
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  // Login submit
  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginFields;
    
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/api/farmers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Check if it's an account not found error
        if (data.message && data.message.includes("Account not found")) {
          setError("Account not found! Please register now.");
          setAccountNotFound(true); // Set state to show registration link
          // Clear the form to encourage registration
          setLoginFields({ email: "", password: "" });
        } else {
          throw new Error(data.message || "Login failed");
        }
        return;
      }
      // Store JWT token (for example, in localStorage)
      localStorage.setItem("token", data.token);
      localStorage.setItem("farmerData", JSON.stringify(data.farmer));
      setSuccess("Login successful!");
      setLoginFields({ email: "", password: "" });
      
      // Redirect to farmer dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/farmer-dashboard';
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="farmer-auth-bg">
      <div className="form-card animate-card">
        <div className="avatar-circle">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="#e8f5e9" />
            <path d="M24 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm0 3c-4.418 0-13 2.238-13 6.667V39h26v-4.333C37 30.238 28.418 28 24 28z" fill="#4CAF50"/>
          </svg>
        </div>
        {!isLogin ? (
          <form onSubmit={handleRegister} autoComplete="off">
            <h2>Farmer Registration</h2>
            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={registerFields.name}
                onChange={(e) => handleChange(e, "register")}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={registerFields.email}
                onChange={(e) => handleChange(e, "register")}
                required
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={registerFields.location}
                onChange={(e) => handleChange(e, "register")}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={registerFields.phone}
                onChange={(e) => handleChange(e, "register")}
                pattern="[0-9]{10,}"
                maxLength={15}
                required
              />
            </div>
            <div className="form-group password-group">
              <label>Password</label>
              <input
                type={showRegPassword ? "text" : "password"}
                name="password"
                value={registerFields.password}
                onChange={(e) => handleChange(e, "register")}
                required
              />
              <span className="show-hide" onClick={() => setShowRegPassword((v) => !v)}>
                {showRegPassword ? "Hide" : "Show"}
              </span>
            </div>
            <div className="form-group password-group">
              <label>Confirm Password</label>
              <input
                type={showRegConfirm ? "text" : "password"}
                name="confirmPassword"
                value={registerFields.confirmPassword}
                onChange={(e) => handleChange(e, "register")}
                required
              />
              <span className="show-hide" onClick={() => setShowRegConfirm((v) => !v)}>
                {showRegConfirm ? "Hide" : "Show"}
              </span>
            </div>
            <button className="form-btn" type="submit">
              Register
            </button>
            <button
              type="button"
              className="toggle-link"
              onClick={() => {
                setIsLogin(true);
                setError("");
                setSuccess("");
              }}
            >
              Already have an account? <span className="toggle-link-bold">Login</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} autoComplete="off">
            <h2>Farmer Login</h2>
            <div className="subtitle">Welcome back! Please login with your registered email.</div>
            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={loginFields.email}
                onChange={(e) => handleChange(e, "login")}
                required
              />
            </div>
            <div className="form-group password-group">
              <label>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={loginFields.password}
                onChange={(e) => handleChange(e, "login")}
                required
              />
              <span className="show-hide" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>
            <button className="form-btn" type="submit">
              Login
            </button>
            <button
              type="button"
              className="toggle-link"
              onClick={() => {
                setIsLogin(false);
                setError("");
                setSuccess("");
                setAccountNotFound(false);
              }}
            >
              Don't have an account? <span className="toggle-link-bold">Register</span>
            </button>
            {accountNotFound && (
              <div className="text-center mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-800 text-sm mb-2">
                  <strong>Account not found!</strong> Please register to create your account.
                </p>
                <button
                  type="button"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                    setSuccess("");
                    setAccountNotFound(false);
                  }}
                >
                  Register Now
                </button>
              </div>
            )}

          </form>
        )}
      </div>
    </div>
  );
} 