const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");

const {
  addPayment,
  getPayments,
  getPaymentById,
  approvePayment,
  rejectPayment,
  deletePayment,
} = require("../controllers/payments");

// Authenticated routes
router.route("/add").post(protect, addPayment);
router.route("/").get(protect, getPayments);
router.route("/:id").get(protect, getPaymentById);

// Admin-only routes
router.route("/approve/:id").put(protect, authorize("admin"), approvePayment);
router.route("/reject/:id").put(protect, authorize("admin"), rejectPayment);
router.route("/delete/:id").delete(protect, authorize("admin"), deletePayment);

module.exports = router;
