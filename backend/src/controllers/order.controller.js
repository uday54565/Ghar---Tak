const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Shop = require("../models/Shop");
const Category = require("../models/Category");

const getProductAvailability = (product) => {
  if (!product) return false;
  if (typeof product.isAvailable === "boolean") {
    return product.isAvailable;
  }
  if (typeof product.isAvalable === "boolean") {
    return product.isAvalable;
  }
  return true;
};

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

    const shop = await Shop.findById(cart.shop);
    if (!shop || !shop.isOpen) {
      return res.status(400).json({
        success: false,
        message: "Shop is currently closed",
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

      if (!getProductAvailability(product)) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is currently unavailable`,
        });
      }

      if (
        product.category &&
        (await Category.exists({
          shop: product.shop,
          name: { $regex: `^${product.category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
          isActive: false,
        }))
      ) {
        return res.status(400).json({
          success: false,
          message: `${product.category} products are currently unavailable`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
      });
    }

    const subtotal = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const deliveryFee = subtotal === 0 || subtotal >= 499 ? 0 : 25;
    const discount = cart.discount || 0;

    // 5. Create order
    const order = await Order.create({
      user: req.user._id,

      shop: cart.shop,

      items: orderItems,

      deliveryAddress: deliveryAddress.trim(),

      subtotal,

      deliveryFee,

      discount,

      totalPrice: subtotal + deliveryFee - discount,

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

const getShopOrders = async(req,res) => {

    try{

        const shop = await Shop.findOne({

            owner : req.user._id
        });

        if(!shop){
            return res.status(404).json({

                message : " shop not found",
                success : false
            })
        }

        const orders = await Order.find({
            shop : shop._id,
        })
            .populate("user", "name phone")
            .sort({ createdAt: -1 });

        return res.status(200).json({
  success: true,
  orders
});

    }
    catch(error){

        return res.status(500).json({

            message : error.message,
            success : false
        })
    }


}

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    // 1. Validate status
    const allowedStatuses = [
      "pending",
      "accepted",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    // 2. Find shop owner ki shop
    const shop = await Shop.findOne({
      owner: req.user._id,
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // 3. Order find karo + ensure order isi shop ka hai
    const order = await Order.findOne({
      _id: id,
      shop: shop._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 4. Update status
    order.orderStatus = orderStatus;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating order status",
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate("shop", "shopName address")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching your orders",
    });
  }
};

module.exports = {
  createOrder,
  getShopOrders,
  getMyOrders,
  updateOrderStatus,
};