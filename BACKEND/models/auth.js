const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    studentId: { type: String, unique: true, sparse: true }, // Only for students

    firstName: {
      type: String,
      required: [true, "Please enter the first name"],
    },
    lastName: { type: String, required: [true, "Please enter the last name"] },

    email: {
      type: String,
      required: [true, "Please enter the email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },

    telephoneNumber: {
      type: String,
      required: [true, "Please enter a valid telephone number"],
      match: [/^\d{10,15}$/, "Please enter a valid phone number"],
    },

    password: { type: String, required: true, select: false, minlength: 6 },

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    grade: {
      type: String,
      required: [true, "Please enter grade"],
    },

    role: {
      type: String,
      enum: ["student", "admin", "teacher"],
      default: "student",
    },

    isApproved: { type: Boolean, default: false }, // Only for students

    membership: {
      status: {
        type: String,
        enum: ["active", "expired", "pending"],
        default: "pending",
      },
      expiryDate: { type: Date, default: null },
      paidMonths: [
        {
          month: {
            type: String,
            enum: [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ],
          },
          year: {
            type: Number,
            required: true,
          },
        },
      ], // Stores the paid months with year
    },
  },
  { timestamps: true }
);

// 🔹 **Before saving a new user**
UserSchema.pre("save", async function (next) {
  // 🔹 Generate a unique Student ID **only for students**
  if (this.role === "student" && !this.studentId) {
    const lastUser = await mongoose
      .model("User")
      .findOne({ role: "student" })
      .sort({ createdAt: -1 });
    const lastIdNumber = lastUser
      ? parseInt(lastUser.studentId.substring(4))
      : 0;
    this.studentId = `STD${String(lastIdNumber + 1).padStart(4, "0")}`;
  }

  // 🔹 Hash password only if modified
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

// 🔹 **Compare entered password with stored hashed password**
UserSchema.methods.matchPasswords = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// 🔹 **Generate JWT token**
UserSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// 🔹 **Generate reset password token**
UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * (60 * 1000); // Token expires in 10 minutes

  return resetToken;
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
