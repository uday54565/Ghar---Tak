function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand footer-brand">
            <span className="brand-mark">G</span>
            <span>GHAR TAK</span>
          </div>

          <p className="footer-description">
            Your local shops, products and essentials — delivered to your
            doorstep.
          </p>
        </div>

        <div className="footer-column">
          <h4>Platform</h4>
          <a href="#how-it-works">How it works</a>
          <a href="#categories">Categories</a>
          <a href="#shop-owner">For shop owners</a>
        </div>

        <div className="footer-column">
          <h4>Company</h4>
          <a href="#about">About us</a>
          <a href="#contact">Contact</a>
          <a href="#privacy">Privacy</a>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 GHAR TAK. All rights reserved.</span>
        <span>Built by CODLUME Digital</span>
      </div>
    </footer>
  );
}

export default Footer;