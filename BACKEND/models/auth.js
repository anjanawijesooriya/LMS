const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Counter = require("./counter");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    studentId: { type: String, unique: true, sparse: true },

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

    isApproved: { type: Boolean, default: true },

    profilePhoto: { type: String, default: null },

    membership: {
      status: {
        type: String,
        enum: ["active", "expired", "pending"],
        default: "pending",
      },
      expiryDate: { type: Date, default: null },
      expiryNotified: { type: Boolean, default: false },
      paidMonths: [
        {
          month: { type: String },
        },
      ],
    },
  },
  { timestamps: true }
);

// Atomic Student ID generation using a counter collection
UserSchema.pre("save", async function (next) {
  if (this.role === "student" && !this.studentId) {
    const counter = await Counter.findOneAndUpdate(
      { _id: "studentId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.studentId = `STD${String(counter.seq).padStart(4, "0")}`;
  }

  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

UserSchema.methods.matchPasswords = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * (60 * 1000);

  return resetToken;
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
