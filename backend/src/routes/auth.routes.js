const express = require("express");

const {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  otpSendLimiter,
} = require("../middleware/rateLimiter");

const {
  register,
  login,
  verifyEmailOtp,
  forgotPassworrd,
  resetPassword,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/verify-email-otp", verifyEmailOtp);
// router.post("/forgot-password", otpSendLimiter, forgotPassworrd);
router.post("/forgot-password", forgotPassworrd);

router.post("/reset-password", resetPassword);

module.exports = router;
