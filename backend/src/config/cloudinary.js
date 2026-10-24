const cloudinary = require("cloudinary").v2;

console.log("Cloudinary config check:", {
  cloudNameLoaded: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
  apiKeyLoaded: Boolean(process.env.CLOUDINARY_API_KEY),
  apiSecretLoaded: Boolean(process.env.CLOUDINARY_API_SECRET),
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;