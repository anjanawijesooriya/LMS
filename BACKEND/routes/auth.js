const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");

const {
  register,
  login,
  getUsers,
  getProfile,
  editUser,
  deleteUser,
  forgotpassword,
  resetpassword,
  registerStaff,
  toggleApproval,
} = require("../controllers/auth");

// Public routes
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/forgotpassword").post(forgotpassword);
router.route("/passwordreset/:resetToken").put(resetpassword);

// Admin-only routes
router.route("/registerStaff").post(protect, authorize("admin"), registerStaff);
router.route("/get").get(protect, authorize("admin"), getUsers);
router.route("/delete/:id").delete(protect, authorize("admin"), deleteUser);
router.route("/toggleApproval/:id").put(protect, authorize("admin"), toggleApproval);

// Authenticated routes (any logged-in user)
router.route("/getProfile/:id").get(protect, getProfile);
router.route("/update/:id").put(protect, editUser);

module.exports = router;
