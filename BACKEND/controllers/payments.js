const Payment = require("../models/payments");

// Add Payment
exports.addPayment = async (req, res) => {
  try {
    const { firstName, lastName, studentId, amount, month, remarks } = req.body;

    // Validation
    if (!firstName || !lastName || !studentId || !amount || !month) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newPayment = new Payment({
      firstName,
      lastName,
      studentId,
      amount,
      month,
      remarks,
    });

    await newPayment.save();

    res.status(201).json({ message: "Payment Added Successfully!", data: newPayment });
  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate(
      "studentId",
      "firstName lastName"
    );
    res.status(200).json(payments);
  } catch (error) {
    console.error("Get Payments Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Payment By ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment Not Found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error("Get Payment Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Payment
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment Not Found" });
    }

    res.status(200).json({ message: "Payment Deleted Successfully!" });
  } catch (error) {
    console.error("Delete Payment Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
