const express = require("express");
const { createOrder} = require("../controllers/order.controller");
const {protect,authorize} = require("../middleware/auth.middleware")


const router = express.Router();

router.post("/",protect , authorize("user"), createOrder);

module.exports = router;