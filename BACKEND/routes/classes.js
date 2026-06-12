const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");

const {
  addClass,
  getClasses,
  getClass,
  editClass,
  deleteClass,
  cancelClass,
} = require("../controllers/classes");

// Authenticated routes
router.route("/").get(protect, getClasses);
router.route("/getClass/:id").get(protect, getClass);

// Admin/Teacher only routes
router.route("/add").post(protect, authorize("admin", "teacher"), addClass);
router.route("/update/:id").put(protect, authorize("admin", "teacher"), editClass);
router.route("/cancel/:id").put(protect, authorize("admin", "teacher"), cancelClass);
router.route("/delete/:id").delete(protect, authorize("admin", "teacher"), deleteClass);

module.exports = router;
