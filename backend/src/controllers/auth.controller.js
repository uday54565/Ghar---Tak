const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto")

const Shop = require("../models/Shop");
const User = require("../models/User");
const { generateOTP, hashOTP } = require("../utils/otp");
const { sendEmail} = require("../services/email.service")
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

    if (role === "shop_owner" && (!shopName?.trim() || !shopAddress?.trim())) {
      return res.status(400).json({
        success: false,
        message: "Shop name and shop address are required for shop owner registration",
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: "Enter a valid email address" });
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, message: "Enter a valid 10-digit phone number" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
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

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();
    const existingEmail = await User.findOne({ email: normalizedEmail });
    const existingPhone = await User.findOne({ phone: normalizedPhone });

    if (existingEmail?.isVerified) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    if (existingPhone?.isVerified) {
      return res.status(409).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    if (
      existingEmail &&
      existingPhone &&
      !existingEmail._id.equals(existingPhone._id)
    ) {
      return res.status(409).json({
        success: false,
        message: "Email and phone number are associated with different registrations",
      });
    }

    const pendingRegistration = existingEmail || existingPhone;

    if (pendingRegistration) {
      const otp = generateOTP();
      const hashedPassword = await bcrypt.hash(password, 12);

      try {
        await sendEmail({
          to: normalizedEmail,
          subject: "GHAR TAK - Email Verification OTP",
          text: `Your GHAR TAK verification OTP is ${otp}. It expires in 5 minutes. Do not share this OTP with anyone.`,
          html: `
            <h2>GHAR TAK Email Verification</h2>
            <p>Your verification OTP is:</p>
            <h1>${otp}</h1>
            <p>This OTP expires in 5 minutes.</p>
            <p>Do not share this code with anyone.</p>
          `,
        });
      } catch (emailError) {
        console.error("OTP email sending failed:", emailError);
        return res.status(502).json({
          success: false,
          message: "Could not send verification email. Please try again.",
        });
      }

      pendingRegistration.name = name.trim();
      pendingRegistration.email = normalizedEmail;
      pendingRegistration.phone = normalizedPhone;
      pendingRegistration.password = hashedPassword;
      pendingRegistration.role = role || "user";
      pendingRegistration.pendingShopName =
        role === "shop_owner" ? shopName.trim() : null;
      pendingRegistration.pendingShopAddress =
        role === "shop_owner" ? shopAddress.trim() : null;
      pendingRegistration.emailOtpHash = hashOTP(otp);
      pendingRegistration.emailOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
      pendingRegistration.emailOtpAttempts = 0;
      pendingRegistration.emailOtpLastSentAt = new Date();
      await pendingRegistration.save();

      return res.status(200).json({
        success: true,
        message: "Updated pending registration. A new OTP was sent to your email.",
        email: normalizedEmail,
      });
    }

    // Hash password


    // Generate email OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create unverified user and save OTP
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      role: role || "user",
      isVerified: false,

      emailOtpHash: otpHash,
      emailOtpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      emailOtpAttempts: 0,
      emailOtpLastSentAt: new Date(),

      pendingShopName: role === "shop_owner" ? shopName : null,
      pendingShopAddress: role === "shop_owner" ? shopAddress : null,
    });

    // Send OTP to the registered email
    try {
      await sendEmail({
        to: user.email,
        subject: "GHAR TAK - Email Verification OTP",
        text: `Your GHAR TAK verification OTP is ${otp}. It expires in 5 minutes. Do not share this OTP with anyone.`,
        html: `
          <h2>GHAR TAK Email Verification</h2>
          <p>Your verification OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP expires in 5 minutes.</p>
          <p>Do not share this code with anyone.</p>
        `,
      });
    } catch (emailError) {
      console.error("OTP email sending failed:", emailError);

      await User.deleteOne({ _id: user._id });

      return res.status(502).json({
        success: false,
        message: "Could not send verification email. Please try again.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email. Please verify your email.",
      email: user.email,
    });

  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};



const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Registration not found",
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: "Email already verified",
      });
    }

    if (
      !user.emailOtpHash ||
      !user.emailOtpExpiresAt ||
      user.emailOtpExpiresAt <= new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please register again.",
      });
    }

    if ((user.emailOtpAttempts || 0) >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect OTP attempts.",
      });
    }

    if (hashOTP(String(otp)) !== user.emailOtpHash) {
      user.emailOtpAttempts = (user.emailOtpAttempts || 0) + 1;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.isVerified = true;
    user.emailOtpHash = null;
    user.emailOtpExpiresAt = null;
    user.emailOtpAttempts = 0;
    user.emailOtpLastSentAt = null;

    await user.save();

    if (user.role === "shop_owner" && user.pendingShopName) {
      await Shop.create({
        owner: user._id,
        shopName: user.pendingShopName,
        phone: user.phone,
        address: user.pendingShopAddress,
      });

      user.pendingShopName = null;
      user.pendingShopAddress = null;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Email verified and registration completed",
    });
  } catch (error) {
    console.error("Verify email OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during email verification",
    });
  }
};

