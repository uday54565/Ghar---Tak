const Product = require("../models/Product");
const Shop = require("../models/Shop");

const createProduct = async (req, res) => {

    try {

        const { name, description, price, category, image } = req.body;


            if (!name || price === undefined) {
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
        name,
        price,
        description,
        image,
        category
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

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.image = image ?? product.image;
    product.isAvailable = isAvailable ?? product.isAvailable;

    await product.save();

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

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

        }
        catch(error) {
            return res.status(500).json({


                success: false,
                message: "Server error while creating product",
                message: error.message
            })

        }
    }

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

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
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
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
};
