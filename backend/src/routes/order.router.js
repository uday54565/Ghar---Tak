const express = require("express");
const { createOrder,updateOrderStatus,getShopOrders , getMyOrders} = require("../controllers/order.controller");
const {protect,authorize} = require("../middleware/auth.middleware")


const router = express.Router();

router.post("/",protect , authorize("user"), createOrder);

router.get("/", protect,authorize("shop_owner"),getShopOrders);

router.get("/my-orders", protect, authorize("user"), getMyOrders);
router.patch(
  "/:id/status",
  protect,
  authorize("shop_owner"),
  updateOrderStatus
);

module.exports = router;