const resendEmailOtp = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }
    if (user.isVerified) {
      return res.status(200).json({ success: true, message: "Email is already verified" });
    }
    if (
      user.emailOtpLastSentAt &&
      Date.now() - user.emailOtpLastSentAt.getTime() < 60 * 1000
    ) {
      return res.status(429).json({
        success: false,
        message: "Please wait one minute before requesting another verification code",
      });
    }

    const otp = generateOTP();
    user.emailOtpHash = hashOTP(otp);
    user.emailOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    user.emailOtpAttempts = 0;
    user.emailOtpLastSentAt = new Date();
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: "GHAR TAK - Email Verification OTP",
        text: `Your GHAR TAK verification OTP is ${otp}. It expires in 5 minutes. Do not share it.`,
        html: `<h2>GHAR TAK Email Verification</h2><p>Your verification OTP is:</p><h1>${otp}</h1><p>This code expires in 5 minutes.</p>`,
      });
    } catch (emailError) {
      console.error("Verification OTP resend failed:", emailError);
      user.emailOtpHash = null;
      user.emailOtpExpiresAt = null;
      user.emailOtpLastSentAt = null;
      await user.save();
      return res.status(502).json({
        success: false,
        message: "Could not send verification email. Please try again.",
      });
    }

    return res.status(200).json({ success: true, message: "A new verification code was sent" });
  } catch (error) {
    console.error("Resend verification OTP error:", error);
    return res.status(500).json({ success: false, message: "Unable to resend verification code" });
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

    // if (user.isVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Please verify your email before logging in",
    //   });
    // }

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

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const forgotPassworrd  =  async (req,res) => {

  try{

const email = req.body.email?.trim().toLowerCase();

  if(!email){
      return res.status(400).json({

        success : false,
        message : "Email is required"
      })
    }

   const user = await User.findOne({
  $expr: {
    $eq: [
      { $toLower: { $trim: { input: "$email" } } },
      email
    ]
  }
});
     const responseMessage =
      "If an account exists with this email, a reset link will be sent.";


    if (!user) {
      return res.status(200).json({ success: true, message: responseMessage });
    }

    const cooldownMs = 60 * 1000;

    if (
      user.resetTokenLastSentAt &&
      Date.now() - user.resetTokenLastSentAt.getTime() < cooldownMs
    ) {
      return res.status(200).json({
        success: true,
        message: responseMessage,
      });
    }

    // Generate a cryptographically secure, single-use token.
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetTokenHash = tokenHash;
    user.resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    user.resetTokenLastSentAt = new Date();

    await user.save();

    const resetLink =
      `${FRONTEND_URL}/reset-password?token=${rawToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "GHAR TAK - Reset Your Password",
        text: `Use this link to reset your password. It expires in 15 minutes: ${resetLink}\nIf you did not request this, ignore this email.`,
        html: `
          <h2>GHAR TAK Password Reset</h2>
          <p>Click below to choose a new password.</p>
          <p>
            <a href="${resetLink}"
               style="display:inline-block;padding:12px 18px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">
              Reset Password
            </a>
          </p>
          <p>This link expires in 15 minutes and can only be used once.</p>
          <p>If you did not request this, ignore this email.</p>
        `,
      });
    } catch (emailError) {
      console.error("Password reset email failed:", emailError);

      user.resetTokenHash = null;
      user.resetTokenExpiresAt = null;
      user.resetTokenLastSentAt = null;
      await user.save();

      return res.status(502).json({
        success: false,
        message: "Could not send reset email. Please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: responseMessage,
    });
  }
  catch(error){
    return res.status(500).json({
      success : false,
      message : error.message
    });

  }
}

const resetPassword = async ( req , res) => {

  try {
    const { token , newPassword  ,  confirmPassword  } = req.body

  if( !token || !newPassword || !confirmPassword)
  {

    return res.status(400).json({

      success : false,
      message : false
    });
  }


  if( newPassword !== confirmPassword){
    return res.status(400).json({

      success : false,
      message : "Passwords do not match"
    });

  }

  if( newPassword.length< 8 || newPassword.length > 15){
    return res.status(400).json({

      success : false,
      message : "Password must be between 8 and 15 characters",
    });
  }

   const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

  const user = await User.findOne({

     resetTokenHash: tokenHash,
      resetTokenExpiresAt: { $gt: new Date() },

  });

  if( !user){
    return res.status(400).json({

      success : false,
      message: "Reset link is invalid or expired. Request a new one.",
    });
  }

   user.password = await bcrypt.hash(newPassword, 12);

    // Invalidate the link immediately after successful use.
    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;
    user.resetTokenLastSentAt = null;

    // Clear login lockout state after password reset.
    user.loginAttempts = 0;
    user.lockUntil = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful. Please log in.",
    });

  }
  catch ( error) {

     console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while resetting password",
    });

  }
}

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password, new password, and confirmation are required",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    return res.status(500).json({ success: false, message: "Unable to update password" });
  }
};

module.exports = {
  register,
  login,
  verifyEmailOtp,
  resendEmailOtp,
  resetPassword,
  forgotPassworrd,
  updatePassword,
};