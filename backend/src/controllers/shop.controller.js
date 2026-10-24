const Shop = require("../models/Shop");

const getShops = async (req, res) => {
    try {
        const shops = await Shop.find({ isOpen: true }).select(
            "shopName address category description isOpen"
        );
        return res.status(200).json({ success: true, shops });
    } catch (error) {
        console.error("Get shops error:", error);
        return res.status(500).json({ success: false, message: "Unable to load shops" });
    }
};

const getMyShop = async (req, res) => {
    try {

        const shop = await Shop.findOne({
            owner: req.user._id,

        });

        if (!shop) {

            return res.status(404).json({
                success: false,
                message: "Shop not found",
            });

        }
        return res.status(200).json({
            success: true,
            shop,
        });

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });


    }


}

const updateMyShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.user._id });
        if (!shop) {
            return res.status(404).json({ success: false, message: "Shop not found" });
        }

        const { shopName, description, category, phone, address, openingTime, closingTime, isOpen } =
            req.body;
        if (shopName !== undefined) {
            if (typeof shopName !== "string" || !shopName.trim()) {
                return res.status(400).json({ success: false, message: "Shop name is required" });
            }
            shop.shopName = shopName.trim();
        }
        if (description !== undefined) shop.description = String(description).trim();
        if (category !== undefined) shop.category = String(category).trim();
        if (phone !== undefined) {
            if (typeof phone !== "string" || !phone.trim()) {
                return res.status(400).json({ success: false, message: "Shop phone is required" });
            }
            shop.phone = phone.trim();
        }
        if (address !== undefined) {
            if (typeof address !== "string" || !address.trim()) {
                return res.status(400).json({ success: false, message: "Shop address is required" });
            }
            shop.address = address.trim();
        }
        if (openingTime !== undefined) shop.openingTime = openingTime;
        if (closingTime !== undefined) shop.closingTime = closingTime;
        if (typeof isOpen === "boolean") shop.isOpen = isOpen;

        await shop.save();
        return res.status(200).json({ success: true, shop });
    } catch (error) {
        console.error("Update shop error:", error);
        return res.status(500).json({ success: false, message: "Unable to update shop" });
    }
};

module.exports = {
    getShops,
    getMyShop,
    updateMyShop,
}