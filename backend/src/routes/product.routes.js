const express = require("express");

const { protect, authorize } = require("../middleware/auth.middleware");

const upload = require("../middleware/upload.middleware.js");

const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getOwnerProducts,
} = require("../controllers/product.controller");

const {
  uploadProductImage,
} = require("../controllers/productImage.controller");

const router = express.Router();

// Public: customers ke liye available products
router.get("/", getProducts);

// Shop owner: apne saare products dekhna
router.get("/my-products", protect, authorize("shop_owner"), getOwnerProducts);

// Shop owner: product photo upload karna
router.post(
  "/upload-image",
  protect,
  authorize("shop_owner"),
  upload.single("image"),
  uploadProductImage,
);

// Shop owner: naya product banana
router.post("/", protect, authorize("shop_owner"), createProduct);

// Shop owner: product update karna
router.patch("/:id", protect, authorize("shop_owner"), updateProduct);

// Shop owner: product delete karna
router.delete("/:id", protect, authorize("shop_owner"), deleteProduct);

module.exports = router;
