const express = require("express");
const {
    protect,
    authorize
     
}  = require("../middleware/auth.middleware");

const { getShops, getMyShop, updateMyShop} = require("../controllers/shop.controller")

const router = express.Router();

router.get("/", getShops);
router.get("/my-shop",protect,authorize("shop_owner"),getMyShop);
router.patch("/my-shop",protect,authorize("shop_owner"),updateMyShop);

module.exports = router;