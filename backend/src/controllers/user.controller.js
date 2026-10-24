const User = require("../models/User");

const getProfile = (req, res) =>
  res.status(200).json({ success: true, user: req.user });

const updateProfile = async (req, res) => {
  try {
    const { name, phone, addresses, wishlist, notificationPreferences } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ success: false, message: "Name is required" });
      }
      user.name = name.trim();
    }
    if (phone !== undefined) {
      if (typeof phone !== "string" || !phone.trim()) {
        return res.status(400).json({ success: false, message: "Phone number is required" });
      }
      const duplicate = await User.findOne({ phone: phone.trim(), _id: { $ne: user._id } });
      if (duplicate) {
        return res.status(409).json({ success: false, message: "Phone number is already registered" });
      }
      user.phone = phone.trim();
    }
    if (addresses !== undefined) {
      if (
        !Array.isArray(addresses) ||
        addresses.some(
          (address) =>
            typeof address.label !== "string" ||
            !address.label.trim() ||
            typeof address.details !== "string" ||
            !address.details.trim()
        )
      ) {
        return res.status(400).json({ success: false, message: "Every address needs a label and details" });
      }
      user.addresses = addresses.map(({ label, details }) => ({
        label: label.trim(),
        details: details.trim(),
      }));
    }
    if (wishlist !== undefined) {
      if (!Array.isArray(wishlist)) {
        return res.status(400).json({ success: false, message: "Wishlist must be an array" });
      }
      user.wishlist = wishlist;
    }
    if (notificationPreferences !== undefined) {
      if (
        !notificationPreferences ||
        typeof notificationPreferences.newOrders !== "boolean" ||
        typeof notificationPreferences.orderUpdates !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message: "Notification preferences are invalid",
        });
      }
      user.notificationPreferences = notificationPreferences;
    }

    await user.save();
    const safeUser = await User.findById(user._id).select(
      "name email phone role isVerified addresses wishlist notificationPreferences createdAt"
    );
    return res.status(200).json({ success: true, user: safeUser });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ success: false, message: "Unable to update profile" });
  }
};

module.exports = { getProfile, updateProfile };
