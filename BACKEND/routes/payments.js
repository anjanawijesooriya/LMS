const router = require("express").Router();

const { addPayment, getPayments, approvePayment, rejectPayment } = require("../controllers/payments");

router.route("/add").post(addPayment);

router.route("/").get(getPayments);

router.route("/approve/:id").put(approvePayment);

router.route("/reject/:id").delete(rejectPayment);

module.exports = router;
