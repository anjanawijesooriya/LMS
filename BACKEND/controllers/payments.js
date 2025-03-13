const Payment = require("../models/payments");
const User = require("../models/auth");

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

    res
      .status(201)
      .json({ message: "Payment Added Successfully!", data: newPayment });
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

// Approve Payment
exports.approvePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Find the payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment Not Found" });
    }

    // Find the user using studentId
    const user = await User.findOne({ studentId: payment.studentId });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    // Update payment status
    payment.status = "approved";
    payment.approvalDate = new Date();
    await payment.save();

    // Update user's membership
    const currentDate = new Date();
    const expiryDate = new Date(
      currentDate.setMonth(currentDate.getMonth() + 1)
    );

    user.membership.status = "active";
    user.membership.expiryDate = expiryDate;

    // Add the approved month to the paidMonths array if not already added
    const isMonthPaid = user.membership.paidMonths.some(
      (entry) => entry.month === payment.month
    );

    if (!isMonthPaid) {
      user.membership.paidMonths.push({ month: payment.month });
    }

    await user.save();

    res.status(200).json({ message: "Payment Approved Successfully!" });
  } catch (error) {
    console.error("Payment Approval Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Reject Payment
exports.rejectPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Find the payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment Not Found" });
    }

    // Reject and delete the payment
    await Payment.findByIdAndDelete(paymentId);

    res
      .status(200)
      .json({ message: "Payment Rejected and Deleted Successfully!" });
  } catch (error) {
    console.error("Payment Rejection Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
