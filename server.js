const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cloudinary = require("./BACKEND/utils/cloudinary");

dotenv.config();

const URL = process.env.MONGODB_URL;

mongoose.connect(URL, {});

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("MongoDB was connected Successfully");
});

const app = express();

const PORT = process.env.PORT || 8071;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is up and running in port ${PORT}`);
});

app.use("/api/auth", require("./BACKEND/routes/auth"));
app.use("/courses", require("./BACKEND/routes/courses"));
app.use("/classes", require("./BACKEND/routes/classes"));
app.use("/payments", require("./BACKEND/routes/payments"));
