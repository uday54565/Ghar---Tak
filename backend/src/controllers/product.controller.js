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
    const products = await Product.find({
      isAvailable: true,
    })
      .populate("shop", "shopName address category isOpen")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });

  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
   module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
};
