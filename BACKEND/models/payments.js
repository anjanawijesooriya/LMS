const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming 'User' model stores student info
    required: true,
  },
  month: {
    type: String,
    required: true,
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
  amount: {
    type: Number,
    require: true,
  },
  paymentSlip: {
    type: String, // This could be a URL to the uploaded file, or a path in your file storage
    required: true,
  },
  remarks: {
    type: String,
    required: true,
  },
  approvalDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", PaymentSchema);
