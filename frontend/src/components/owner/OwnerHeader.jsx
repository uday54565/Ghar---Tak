export default function OwnerHeader() {
  return (
    <header className="owner-header">
      <div>
        <p className="owner-header-label">SHOP OWNER</p>
        <h1>Good morning, Shop Owner 👋</h1>
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
          <div className="owner-avatar">SO</div>

          <div className="owner-profile-info">
            <strong>Shop Owner</strong>
            <span>Owner</span>
          </div>

          <span className="profile-arrow">⌄</span>
        </div>
      </div>
    </header>
  );
}