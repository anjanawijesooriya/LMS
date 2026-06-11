const dotenv = require("dotenv");
dotenv.config();

const cloudinary = require("cloudinary").v2;

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET, // Click 'View API Keys' above to copy your API secret
});

console.log("Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_NAME        ? "✅ set" : "❌ missing",
  api_key:    process.env.CLOUDINARY_APIKEY      ? "✅ set" : "❌ missing",
  api_secret: process.env.CLOUDINARY_APISECRET   ? "✅ set" : "❌ missing",
});

module.exports = cloudinary;
