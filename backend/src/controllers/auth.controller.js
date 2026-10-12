const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Shop = require("../models/Shop");
const User = require("../models/User");
const { generateOTP, hashOTP } = require("../utils/otp")
// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

// =========================
// REGISTER
// =========================

const register = async (req, res) => {
  try {
   const {
  name,
  email,
  phone,
  password,
  confirmPassword,
  role,
  shopName,
  shopAddress,
} = req.body;
    // Required fields
    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Validate role
    if (role && !["user", "shop_owner"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Check existing email
    const existingEmail = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Check existing phone
    const existingPhone = await User.findOne({ phone });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: role || "user",
    });

    if (user.role === "shop_owner") {
  if (!shopName || !shopAddress) {
    return res.status(400).json({
      success: false,
      message: "Shop name and shop address are required",
    });
  }

  await Shop.create({
    owner: user._id,
    shopName,
    phone: user.phone,
    address: shopAddress,
  });
}

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// =========================
// LOGIN
// =========================

const login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/phone and password are required",
      });
    }

    const user = await User.findOne({
      $or: [
        { email: emailOrPhone.toLowerCase() },
        { phone: emailOrPhone },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check account lock
    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(429).json({
        success: false,
        message: "Account temporarily locked. Try again later.",
      });
    }

    // Reset attempts if lock has expired
    if (user.lockUntil && user.lockUntil <= new Date()) {
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    // Wrong password
    if (!isPasswordCorrect) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }

      await user.save();

      if (user.loginAttempts >= 5) {
        return res.status(429).json({
          success: false,
          message: "Account temporarily locked. Try again later.",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Successful login: reset failed attempts
    user.loginAttempts = 0;
    user.lockUntil = null;

    await user.save();

    // Generate JWT
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

module.exports = {
  register,
  login,
};