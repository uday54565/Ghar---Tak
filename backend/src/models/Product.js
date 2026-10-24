const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
    {

        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            required: true,
        },

        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
        },

        image: {

            type: String,
            default: "",
            trim: true,
        },

        price: {

            type: Number,
            required: [true, "Product price is required"],
            min: 0
        },
        
        description: {
            type: String,
            trim: true,
            default: "",
        },

        category: {
            type: String,
            trim: true,
            default: "",
        },

        isAvailable: {

            type: Boolean,
            default: true
        },


    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
