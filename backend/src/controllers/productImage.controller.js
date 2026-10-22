
const cloudinary = require("../config/cloudinary");

const uploadProductImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please select an image to upload.",
    });
  }

  const stream = cloudinary.uploader.upload_stream(
    {
      folder: "ghar-tak/products",
      resource_type: "image",
    },
    (error, result) => {
      if (error) {
        console.error("Cloudinary upload error:", error.message);

        return res.status(500).json({
          success: false,
          message: "Image upload failed.",
        });
      }

      return res.status(200).json({
        success: true,
        image: result.secure_url,
        publicId: result.public_id,
      });
    }
  );

  stream.end(req.file.buffer);
};

module.exports = { uploadProductImage };
