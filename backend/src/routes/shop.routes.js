const express = require("express");
const {
    protect,
    authorize
     
}  = require("../middleware/auth.middleware");

const { getMyShop} = require("../controllers/shop.controller")

const router = express.Router();

router.get("/my-shop",protect,authorize("shop_owner"),getMyShop);

module.exports = router;