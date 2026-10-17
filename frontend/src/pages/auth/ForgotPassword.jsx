import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/customer-login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

const handleSubmit = async (event) => {
  event.preventDefault();

  setMessage("");
  setError("");

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    setError("Please enter your registered email address.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/forgot-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      setError(data.message || "Unable to process your request.");
      return;
    }

    setMessage(
      data.message ||
        "If an account exists with this email, a reset link will be sent."
    );
  } catch (error) {
    setError("Unable to connect to the server. Please try again.");
  }
};


  return (
    <main className="customer-login-page">
      <div className="customer-login-layout">
        {/* Left showcase */}
        <section className="customer-login-visual">
          <Link to="/" className="customer-login-brand">
            <span className="customer-brand-mark">G</span>
            <span>GHAR TAK</span>
          </Link>

          <div className="customer-visual-content">
            <span className="customer-visual-tag">
              ACCOUNT RECOVERY
            </span>

            <h1>
              Let's get you
              <br />
              <span>back on track.</span>
            </h1>

            <p>
              Forgot your password? Don't worry.
              Recover access to your GHAR TAK account
              with a secure password reset process.
            </p>

            <div className="customer-benefits">
              <div>
                <span>✓</span>
                Simple account recovery
              </div>

              <div>
                <span>✓</span>
                Secure password reset
              </div>

              <div>
                <span>✓</span>
                Back to local shopping
              </div>
            </div>
          </div>

          <div className="customer-visual-footer">
            MADE FOR YOUR NEIGHBOURHOOD
          </div>
        </section>

        {/* Forgot password form */}
        <section className="customer-login-form-section">
          <div className="customer-login-form-card">
            <div className="customer-mobile-brand">
              <span className="customer-brand-mark">G</span>
              <strong>GHAR TAK</strong>
            </div>

            <div className="customer-form-heading">
              <span>ACCOUNT RECOVERY</span>

              <h2>Forgot your password?</h2>

              <p>
                Enter the email address associated with
                your account to begin the reset process.
              </p>
            </div>

            <form
              className="customer-login-form"
              onSubmit={handleSubmit}
            >
              <div className="customer-input-group">
                <label htmlFor="reset-email">
                  Email address
                </label>

                <input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setMessage("");
                    setError("");
                  }}
                  autoComplete="email"
                  required
                />
              </div>

              {error && (
                <p className="customer-login-error" role="alert">
                  {error}
                </p>
              )}

              {message && (
                <p className="forgot-password-message" role="status">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="customer-login-button"
              >
                Send Reset Link <span>→</span>
              </button>
            </form>

            <div className="forgot-password-back">
              <Link to="/login">
                ← Back to Login
              </Link>
            </div>

            <p className="customer-login-terms">
              Keep your account secure. Never share your
              password or password reset link with anyone.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}