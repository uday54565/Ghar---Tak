import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ShopOwnerAuth.css";
import { authApi, getErrorMessage } from "../../services/api";

const PENDING_EMAIL_KEY = "ghartak-pending-verification-email";
const PENDING_ROLE_KEY = "ghartak-pending-verification-role";

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState(
    () => localStorage.getItem(PENDING_ROLE_KEY) || "user"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(
    () => localStorage.getItem(PENDING_EMAIL_KEY) || ""
  );
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const [otp, setOtp] = useState("");
const [otpGenerated, setOtpGenerated] = useState(
  () => Boolean(localStorage.getItem(PENDING_EMAIL_KEY))
);
const [otpVerified, setOtpVerified] = useState(false);
const [otpMessage, setOtpMessage] = useState("");
const [loading, setLoading] = useState(false);

const editPendingRegistration = () => {
  localStorage.removeItem(PENDING_EMAIL_KEY);
  localStorage.removeItem(PENDING_ROLE_KEY);
  setOtpGenerated(false);
  setOtpVerified(false);
  setOtp("");
  setOtpMessage("");
  setError("");
};

const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Your passwords do not match. Please check and try again.");
      return;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        confirmPassword,
        role,
        ...(role === "shop_owner"
          ? { shopName: shopName.trim(), shopAddress: shopAddress.trim() }
          : {}),
      });
      setOtpGenerated(true);
      localStorage.setItem(PENDING_EMAIL_KEY, email.trim().toLowerCase());
      localStorage.setItem(PENDING_ROLE_KEY, role);
      setOtpVerified(false);
      setOtp("");
      setOtpMessage(data.message || "Verification code sent to your email.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    setOtpMessage("");
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit verification code sent to your email.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.verifyEmail({
        email: email.trim().toLowerCase(),
        otp,
      });
      setOtpVerified(true);
      setOtpMessage(data.message || "Email verified. You can now log in.");
      localStorage.removeItem(PENDING_EMAIL_KEY);
      localStorage.removeItem(PENDING_ROLE_KEY);
      window.setTimeout(
        () => navigate(role === "shop_owner" ? "/owner/login" : "/customer/login"),
        1200
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await authApi.resendEmail({
        email: email.trim().toLowerCase(),
      });
      setOtp("");
      setOtpMessage(data.message);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
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
                disabled={otpGenerated}
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
                disabled={otpGenerated}
              >
                <span className="role-icon">🏪</span>

                <span className="role-info">
                  <strong>Shop Owner</strong>
                  <small>Sell to local customers</small>
                </span>
              </button>
            </div>
          </div>

          {otpGenerated && (
            <div className="pending-registration">
              <p>
                A registration for <strong>{email}</strong> is waiting for email
                verification.
              </p>
              <button
                type="button"
                onClick={editPendingRegistration}
              >
                Edit email or account type
              </button>
            </div>
          )}

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
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError("");
                  }}
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
                    value={shopName}
                    onChange={(event) => setShopName(event.target.value)}
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
                  value={email}
                  readOnly={otpGenerated}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
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
      pattern="[0-9]{10}"
      value={phone}
      readOnly={otpGenerated}
      required
      onChange={(event) => {
        setPhone(event.target.value.replace(/\D/g, "").slice(0, 10));
        setOtpGenerated(false);
        setOtpVerified(false);
        setOtp("");
        setOtpMessage("");
      }}
    />
  </div>
</div>

{otpGenerated && (
<div className="input-group otp-section">
  <label htmlFor="register-otp">Email verification code</label>
  {otpGenerated && (
    <>
      <div className="input-wrapper otp-input-wrapper">
        <input
          id="register-otp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
            setOtpVerified(false);
          }}
          aria-label="Enter OTP"
        />
      </div>

      <button
        type="button"
        className="otp-verify-btn"
        onClick={verifyOtp}
        disabled={loading || otpVerified}
      >
        {loading ? "Verifying..." : otpVerified ? "Verified" : "Verify code"}
      </button>
      <button
        type="button"
        className="otp-verify-btn"
        onClick={resendOtp}
        disabled={loading || otpVerified}
      >
        Resend verification code
      </button>

      <p className="otp-message" role="status">
        {otpMessage}
      </p>
    </>
  )}
</div>
)}

            {/* Shop Address */}
            {role === "shop_owner" && (
              <div className="input-group">
                <label htmlFor="address">Shop Address</label>

                <div className="input-wrapper">
                  <input
                    id="address"
                    type="text"
                    placeholder="Enter shop address"
                    value={shopAddress}
                    onChange={(event) => setShopAddress(event.target.value)}
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
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
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
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError("");
                  }}
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

            {error && <p className="register-error" role="alert">{error}</p>}

            <button type="submit" className="auth-submit" disabled={loading || otpVerified || otpGenerated}>
              {loading
                ? "Sending..."
                : otpGenerated
                  ? "Verification code sent"
                  : `Create ${role === "user" ? "Account" : "Shop Account"}`}
              <span>→</span>
            </button>
          </form>

          <div className="auth-switch">
            Already have an account?
            <Link to={role === "user" ? "/customer/login" : "/owner/login"}>
              Login
            </Link>
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