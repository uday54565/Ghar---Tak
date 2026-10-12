import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/customer-login.css";

export default function CustomerLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
  event.preventDefault();

  if (!email.trim() || !password) {
    setError("Please enter your email and password.");
    return;
  }

  // Temporary UI testing only — does not authenticate credentials.
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
              <span>WELCOME BACK</span>
              <h2>Login to your account</h2>
              <p>
                Enter your details to continue shopping locally.
              </p>
            </div>

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

              <div className="customer-input-group">
                <div className="customer-password-heading">
                  <label htmlFor="customer-password">
                    Password
                  </label>

                  <Link to="/forgot-password">
                    Forgot password?
                  </Link>
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

              {error && (
                <p className="customer-login-error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="customer-login-button"
              >
                Login to your account <span>→</span>
              </button>
            </form>

            <div className="customer-login-separator">
              <span>NEW TO GHAR TAK?</span>
            </div>

            <Link
              to="/customer/register"
              className="customer-signup-button"
            >
              Create a customer account
            </Link>

            <p className="customer-login-terms">
              By continuing, you agree to our applicable terms
              and privacy policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}