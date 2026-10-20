import { useAuth } from "../../context/useAuth";

export default function OwnerHeader() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "Owner";
  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "OW";

  return (
    <header className="owner-header">
      <div>
        <p className="owner-header-label">SHOP OWNER</p>
        <h1>Welcome, {firstName} 👋</h1>
      </div>

      <div className="owner-header-actions">
        <button className="owner-icon-button" aria-label="Search">
          ⌕
        </button>

        <button className="owner-icon-button notification-button" aria-label="Notifications">
          ♢
          <span className="notification-dot" />
        </button>

        <div className="owner-profile">
          <div className="owner-avatar">{initials}</div>

          <div className="owner-profile-info">
            <strong>{user?.name || "Shop Owner"}</strong>
            <span>Owner</span>
          </div>

          <span className="profile-arrow">⌄</span>
        </div>
      </div>
    </header>
  );
}