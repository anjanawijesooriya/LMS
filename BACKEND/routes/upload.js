const router = require("express").Router();
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");
const { protect } = require("../middleware/auth");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP, or GIF images are allowed"), false);
    }
  },
});

router.post("/", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const folder = req.query.folder || "lms-uploads";

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.status(200).json({ success: true, url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message || "Upload failed" });
  }
});

module.exports = router;
