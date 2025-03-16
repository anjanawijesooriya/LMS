const Payment = require("../models/payments");
const User = require("../models/auth");
const sendEmail = require("../utils/sendEmail");

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
    const { id } = req.params;

    // Find the payment
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment Not Found" });
    }

    // Find the user using studentId
    const user = await User.findOne({ studentId: payment.studentId });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    // Send approval email
    const message = `
      <h1>Payment Approved ✅</h1>
      <p>Hello ${user.firstName} ${user.lastName},</p>
      <p>Your payment of ${payment.month} has been approved✅. You can now access your classes via Devians LMS</p>
      <p>If you need further assistance, please contact our support team.</p>
      <br>
      <strong>Devians LMS Team</strong>
    `;

    await sendEmail({
      to: user.email,
      subject: "Payment Approved - Devians LMS",
      html: message,
    });

    // Update payment status
    payment.status = "approved";
    payment.approvalDate = new Date();
    await payment.save();

    // Function to get the expiry date (1st day of the next month at 00:00 AM)
    const getExpiryDate = (month, year) => {
      return new Date(year, month, 1); // This sets the time to 00:00 AM on the 1st of next month
    };

    // Get the current year
    const currentYear = new Date().getFullYear();

    // Get the month index (January = 0, February = 1, ..., December = 11)
    const monthIndex =
      new Date(`${payment.month} 1, ${currentYear}`).getMonth() + 1;

    // Get the last day of the month
    const expiryDate = getExpiryDate(monthIndex, currentYear);

    // Set expiry date to the last day of the selected month
    user.membership.status = "active";
    user.membership.expiryDate = expiryDate;

    // Format month as "Month-Year"
    const formattedMonth = `${payment.month}-${currentYear}`;

    // Check if the month-year is already recorded
    const isMonthPaid = user.membership.paidMonths.some(
      (entry) => entry.month === formattedMonth
    );

    // Store in "Month-Year" format if not already paid
    if (!isMonthPaid) {
      user.membership.paidMonths.push({ month: formattedMonth });
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
    const { id } = req.params;

    // Find the payment
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment Not Found" });
    }

    // Find the user using studentId
    const user = await User.findOne({ studentId: payment.studentId });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    // Send rejection email
    const message = `
      <h1>Payment Rejected ❌</h1>
      <p>Hello ${user.firstName} ${user.lastName},</p>
      <p>Unfortunately, your payment of ${payment.month} has been rejected.</p>
      <p>If you believe this is a mistake, please contact our support team.</p>
      <br>
      <strong>Devians LMS Team</strong>
    `;

    await sendEmail({
      to: user.email,
      subject: "Payment Rejected - Devians LMS",
      html: message,
    });

    // Reject and delete the payment
    await Payment.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Payment Rejected and Deleted Successfully!" });
  } catch (error) {
    console.error("Payment Rejection Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
