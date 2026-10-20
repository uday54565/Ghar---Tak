const Category = require("../models/Category");
const Product = require("../models/Product");
const Shop = require("../models/Shop");

const getOwnerShop = (userId) => Shop.findOne({ owner: userId });

const listCategories = async (req, res) => {
  try {
    const shop = await getOwnerShop(req.user._id);
    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    const categories = await Category.find({ shop: shop._id }).sort({ name: 1 });
    const products = await Product.find({ shop: shop._id }).select("category");
    const productCounts = products.reduce((counts, product) => {
      const name = (product.category || "").toLowerCase();
      counts[name] = (counts[name] || 0) + 1;
      return counts;
    }, {});

    return res.status(200).json({
      success: true,
      categories: categories.map((category) => ({
        ...category.toObject(),
        productCount: productCounts[category.name.toLowerCase()] || 0,
      })),
    });
  } catch (error) {
    console.error("List categories error:", error);
    return res.status(500).json({ success: false, message: "Unable to load categories" });
  }
};

const createCategory = async (req, res) => {
  try {
    const shop = await getOwnerShop(req.user._id);
    const name = req.body.name?.trim();
    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }
    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const duplicate = await Category.findOne({
      shop: shop._id,
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
    if (duplicate) {
      return res.status(409).json({ success: false, message: "Category already exists" });
    }

    const category = await Category.create({
      shop: shop._id,
      name,
      description: req.body.description || "",
      isActive: req.body.isActive !== false,
    });
    return res.status(201).json({ success: true, category });
  } catch (error) {
    console.error("Create category error:", error);
    return res.status(500).json({ success: false, message: "Unable to create category" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const shop = await getOwnerShop(req.user._id);
    const category = shop
      ? await Category.findOne({ _id: req.params.id, shop: shop._id })
      : null;
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const name = req.body.name?.trim();
    if (name) {
      const duplicate = await Category.findOne({
        _id: { $ne: category._id },
        shop: shop._id,
        name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      });
      if (duplicate) {
        return res.status(409).json({ success: false, message: "Category already exists" });
      }
      if (name !== category.name) {
        await Product.updateMany(
          { shop: shop._id, category: category.name },
          { $set: { category: name } }
        );
      }
      category.name = name;
    }
    if (typeof req.body.description === "string") {
      category.description = req.body.description.trim();
    }
    if (typeof req.body.isActive === "boolean") {
      category.isActive = req.body.isActive;
    }

    await category.save();
    return res.status(200).json({ success: true, category });
  } catch (error) {
    console.error("Update category error:", error);
    return res.status(500).json({ success: false, message: "Unable to update category" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const shop = await getOwnerShop(req.user._id);
    const category = shop
      ? await Category.findOne({ _id: req.params.id, shop: shop._id })
      : null;
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const productCount = await Product.countDocuments({
      shop: shop._id,
      category: { $regex: `^${category.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
    if (productCount > 0) {
      return res.status(409).json({
        success: false,
        message: "Move or remove this category's products before deleting it",
      });
    }

    await category.deleteOne();
    return res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Delete category error:", error);
    return res.status(500).json({ success: false, message: "Unable to delete category" });
  }
};

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
