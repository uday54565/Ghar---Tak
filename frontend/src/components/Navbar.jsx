import { Link } from "react-router-dom";function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar-inner">

        {/* Logo */}
        <a href="#home" className="brand" aria-label="Ghar Tak home">
          <span className="brand-mark">G</span>
          <span>GHAR TAK</span>
        </a>

        {/* Navigation */}
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#categories">Categories</a>
          <a href="#contact">Contact</a>
        </nav>

        {/* Actions */}
        <div className="nav-actions">
          <Link to="/login" className="login-link">
  Login
</Link>

<Link to="/register" className="nav-cta">
  Get Started
</Link>
        </div>

      </div>
    </header>
  );
}

export default Navbar;