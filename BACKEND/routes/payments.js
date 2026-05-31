const router = require("express").Router();

const {
  addPayment,
  getPayments,
  getPaymentById,
  approvePayment,
  rejectPayment,
  deletePayment,
} = require("../controllers/payments");

router.route("/add").post(addPayment);
router.route("/").get(getPayments);
router.route("/:id").get(getPaymentById);
router.route("/approve/:id").put(approvePayment);
router.route("/reject/:id").put(rejectPayment);
router.route("/delete/:id").delete(deletePayment);

module.exports = router;
