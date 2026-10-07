const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const createOrder = async (req, res) => {
  try {
    const { deliveryAddress } = req.body;

    // 1. Validate delivery address
    if (!deliveryAddress || !deliveryAddress.trim()) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    // 2. Get customer's cart
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // 3. Cart should not be empty
    if (cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // 4. Create order items using product snapshots
    const orderItems = [];

    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One or more products no longer exist",
        });
      }

      if (!product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is currently unavailable`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
      });
    }

    // 5. Create order
    const order = await Order.create({
      user: req.user._id,

      shop: cart.shop,

      items: orderItems,

      deliveryAddress: deliveryAddress.trim(),

      subtotal: cart.subtotal,

      deliveryFee: cart.deliveryFee,

      discount: cart.discount,

      totalPrice: cart.totalPrice,

      paymentMethod: "cod",

      paymentStatus: "pending",

      orderStatus: "pending",
    });

    // 6. Clear cart after successful order creation
    await Cart.deleteOne({
      _id: cart._id,
    });

    // 7. Send response
    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating order",
    });
  }
};

module.exports = {
  createOrder,
};