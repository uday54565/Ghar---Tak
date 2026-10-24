const express = require("express");
const multer = require("multer");

const {
  protect,
  authorize
} = require("../middleware/auth.middleware");

const {
  createProduct,
  uploadProductImage,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getProducts
} = require("../controllers/product.controller");

const router = express.Router();
const acceptedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const parseProductImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!acceptedImageTypes.has(file.mimetype)) {
      callback(new Error("Product image must be JPEG, PNG, WebP, or GIF"));
      return;
    }
    callback(null, true);
  },
}).single("image");
const handleProductImageUpload = (req, res, next) => {
  parseProductImage(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "Product image must be 5 MB or smaller"
            : error.message,
      });
    }
    next();
  });
};

router.post(
  "/upload-image",
  protect,
  handleProductImageUpload,
  uploadProductImage
);

// Create Product
router.post(
  "/",
  protect,
  createProduct
);


// Update Product
router.patch(
  "/:id",
  protect,
  updateProduct
);


// Delete Product
router.delete(
  "/:id",
  protect,
  deleteProduct
);

router.get("/", getProducts);
router.get("/mine", protect,  getMyProducts);


module.exports = router;