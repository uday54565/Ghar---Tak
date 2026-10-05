const Shop = require("../models/Shop");

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
        return res.status(201).json({
            success: true,
            shop,
        });

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: " server erorShop not found",
            message: error.message
        });


    }


}

module.exports = {
    getMyShop
}