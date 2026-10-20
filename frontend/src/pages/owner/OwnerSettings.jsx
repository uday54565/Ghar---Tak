import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OwnerSidebar from "../../components/owner/OwnerSidebar";
import OwnerHeader from "../../components/owner/OwnerHeader";
import "../../styles/owner-dashboard.css";
import { useAuth } from "../../context/useAuth";
import { authApi, getErrorMessage, userApi } from "../../services/api";

function OwnerSettings() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [notifications, setNotifications] = useState(
    user?.notificationPreferences || { newOrders: true, orderUpdates: true }
  );

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [saved, setSaved] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));

    setSaved(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswords((current) => ({
      ...current,
      [name]: value,
    }));

    setPasswordMessage("");
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await userApi.updateProfile({
        name: profile.name,
        phone: profile.phone,
      });
      updateUser(data.user);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();

    if (
      !passwords.current ||
      !passwords.newPassword ||
      !passwords.confirm
    ) {
      setPasswordMessage("Please fill in all password fields.");
      return;
    }

    if (passwords.newPassword.length < 6) {
      setPasswordMessage(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (passwords.newPassword !== passwords.confirm) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    try {
      const { data } = await authApi.updatePassword({
        currentPassword: passwords.current,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirm,
      });
      setPasswordMessage(data.message);
      setPasswords({ current: "", newPassword: "", confirm: "" });
    } catch (requestError) {
      setPasswordMessage(getErrorMessage(requestError));
    }
  };

  const toggleNotification = async (key) => {
    const nextPreferences = { ...notifications, [key]: !notifications[key] };
    try {
      const { data } = await userApi.updateProfile({
        notificationPreferences: nextPreferences,
      });
      setNotifications(data.user.notificationPreferences);
      updateUser(data.user);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <div className="owner-layout">
      <OwnerSidebar />

      <main className="owner-main">
        <OwnerHeader />

        <section className="owner-content">
          {error && <p className="register-error" role="alert">{error}</p>}
          <div className="panel-header">
            <div>
              <p className="panel-label">ACCOUNT SETTINGS</p>

              <h2>Settings</h2>

              <p className="panel-description">
                Manage your account, security and notification
                preferences.
              </p>
            </div>
          </div>

          <div className="settings-layout">
            {/* Profile */}

            <section className="dashboard-panel settings-panel">
              <div className="settings-panel-header">
                <div>
                  <h3>Account Information</h3>

                  <p>
                    Update the details associated with your owner
                    account.
                  </p>
                </div>
              </div>

              <form
                className="settings-form"
                onSubmit={saveProfile}
              >
                <div className="settings-avatar-row">
                  <div className="settings-avatar">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <strong>{profile.name}</strong>

                    <span>Shop Owner</span>
                  </div>
                </div>

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label htmlFor="ownerName">
                      Full name
                    </label>

                    <input
                      id="ownerName"
                      name="name"
                      type="text"
                      value={profile.name}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="settings-form-group">
                    <label htmlFor="ownerPhone">
                      Phone number
                    </label>

                    <input
                      id="ownerPhone"
                      name="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <div className="settings-form-group">
                  <label htmlFor="ownerEmail">
                    Email address
                  </label>

                  <input
                    id="ownerEmail"
                    name="email"
                    type="email"
                    value={profile.email}
                    readOnly
                  />
                </div>

                <div className="settings-form-actions">
                  {saved && (
                    <span className="settings-success">
                      ✓ Changes saved
                    </span>
                  )}

                  <button
                    type="submit"
                    className="primary-action-button"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </section>

            {/* Security */}

            <section className="dashboard-panel settings-panel">
              <div className="settings-panel-header">
                <div>
                  <h3>Security</h3>

                  <p>
                    Keep your account protected with a strong
                    password.
                  </p>
                </div>
              </div>

              <form
                className="settings-form"
                onSubmit={updatePassword}
              >
                <div className="settings-form-group">
                  <label htmlFor="currentPassword">
                    Current password
                  </label>

                  <input
                    id="currentPassword"
                    name="current"
                    type="password"
                    placeholder="Enter current password"
                    value={passwords.current}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label htmlFor="newPassword">
                      New password
                    </label>

                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div className="settings-form-group">
                    <label htmlFor="confirmPassword">
                      Confirm password
                    </label>

                    <input
                      id="confirmPassword"
                      name="confirm"
                      type="password"
                      placeholder="Repeat new password"
                      value={passwords.confirm}
                      onChange={handlePasswordChange}
                    />
                  </div>
                </div>

                {passwordMessage && (
                  <p
                    className={`settings-password-message ${
                      passwordMessage.includes("successfully")
                        ? "success"
                        : "error"
                    }`}
                  >
                    {passwordMessage}
                  </p>
                )}

                <div className="settings-form-actions">
                  <button
                    type="submit"
                    className="primary-action-button"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </section>

            {/* Notifications */}

            <section className="dashboard-panel settings-panel">
              <div className="settings-panel-header">
                <div>
                  <h3>Notifications</h3>

                  <p>
                    Choose which shop activity notifications you
                    want to receive.
                  </p>
                </div>
              </div>

              <div className="settings-options">
                <div className="settings-option">
                  <div>
                    <strong>New order notifications</strong>

                    <span>
                      Get notified whenever a customer places a
                      new order.
                    </span>
                  </div>

                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={notifications.newOrders}
                      onChange={() =>
                        toggleNotification("newOrders")
                      }
                    />

                    <span></span>
                  </label>
                </div>

                <div className="settings-option">
                  <div>
                    <strong>Order update notifications</strong>

                    <span>
                      Receive notifications when order status
                      changes.
                    </span>
                  </div>

                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={notifications.orderUpdates}
                      onChange={() =>
                        toggleNotification("orderUpdates")
                      }
                    />

                    <span></span>
                  </label>
                </div>
              </div>
            </section>

            {/* Danger Zone */}

            <section className="dashboard-panel settings-panel danger-zone">
              <div className="settings-panel-header">
                <div>
                  <h3>Danger Zone</h3>

                  <p>
                    Actions here can affect your account and shop
                    access.
                  </p>
                </div>
              </div>

              <div className="danger-action">
                <div>
                  <strong>Log out</strong>

                  <span>
                    Sign out of your current owner session.
                  </span>
                </div>

                <button
                  type="button"
                  className="danger-outline-button"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  Logout
                </button>
              </div>

            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

export default OwnerSettings;