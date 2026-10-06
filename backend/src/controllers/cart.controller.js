const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Shop = require("../models/Shop");

const calculateTotals = (cart) => {
  const subtotal = cart.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  cart.subtotal = subtotal;

  cart.totalPrice =
    subtotal + cart.deliveryFee - cart.discount;
};

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    })
      .populate("shop", "shopName address category isOpen")
      .populate("items.product", "name price image category isAvailable");

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: null,
      });
    }

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching cart",
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Product and valid quantity are required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!product.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Product is currently unavailable",
      });
    }

    const shop = await Shop.findById(product.shop);

    if (!shop || !shop.isOpen) {
      return res.status(400).json({
        success: false,
        message: "Shop is currently closed",
      });
    }

    let cart = await Cart.findOne({
      user: req.user._id,
    });

    // New cart
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        shop: shop._id,
        items: [
          {
            product: product._id,
            quantity,
            price: product.price,
          },
        ],
      });
    } else {
      // Prevent products from different shops in same cart
      if (cart.shop.toString() !== shop._id.toString()) {
        return res.status(400).json({
          success: false,
          message:
            "You can only add products from one shop at a time",
        });
      }

      const existingItem = cart.items.find(
        (item) =>
          item.product.toString() === product._id.toString()
      );

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.price = product.price;
      } else {
        cart.items.push({
          product: product._id,
          quantity,
          price: product.price,
        });
      }
    }

    calculateTotals(cart);

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while adding product to cart",
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) =>
        item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    const product = await Product.findById(productId);

    if (!product || !product.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Product is unavailable",
      });
    }

    item.quantity = quantity;
    item.price = product.price;

    calculateTotals(cart);

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Update cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating cart",
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemExists = cart.items.some(
      (item) =>
        item.product.toString() === productId
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    cart.items = cart.items.filter(
      (item) =>
        item.product.toString() !== productId
    );

    if (cart.items.length === 0) {
      await Cart.deleteOne({
        _id: cart._id,
      });

      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        cart: null,
      });
    }

    calculateTotals(cart);

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while removing product",
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndDelete({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while clearing cart",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};