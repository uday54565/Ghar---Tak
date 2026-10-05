const express = require("express");

const {
  protect,
  authorize
} = require("../middleware/auth.middleware");

const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts
} = require("../controllers/product.controller");

const router = express.Router();


// Create Product
router.post(
  "/",
  protect,
  authorize("shop_owner"),
  createProduct
);


// Update Product
router.patch(
  "/:id",
  protect,
  authorize("shop_owner"),
  updateProduct
);


// Delete Product
router.delete(
  "/:id",
  protect,
  authorize("shop_owner"),
  deleteProduct
);

router.get("/", getProducts);


module.exports = router;