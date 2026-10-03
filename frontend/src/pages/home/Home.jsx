import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

function Home() {
  return (
    <>
      <Navbar />

      <main>
        {/* =====================================================
            HERO
        ===================================================== */}
        <section className="hero" id="home">
          <div className="container hero-grid">

            {/* LEFT CONTENT */}
            <div className="hero-content">

              <div className="hero-badge">
                <span>●</span>
                Support Local
                <b>•</b>
                Shop Local
                <b>•</b>
                Grow Local
              </div>

              <h1>
                Everything You Need,
                <span> From Local Shops.</span>
              </h1>

              <p>
                Discover local shops, order what you need, and get it
                delivered right to your doorstep.
              </p>

              <div className="hero-actions">

                {/* Same-page section navigation */}
                <a href="#categories" className="primary-button">
                  Explore Shops
                  <span>→</span>
                </a>

                {/* Shop owner registration */}
                <Link to="/register" className="secondary-button">
                  Join as a Shop
                </Link>

              </div>

              {/* TRUST POINTS */}
              <div className="hero-benefits">

                <div className="benefit">
                  <div className="benefit-icon">✓</div>

                  <div>
                    <strong>Fast Delivery</strong>
                    <span>At your doorstep</span>
                  </div>
                </div>

                <div className="benefit">
                  <div className="benefit-icon">✓</div>

                  <div>
                    <strong>Verified Shops</strong>
                    <span>Trusted & local</span>
                  </div>
                </div>

                <div className="benefit">
                  <div className="benefit-icon">✓</div>

                  <div>
                    <strong>Easy Ordering</strong>
                    <span>Simple & secure</span>
                  </div>
                </div>

              </div>
            </div>

            {/* =================================================
                RIGHT HERO VISUAL
            ================================================= */}
            <div className="hero-visual">

              <div className="hero-glow"></div>

              {/* PHONE */}
              <div className="phone">

                <div className="phone-top">
                  <span>9:41</span>
                  <span>● ● ●</span>
                </div>

                <div className="phone-brand">
                  <span className="mini-logo">G</span>
                  <strong>GHAR TAK</strong>
                </div>

                <div className="phone-search">
                  🔍&nbsp; Search for shops, products...
                </div>

                {/* PHONE BANNER */}
                <div className="phone-banner">

                  <div>
                    <small>Fresh from local shops</small>

                    <strong>
                      Everything you need.
                    </strong>

                    <button>
                      Order Now
                    </button>
                  </div>

                  <div className="banner-circle">
                    🛍️
                  </div>

                </div>

                {/* CATEGORIES TITLE */}
                <div className="phone-title">
                  <strong>Categories</strong>
                  <span>View all</span>
                </div>

                {/* MINI CATEGORIES */}
                <div className="mini-categories">

                  <div>
                    <span>🍔</span>
                    <small>Food</small>
                  </div>

                  <div>
                    <span>🛒</span>
                    <small>Grocery</small>
                  </div>

                  <div>
                    <span>🥐</span>
                    <small>Bakery</small>
                  </div>

                  <div>
                    <span>•••</span>
                    <small>More</small>
                  </div>

                </div>

                {/* SHOPS TITLE */}
                <div className="phone-title">
                  <strong>Popular Shops</strong>
                  <span>View all</span>
                </div>

                {/* SHOP CARD */}
                <div className="shop-mini-card">

                  <div className="shop-mini-image">
                    🏪
                  </div>

                  <div>
                    <strong>Sharma General Store</strong>
                    <small>Groceries & Daily Needs</small>
                  </div>

                </div>

                <div className="shop-mini-card">

                  <div className="shop-mini-image">
                    🍔
                  </div>

                  <div>
                    <strong>The Food Hub</strong>
                    <small>Food & Beverages</small>
                  </div>

                </div>

                {/* PHONE BOTTOM NAV */}
                <div className="phone-nav">
                  <span>⌂</span>
                  <span>▣</span>
                  <span>🛒</span>
                  <span>●</span>
                </div>

              </div>

              {/* FLOATING ORDER CARD */}
              <div className="floating-delivery">

                <span>✓</span>

                <div>
                  <strong>Order on the way</strong>
                  <small>Coming to your doorstep</small>
                </div>

              </div>

              {/* FLOATING DELIVERY CARD */}
              <div className="delivery-person">

                <div className="person-circle">
                  G
                </div>

                <div>
                  <strong>Ghar Tak</strong>
                  <span>Delivered locally</span>
                </div>

              </div>

            </div>
          </div>
        </section>


        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}
        <section
          className="section section-soft"
          id="how-it-works"
        >
          <div className="container">

            <div className="center-heading">

              <span className="eyebrow">
                SIMPLE STEPS
              </span>

              <h2>
                How It Works
              </h2>

              <p>
                Get what you need from local shops in just a few
                simple steps.
              </p>

            </div>

            <div className="steps-grid">

              <div className="step">
                <span className="step-number">
                  01
                </span>

                <h3>
                  Find a Shop
                </h3>

                <p>
                  Browse local shops and discover the products
                  you need.
                </p>
              </div>

              <div className="step">
                <span className="step-number">
                  02
                </span>

                <h3>
                  Place Your Order
                </h3>

                <p>
                  Add your products to the cart and place your
                  order easily.
                </p>
              </div>

              <div className="step">
                <span className="step-number">
                  03
                </span>

                <h3>
                  Get Delivered
                </h3>

                <p>
                  Your order is prepared and delivered right to
                  your doorstep.
                </p>
              </div>

            </div>
          </div>
        </section>


        {/* =====================================================
            CATEGORIES
        ===================================================== */}
        <section
          className="section"
          id="categories"
        >
          <div className="container">

            <div className="section-heading">

              <div>
                <span className="eyebrow">
                  POPULAR CATEGORIES
                </span>

                <h2>
                  Shop by Category
                </h2>
              </div>

              <p>
                From everyday essentials to your favorite treats,
                discover products from local shops.
              </p>

            </div>

            <div className="category-grid">

              <div className="category-card">
                <span>🍔</span>
                <h3>Food & Beverages</h3>
                <p>Fresh & tasty</p>
              </div>

              <div className="category-card">
                <span>🛒</span>
                <h3>Grocery</h3>
                <p>Daily essentials</p>
              </div>

              <div className="category-card">
                <span>🥐</span>
                <h3>Bakery</h3>
                <p>Freshly baked</p>
              </div>

              <div className="category-card">
                <span>🍟</span>
                <h3>Snacks</h3>
                <p>Quick bites</p>
              </div>

              <div className="category-card">
                <span>📱</span>
                <h3>Electronics</h3>
                <p>Smart choices</p>
              </div>

            </div>
          </div>
        </section>


        {/* =====================================================
            SHOP OWNER CTA
        ===================================================== */}
        <section
          className="section"
          id="shop-owner"
        >
          <div className="container">

            <div className="owner-banner">

              <div>

                <span className="eyebrow">
                  FOR LOCAL BUSINESSES
                </span>

                <h2>
                  Grow Your Business with GHAR TAK
                </h2>

                <p>
                  Reach more customers, manage your orders easily,
                  and take your local shop online.
                </p>

              </div>

              {/* Register as shop owner */}
              <Link
                to="/register"
                className="primary-button"
              >
                Become a Seller
                <span>→</span>
              </Link>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}

export default Home;