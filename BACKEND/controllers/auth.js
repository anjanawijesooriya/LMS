const User = require("../models/auth");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// 🔹 **Register Student**
exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    sendToken(user, 201, res);
  } catch (error) {
    handleError(error, res);
  }
};

// 🔹 **Register Admin/Teacher**
exports.registerStaff = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  try {
    if (!["admin", "teacher"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    sendToken(user, 201, res);
  } catch (error) {
    handleError(error, res);
  }
};

// 🔹 **Login User**
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please enter email and password" });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({
          success: false,
          message: "User does not exist. Please register first.",
        });
    }

    const isMatch = await user.matchPasswords(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔹 **Forgot Password**
exports.forgotpassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email not found" });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/passwordreset/${resetToken}`;
    const message = `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetURL}" clicktracking=off>${resetURL}</a>
    `;

    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      text: message,
    });

    res.status(200).json({ success: true, message: "Reset email sent" });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res
      .status(500)
      .json({ success: false, message: "Email could not be sent" });
  }
};

// 🔹 **Reset Password**
exports.resetpassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    handleError(error, res);
  }
};

// 🔹 **Get All Users**
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 🔹 **Get Profile**
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 🔹 **Edit User**
exports.editUser = async (req, res) => {
  const { firstName, lastName, email } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email },
      { new: true }
    );

    if (!updatedUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 🔹 **Delete User**
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 🔹 **Send Token**
const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
};

// 🔹 **Error Handling**
const handleError = (error, res) => {
  if (error.code === 11000) {
    return res
      .status(400)
      .json({ success: false, message: "Email already exists" });
  }

  if (error.name === "ValidationError") {
    return res
      .status(400)
      .json({
        success: false,
        message: Object.values(error.errors).map((val) => val.message),
      });
  }

  res.status(500).json({ success: false, message: "Internal server error" });
};
