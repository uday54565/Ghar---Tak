const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    shopName: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Shop phone is required"],
      trim: true,
    },

    address: {
      type: String,
      required: [true, "Shop address is required"],
      trim: true,
    },

    category: {
      type: String,
      trim: true,
    },

    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Shop", shopSchema);