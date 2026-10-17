import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/customer-login.css";

export default function CustomerLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim() || (!showResetForm && !password)) {
      setError("Please complete all required fields.");
      return;
    }

    if (showResetForm) {
      setResetSent(true);
      setError("");
      return;
    }

    navigate("/customer/dashboard");
  };

  return (
    <main className="customer-login-page">
      <div className="customer-login-layout">
        <section className="customer-login-visual">
          <Link to="/" className="customer-login-brand">
            <span className="customer-brand-mark">G</span>
            <span>GHAR TAK</span>
          </Link>

          <div className="customer-visual-content">
            <span className="customer-visual-tag">
              YOUR NEIGHBOURHOOD, DELIVERED
            </span>

            <h1>
              Your everyday
              <br />
              essentials,
              <br />
              <span>just a click away.</span>
            </h1>

            <p>
              Discover local shops, find your favourites,
              and get the things you need from the people
              right around you.
            </p>

            <div className="customer-benefits">
              <div>
                <span>✓</span>
                Trusted neighbourhood shops
              </div>

              <div>
                <span>✓</span>
                Convenient local shopping
              </div>

              <div>
                <span>✓</span>
                A simpler everyday experience
              </div>
            </div>
          </div>

          <div className="customer-visual-footer">
            MADE FOR YOUR NEIGHBOURHOOD
          </div>
        </section>

        <section className="customer-login-form-section">
          <div className="customer-login-form-card">
            <div className="customer-mobile-brand">
              <span className="customer-brand-mark">G</span>
              <strong>GHAR TAK</strong>
            </div>

            <div className="customer-form-heading">
              <span>{showResetForm ? "ACCOUNT SUPPORT" : "WELCOME BACK"}</span>
              <h2>{showResetForm ? "Reset your password" : "Login to your account"}</h2>
              <p>
                {showResetForm
                  ? "Enter your email and we’ll show a demo confirmation."
                  : "Enter your details to continue shopping locally."}
              </p>
            </div>

            {resetSent ? (
              <div className="customer-login-feedback" role="status">
                <strong>Reset request received</strong>
                <p>
                  In a live version, password reset instructions would be sent
                  to {email}.
                </p>
                <button
                  type="button"
                  className="customer-forgot-link"
                  onClick={() => {
                    setShowResetForm(false);
                    setResetSent(false);
                  }}
                >
                  Back to login
                </button>
              </div>
            ) : (
            <form
              className="customer-login-form"
              onSubmit={handleSubmit}
            >
              <div className="customer-input-group">
                <label htmlFor="customer-email">
                  Email address
                </label>

                <input
                  id="customer-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  autoComplete="email"
                  required
                />
              </div>

              {!showResetForm && (
                <div className="customer-input-group">
                  <div className="customer-password-heading">
                    <label htmlFor="customer-password">Password</label>
                    <button
                      type="button"
                      className="customer-forgot-link"
                      onClick={() => {
                        setShowResetForm(true);
                        setError("");
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="customer-password-wrapper">
                    <input
                      id="customer-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError("");
                      }}
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <p className="customer-login-error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="customer-login-button"
              >
                {showResetForm ? "Send reset instructions" : "Login to your account"} <span>→</span>
              </button>
            </form>
            )}

            {showResetForm && !resetSent && (
              <button
                type="button"
                className="customer-forgot-link customer-reset-back"
                onClick={() => {
                  setShowResetForm(false);
                  setError("");
                }}
              >
                ← Back to login
              </button>
            )}

            {!showResetForm && (
            <div className="customer-login-separator">
              <span>NEW TO GHAR TAK?</span>
            </div>
            )}

            {!showResetForm && (
              <Link
                to="/customer/register"
                className="customer-signup-button"
              >
                Create a customer account
              </Link>
            )}

            <p className="customer-login-terms">
              Demo customer sign-in only. No credentials are sent or verified.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}