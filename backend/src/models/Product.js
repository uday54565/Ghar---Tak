const mongoose = require("mongoose");
const Shop = require("./Shop");

const productSchema = new mongoose.Schema(
    {

        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            required: true,
        },

        name: {

            required: [true, " product name is required"],
            type: String,
            ref: Shop
        },

        image: {

            type: String,
    default : " "
        },

        price: {

            type: Number,
            require: [true, " product price is required"],
            min: 0
        },
        
          description: {
      type: String,
      trim: true,
    },

        isAvalable: {

            type: Boolean,
            default: true
        },


    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model("product", productSchema);