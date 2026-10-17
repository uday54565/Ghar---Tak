const express = require("express");

const {
  protect,
  authorize,
} = require("../middleware/auth.middleware");

const router = express.Router();

// Any logged-in user
router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Profile accessed successfully",
    user: req.user,
  });
});

// Only customers
router.get("/customer-only", protect, authorize("user"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Customer-only route accessed",
    user: req.user,
  });
});

// Only shop owners
router.get(
  "/shop-owner-only",
  protect,
  authorize("shop_owner"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Shop owner route accessed",
      user: req.user,
    });
  }
);

module.exports = router;