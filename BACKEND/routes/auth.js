const router = require("express").Router();

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

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/get").get(getUsers);
router.route("/getProfile/:id").get(getProfile);
router.route("/update/:id").put(editUser);
router.route("/delete/:id").delete(deleteUser);
router.route("/forgotpassword").post(forgotpassword);
router.route("/passwordreset/:resetToken").put(resetpassword);
router.route("/registerStaff").post(registerStaff);
router.route("/toggleApproval/:id").put(toggleApproval);

module.exports = router;
