const Payment = require("../models/payments");

exports.addPayment = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      studentId,
      month,
      amount,
      paymentSlip,
      remarks,
      approvalDate,
      createdAt,
      updatedAt,
    } = req.body;

    const newPayment = new Payment({
      firstName,
      lastName,
      studentId,
      month,
      amount,
      paymentSlip,
      remarks,
      approvalDate,
      createdAt,
      updatedAt,
    });

    const savedPayment = await newPayment.save();
    return res.status(201).json({ success: true, data: savedPayment });
  } catch (error) {
    console.error("Error adding payment", error);
    return res.status(500).json({ success: false, error: error });
  }
};

exports.getPayments = async (req, res) => {
  await Payment.find()
    .then((payments) => res.json(payments))
    .catch((error) => res.status(500).json({ success: false, error: error }));
};
