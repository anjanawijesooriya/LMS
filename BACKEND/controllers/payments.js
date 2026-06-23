const Payment = require("../models/payments");
const User = require("../models/auth");
const sendEmail = require("../utils/sendEmail");

// Add Payment
exports.addPayment = async (req, res) => {
  try {
    const { firstName, lastName, studentId, amount, month, remarks, slipImage, year } = req.body;

    if (!firstName || !lastName || !studentId || !amount || !month) {
      return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 100000) {
      return res.status(400).json({ success: false, message: "Invalid payment amount" });
    }

    const paymentYear = year || new Date().getFullYear();

    const newPayment = new Payment({
      firstName,
      lastName,
      studentId,
      amount,
      month,
      year: paymentYear,
      remarks: remarks || "",
      slipImage: slipImage || null,
    });

    await newPayment.save();

    res.status(201).json({ success: true, message: "Payment Added Successfully!", data: newPayment });
  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Payments
exports.getPayments = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Payment.countDocuments(),
    ]);

    res.status(200).json({ success: true, data: payments, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get Payments Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get Payment By ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment Not Found" });
    }
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    console.error("Get Payment Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Payment (admin only hard delete for cleanup)
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment Not Found" });
    }
    res.status(200).json({ success: true, message: "Payment Deleted Successfully!" });
  } catch (error) {
    console.error("Delete Payment Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Approve Payment
exports.approvePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment Not Found" });
    }

    if (payment.status === "approved") {
      return res.status(400).json({ message: "Payment is already approved" });
    }

    const user = await User.findOne({ studentId: payment.studentId });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    payment.status = "approved";
    payment.approvalDate = new Date();
    await payment.save();

    const paymentYear = payment.year || new Date().getFullYear();
    const monthIndex = new Date(`${payment.month} 1, ${paymentYear}`).getMonth() + 1;
    // Expiry = 1st of the month AFTER the paid month
    const newExpiryDate = new Date(paymentYear, monthIndex, 1);

    // Never set an expiry in the past: if the calculated date is already past, use end of current month
    const today = new Date();
    const minExpiry = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const effectiveNewExpiry = newExpiryDate < minExpiry ? minExpiry : newExpiryDate;

    // Never let a past-month approval roll back an existing later expiry
    const currentExpiry = user.membership.expiryDate
      ? new Date(user.membership.expiryDate)
      : new Date(0);
    const expiryDate = effectiveNewExpiry > currentExpiry ? effectiveNewExpiry : currentExpiry;

    user.membership.status = "active";
    user.membership.expiryDate = expiryDate;
    user.membership.expiryNotified = false;

    const formattedMonth = `${payment.month}-${paymentYear}`;
    const isMonthPaid = user.membership.paidMonths.some(
      (entry) => entry.month === formattedMonth
    );
    if (!isMonthPaid) {
      user.membership.paidMonths.push({ month: formattedMonth });
    }

    await user.save();

    const message = `
      <h1>Payment Approved ✅</h1>
      <p>Hello ${user.firstName} ${user.lastName},</p>
      <p>Your payment for <strong>${payment.month} ${paymentYear}</strong> has been approved. You can now access your classes via Devians LMS.</p>
      <p>Your membership is active until <strong>${expiryDate.toDateString()}</strong>.</p>
      <br>
      <strong>Devians LMS Team</strong>
    `;

    await sendEmail({
      to: user.email,
      subject: "Payment Approved - Devians LMS",
      html: message,
    });

    res.status(200).json({ success: true, message: "Payment Approved Successfully!" });
  } catch (error) {
    console.error("Payment Approval Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Reject Payment — marks as rejected, keeps record for audit trail
exports.rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment Not Found" });
    }

    if (payment.status === "approved") {
      return res.status(400).json({ message: "Cannot reject an already approved payment" });
    }

    const user = await User.findOne({ studentId: payment.studentId });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    payment.status = "rejected";
    payment.rejectionReason = rejectionReason || "";
    await payment.save();

    const message = `
      <h1>Payment Rejected ❌</h1>
      <p>Hello ${user.firstName} ${user.lastName},</p>
      <p>Unfortunately, your payment for <strong>${payment.month} ${payment.year}</strong> has been rejected.</p>
      ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ""}
      <p>Please contact our support team or resubmit your payment slip if you believe this is a mistake.</p>
      <br>
      <strong>Devians LMS Team</strong>
    `;

    await sendEmail({
      to: user.email,
      subject: "Payment Rejected - Devians LMS",
      html: message,
    });

    res.status(200).json({ success: true, message: "Payment Rejected Successfully!" });
  } catch (error) {
    console.error("Payment Rejection Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
