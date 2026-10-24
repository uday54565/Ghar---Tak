const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["user", "shop_owner"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    loginAttempts: {
    type: Number,
    default: 0
},
lockUntil: {
    type: Date,
    default: null
},
emailOtpHash: { type: String, default: null },
emailOtpExpiresAt: { type: Date, default: null },
emailOtpAttempts: { type: Number, default: 0 },
emailOtpLastSentAt: { type: Date, default: null },

resetOtpHash: { type: String, default: null },
resetOtpExpiresAt: { type: Date, default: null },
resetOtpAttempts: { type: Number, default: 0 },
resetOtpLastSentAt: { type: Date, default: null },

resetOtpVerified: { type: Boolean, default: false },
resetOtpVerifiedUntil: { type: Date, default: null },

pendingShopName: { type: String, default: null },
pendingShopAddress: { type: String, default: null },

addresses: {
  type: [
    {
      label: { type: String, required: true, trim: true },
      details: { type: String, required: true, trim: true },
    },
  ],
  default: [],
},

wishlist: {
  type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  default: [],
},

notificationPreferences: {
  newOrders: { type: Boolean, default: true },
  orderUpdates: { type: Boolean, default: true },
},

resetTokenHash: {
  type: String,
  default: null
},
resetTokenExpiresAt: {
  type: Date,
  default: null
},
resetTokenLastSentAt: {
  type: Date,
  default: null
},

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);