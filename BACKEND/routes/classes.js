const router = require("express").Router();

const {
  addClass,
  getClasses,
  getClass,
  editClass,
  deleteClass,
  cancelClass,
} = require("../controllers/classes");

router.route("/add").post(addClass);
router.route("/").get(getClasses);
router.route("/getClass/:id").get(getClass);
router.route("/update/:id").put(editClass);
router.route("/cancel/:id").put(cancelClass);
router.route("/delete/:id").delete(deleteClass);

module.exports = router;
