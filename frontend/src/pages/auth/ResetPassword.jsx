
import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import "../../styles/customer-login.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Reset link is missing its token. Please request a new link.");
      return;
    }

    if (password.length < 8 || password.length > 15) {
      setError("Password must be between 8 and 15 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            newPassword: password,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to reset password.");
        return;
      }

      setMessage("Password reset successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/customer/login");
      }, 1500);
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
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
            <span className="customer-visual-tag">ACCOUNT SECURITY</span>
            <h1>
              A fresh start,
              <br />
              <span>one password away.</span>
            </h1>
            <p>
              Create a new password to secure your GHAR TAK account
              and get back to shopping locally.
            </p>
            <div className="customer-benefits">
              <div><span>✓</span>Secure password reset</div>
              <div><span>✓</span>Protected account access</div>
              <div><span>✓</span>Back to local shopping</div>
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
              <span>RESET PASSWORD</span>
              <h2>Create a new password</h2>
              <p>
                Choose a new password for your account.
              </p>
            </div>

            {!token ? (
              <div className="customer-login-error" role="alert">
                This reset link is invalid or incomplete. Please request
                a new password reset link.
                <p>
                  <Link to="/customer/forgot-password">
                    Request a new link
                  </Link>
                </p>
              </div>
            ) : (
              <form
                className="customer-login-form"
                onSubmit={handleSubmit}
              >
                <div className="customer-input-group">
                  <label htmlFor="new-password">New password</label>
                  <div className="customer-password-wrapper">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={15}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="customer-input-group">
                  <label htmlFor="confirm-password">Confirm password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={15}
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
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"} <span>→</span>
                </button>
              </form>
            )}

            <div className="forgot-password-back">
              <Link to="/customer/login">← Back to Login</Link>
            </div>

            <p className="customer-login-terms">
              Never share your password or reset link with anyone.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
