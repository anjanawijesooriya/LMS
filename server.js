const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const cloudinary = require("./BACKEND/utils/cloudinary");
const resetExpiredMemberships = require("./BACKEND/utils/cronJobs");
const sendPaymentReminders = require("./BACKEND/utils/paymentReminderJob");

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set. Exiting.");
  process.exit(1);
}

const URL = process.env.MONGODB_URL;

mongoose.connect(URL, {});

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("MongoDB was connected Successfully");
});

const app = express();

const PORT = process.env.PORT || 8071;

// Security headers
app.use(helmet({ crossOriginResourcePolicy: false }));

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Strip MongoDB operators from user input
app.use(mongoSanitize());

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT) || 20,
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.API_RATE_LIMIT) || 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgotpassword", authLimiter);
app.use("/api/", apiLimiter);

// Start cron jobs
resetExpiredMemberships();
sendPaymentReminders();

app.listen(PORT, () => {
  console.log(`Server is up and running in port ${PORT}`);
});

app.use("/api/auth", require("./BACKEND/routes/auth"));
app.use("/courses", require("./BACKEND/routes/courses"));
app.use("/classes", require("./BACKEND/routes/classes"));
app.use("/payments", require("./BACKEND/routes/payments"));
app.use("/upload", require("./BACKEND/routes/upload"));

// Global error handler
app.use((err, req, res, next) => {
  const userId = req.user ? req.user._id : "unauthenticated";
  console.error(`[${req.method}] ${req.path} | user: ${userId} | ${err.stack}`);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error" });
});
