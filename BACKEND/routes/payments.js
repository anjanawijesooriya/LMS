const router = require("express").Router();

const { addPayment, getPayments } = require("../controllers/payments");

router.route("/add").post(addPayment);

router.route("/").get(getPayments);

module.exports = router;
