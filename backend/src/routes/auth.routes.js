const express = require("express");

const { loginLimiter, registerLimiter, otpSendLimiter } = require("../middleware/rateLimiter");

const {
  register,
  login,
  verifyEmailOtp,
  resendEmailOtp,
  forgotPassworrd,
  resetPassword,
  updatePassword
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", registerLimiter, register);

router.post("/login", loginLimiter, login);


router.post("/verify-email-otp", verifyEmailOtp);
router.post("/resend-email-otp", otpSendLimiter, resendEmailOtp);
router.post("/forgot-password", otpSendLimiter, forgotPassworrd);

router.post("/reset-password", resetPassword);
router.patch("/password", protect, updatePassword);


module.exports = router;