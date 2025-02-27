const dotenv = require("dotenv");
const cloudinary = require("cloudinary").v2;

dotenv.config();

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_APIKEY, 
    api_secret: process.env.CLOUDINARY_APISECRET // Click 'View API Keys' above to copy your API secret
});

module.exports = cloudinary;