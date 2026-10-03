import { useState } from "react";
import { Link } from "react-router-dom";
import "./ShopOwnerAuth.css";

function Register() {
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Register:", {
      role,
    });
  };

  return (
    <main className="auth-page">
      {/* Left Showcase */}
      <section className="auth-showcase">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-mark">G</span>
          <span>GHAR TAK</span>
        </Link>

        <div className="showcase-content">
          <span className="showcase-label">
            {role === "user" ? "FOR CUSTOMERS" : "FOR SHOP OWNERS"}
          </span>

          <h1>
            {role === "user"
              ? "Everything you need, delivered ghar tak."
              : "Take your shop online."}
          </h1>

          <p>
            {role === "user"
              ? "Discover local shops, order what you need and get it delivered to your doorstep."
              : "Reach more local customers and manage your shop from one simple platform."}
          </p>
        </div>
      </section>

      {/* Register Form */}
      <section className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-heading">
            <span className="mobile-auth-brand">GHAR TAK</span>

            <h2>Create your account</h2>

            <p>
              {role === "user"
                ? "Join GHAR TAK and start ordering locally."
                : "Register your shop and start serving local customers."}
            </p>
          </div>

          {/* Role Selection */}
          <div className="role-selector">
            <label>Choose account type</label>

            <div className="role-options">
              <button
                type="button"
                className={`role-card ${role === "user" ? "active" : ""}`}
                onClick={() => setRole("user")}
              >
                <span className="role-icon">👤</span>

                <span className="role-info">
                  <strong>Customer</strong>
                  <small>Order from local shops</small>
                </span>
              </button>

              <button
                type="button"
                className={`role-card ${
                  role === "shop_owner" ? "active" : ""
                }`}
                onClick={() => setRole("shop_owner")}
              >
                <span className="role-icon">🏪</span>

                <span className="role-info">
                  <strong>Shop Owner</strong>
                  <small>Sell to local customers</small>
                </span>
              </button>
            </div>
          </div>

          <form
            className="auth-form register-form"
            onSubmit={handleSubmit}
          >
            {/* Owner Name / Customer Name */}
            <div className="input-group">
              <label htmlFor="name">
                {role === "user" ? "Full Name" : "Owner Name"}
              </label>

              <div className="input-wrapper">
                <input
                  id="name"
                  type="text"
                  placeholder={
                    role === "user"
                      ? "Enter your name"
                      : "Enter owner name"
                  }
                  required
                />
              </div>
            </div>

            {/* Shop Name */}
            {role === "shop_owner" && (
              <div className="input-group">
                <label htmlFor="shopName">Shop Name</label>

                <div className="input-wrapper">
                  <input
                    id="shopName"
                    type="text"
                    placeholder="Enter shop name"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="input-group">
              <label htmlFor="email">Email Address</label>

              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="input-group">
              <label htmlFor="phone">Phone Number</label>

              <div className="input-wrapper phone-input">
                <span className="country-code">+91</span>

                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  maxLength="10"
                  required
                />
              </div>
            </div>

            {/* Shop Address */}
            {role === "shop_owner" && (
              <div className="input-group">
                <label htmlFor="address">Shop Address</label>

                <div className="input-wrapper">
                  <input
                    id="address"
                    type="text"
                    placeholder="Enter shop address"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="input-group">
              <label htmlFor="password">Password</label>

              <div className="input-wrapper password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="input-group">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="input-wrapper password-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit">
              Create {role === "user" ? "Account" : "Shop Account"}
              <span>→</span>
            </button>
          </form>

          <div className="auth-switch">
            Already have an account?
            <Link to="/login">Login</Link>
          </div>

          <Link to="/" className="back-home">
            ← Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Register;