const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PaymentSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    studentId: { type: String, required: true, index: true },
    month: {
      type: String,
      required: true,
      enum: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ],
    },
    year: { type: Number, required: true, default: () => new Date().getFullYear() },
    amount: { type: Number, required: true },
    remarks: { type: String, default: "" },
    slipImage: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvalDate: { type: Date },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
