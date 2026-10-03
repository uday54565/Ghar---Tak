import { useState } from "react";
import { Link } from "react-router-dom";
import "./ShopOwnerAuth.css";

function ShopOwnerLogin() {
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Login:", {
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
              ? "Welcome back to GHAR TAK."
              : "Welcome back to your shop."}
          </h1>

          <p>
            {role === "user"
              ? "Find your favourite local shops and get what you need delivered to your doorstep."
              : "Manage your shop, products and orders from one simple place."}
          </p>
        </div>
      </section>

      {/* Login Form */}
      <section className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-heading">
            <span className="mobile-auth-brand">GHAR TAK</span>

            <h2>Welcome back</h2>

            <p>
              Sign in to your{" "}
              {role === "user" ? "GHAR TAK account" : "shop account"}.
            </p>
          </div>

          {/* Role Selection */}
          <div className="role-selector">
            <label>Login as</label>

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
                  <small>Manage your shop</small>
                </span>
              </button>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Email / Phone */}
            <div className="input-group">
              <label htmlFor="loginEmail">
                Email or Phone Number
              </label>

              <div className="input-wrapper">
                <input
                  id="loginEmail"
                  type="text"
                  placeholder="Enter email or phone number"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="input-group">
              <div className="password-label-row">
                <label htmlFor="loginPassword">Password</label>

                <Link to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <div className="input-wrapper password-wrapper">
                <input
                  id="loginPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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

            <button type="submit" className="auth-submit">
              Login
              <span>→</span>
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account?
            <Link to="/register">Create account</Link>
          </div>

          <Link to="/" className="back-home">
            ← Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default ShopOwnerLogin;