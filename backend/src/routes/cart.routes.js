const express = require("express");

const {
    addToCart,
    getCart,
    removeFromCart,
    updateCartItem,
    clearCart

} = require("../controllers/cart.controller");
const Product = require("../models/Product");
const { authorize, protect} = require("../middleware/auth.middleware");


const router = express.Router();

router.get(
  "/",
  protect,
  authorize("user"),
  getCart
);

router.post(
  "/",
  protect,
  authorize("user"),
  addToCart
);

router.patch(
  "/:productId",
  protect,
  authorize("user"),
  updateCartItem
);

router.delete(
  "/:productId",
  protect,
  authorize("user"),
  removeFromCart
);

router.delete(
  "/",
  protect,
  authorize("user"),
  clearCart
);

module.exports = router;
