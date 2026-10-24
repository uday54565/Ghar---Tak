const Product = require("../models/Product");
const Shop = require("../models/Shop");
const Category = require("../models/Category");
const Cart = require("../models/Cart");
const cloudinary = require("cloudinary").v2;

const uploadProductImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "A product image is required",
    });
  }

  const cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };
  if (Object.values(cloudinaryConfig).some((value) => !value)) {
    return res.status(500).json({
      success: false,
      message: "Image upload is not configured",
    });
  }

  cloudinary.config(cloudinaryConfig);

  try {
    const imageUrl = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "ghartak/products", resource_type: "image" },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (!result?.secure_url) {
            reject(new Error("Cloudinary did not return an image URL"));
          } else {
            resolve(result.secure_url);
          }
        }
      );
      stream.end(req.file.buffer);
    });

    return res.status(201).json({ success: true, imageUrl });
  } catch (error) {
    console.error("Product image upload error:", error);
    return res.status(502).json({
      success: false,
      message: "Unable to upload product image",
    });
  }
};

const removeProductFromCarts = async (productId) => {
  const carts = await Cart.find({ "items.product": productId });
  for (const cart of carts) {
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId.toString()
    );
    if (cart.items.length === 0) {
      await Cart.deleteOne({ _id: cart._id });
      continue;
    }

    cart.subtotal = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    cart.deliveryFee = cart.subtotal === 0 || cart.subtotal >= 499 ? 0 : 25;
    cart.totalPrice = cart.subtotal + cart.deliveryFee - cart.discount;
    await cart.save();
  }
};

const createProduct = async (req, res) => {

    try {

        const { name, description, price, category, image, isAvailable } = req.body;


            if (!name?.trim() || !Number.isFinite(Number(price)) || Number(price) < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Product name and price are required",
                });
            }
        

            const shop = await Shop.findOne({
      owner: req.user._id,
    });

    if(!shop){
       return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const product  = await Product.create({

        shop: shop._id,
        name: name.trim(),
        price: Number(price),
        description,
        image,
        category,
        isAvailable,
    });

    return res.status(201).json({

        success : true,
        message : " product is created",
        product,
    });

        }
    catch (error) {

            return res.status(500).json({


                success: false,
                message: error.message
            })

        }
    }


    const  updateProduct = async (req,res) => {

        try {
              const { id } = req.params;

    const { name, description, price, category, image, isAvailable } =
      req.body;

    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return res.status(400).json({ success: false, message: "Product name cannot be empty" });
    }
    if (price !== undefined && (!Number.isFinite(Number(price)) || Number(price) < 0)) {
      return res.status(400).json({ success: false, message: "Product price must be a non-negative number" });
    }
    if (isAvailable !== undefined && typeof isAvailable !== "boolean") {
      return res.status(400).json({ success: false, message: "Product availability must be a boolean" });
    }

    const shop = await Shop.findOne({
      owner: req.user._id,
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const product = await Product.findOne({
      _id: id,
      shop: shop._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.name = name?.trim() ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.image = image ?? product.image;
    product.isAvailable = isAvailable ?? product.isAvailable;

    await product.save();
    if (!product.isAvailable) {
      await removeProductFromCarts(product._id);
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });

        }
        catch(error) {
            return res.status(500).json({


                success: false,
                message: error.message
            })

        }
    }



     const  deleteProduct = async (req,res) => {



        try {

            const { id } = req.params;

    const shop = await Shop.findOne({
      owner: req.user._id,
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const product = await Product.findOne({
      _id: id,
      shop: shop._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.deleteOne({
      _id: product._id,
    });
    await removeProductFromCarts(product._id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

        }
        catch(error) {
            return res.status(500).json({


                success: false,
                message: error.message
            })

        }
    }

const getMyProducts = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }
    const products = await Product.find({ shop: shop._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Get owner products error:", error);
    return res.status(500).json({ success: false, message: "Unable to load products" });
  }
};

const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort = "newest",
    } = req.query;

    const filters = [];

    // 1. Available products only (supports existing legacy typo)
    filters.push({
      $or: [
        { isAvailable: true },
        { isAvalable: true },
      ],
    });

    // Escape special regex characters in user input
    const escapeRegex = (value) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // 2. Search by product name or description
    if (search && search.trim()) {
      const keyword = new RegExp(
        escapeRegex(search.trim()),
        "i"
      );

      filters.push({
        $or: [
          { name: keyword },
          { description: keyword },
        ],
      });
    }

    // 3. Filter by category
    if (category && category.trim()) {
      filters.push({
        category: new RegExp(
          `^${escapeRegex(category.trim())}$`,
          "i"
        ),
      });
    }

    // 4. Filter by price range
    const priceFilter = {};

    if (minPrice !== undefined) {
      const min = Number(minPrice);

      if (!Number.isFinite(min) || min < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid minimum price",
        });
      }

      priceFilter.$gte = min;
    }

    if (maxPrice !== undefined) {
      const max = Number(maxPrice);

      if (!Number.isFinite(max) || max < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid maximum price",
        });
      }

      priceFilter.$lte = max;
    }

    if (
      priceFilter.$gte !== undefined &&
      priceFilter.$lte !== undefined &&
      priceFilter.$gte > priceFilter.$lte
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum price cannot exceed maximum price",
      });
    }

    if (Object.keys(priceFilter).length > 0) {
      filters.push({ price: priceFilter });
    }

    // 5. Whitelisted sorting options
    const sortOptions = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name_asc: { name: 1 },
    };

    if (!sortOptions[sort]) {
      return res.status(400).json({
        success: false,
        message: "Invalid sort option",
      });
    }

    // 6. Fetch matching products
    const products = await Product.find({
      $and: filters,
    })
      .populate("shop", "shopName address category isOpen")
      .sort(sortOptions[sort]);

    const openShops = products.filter((product) => product.shop?.isOpen);
    const categories = await Category.find().select("shop name isActive");
    const productsWithActiveCategories = openShops.filter((product) => {
      if (!product.category) return true;
      const productCategory = categories.find(
        (item) =>
          item.shop.toString() === product.shop._id.toString() &&
          item.name.toLowerCase() === product.category.toLowerCase()
      );
      return !productCategory || productCategory.isActive;
    });

    return res.status(200).json({
      success: true,
      count: productsWithActiveCategories.length,
      products: productsWithActiveCategories,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};

module.exports = {
  uploadProductImage,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getProducts,
};
