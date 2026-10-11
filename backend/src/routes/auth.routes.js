const express = require("express");

const {generalLimiter  , loginLimiter , registerLimiter , otpSendLimiter} = require("../middleware/rateLimiter")

const {
  register,
  login,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register",  registerLimiter,register);
router.post("/login", loginLimiter ,login);

module.exports = router;